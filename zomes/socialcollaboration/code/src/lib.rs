#![feature(try_from)]
#[macro_use]
extern crate hdk;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
#[macro_use]
extern crate holochain_core_types_derive;

use hdk::{
    holochain_wasm_utils::api_serialization::get_links::GetLinksResult,
    entry_definition::ValidatingEntryType,
    error::{ZomeApiResult, ZomeApiError},
};
use hdk::holochain_core_types::{
    cas::content::Address, entry::Entry, dna::entry_types::Sharing, error::HolochainError, json::JsonString,
    validation::{LinkValidationData, EntryValidationData},
    time::Iso8601
};

/// Username of an agent. Used instead of string to get around issues of
/// serialization with `ZomeApiResult<String>`
#[derive(Debug, Clone, PartialEq, DefaultJson, Serialize, Deserialize)]
struct Username(String);

/// Get the username of an agent
fn handle_get_username(agent_address: Address) -> ZomeApiResult<Username> {
    let entry = hdk::get_entry(&agent_address)?;
    match entry {
        Some(Entry::AgentId(agent_id)) => Ok(Username(agent_id.nick)),
        _ => Err(ZomeApiError::Internal(
            "Address did not lead to agent id.".to_string()
        )),
    }
}

/// Skill that a user claims to have. Will let them see threads that need the
/// skills they have
#[derive(Debug, Clone, PartialEq, DefaultJson, Serialize, Deserialize)]
struct Skill(String);

/// Retrieve the skills a user claims to have
fn handle_get_skills(address: Address) -> ZomeApiResult<Vec<Skill>> {
    hdk::utils::get_links_and_load_type(&address, "skill")
}

/// Retrieve the skills the current user claims to have
fn handle_get_my_skills() -> ZomeApiResult<Vec<Skill>> {
    handle_get_skills(hdk::AGENT_ADDRESS.clone())
}

/// Add a skill to the current user
fn handle_add_skill(skill: Skill) -> ZomeApiResult<Address> {
    hdk::utils::commit_and_link(&Entry::App("skill".into(), skill.into()), &hdk::AGENT_ADDRESS, "skill")
}

/// Remove a skill from the current user
fn handle_remove_skill(skill: Skill) -> ZomeApiResult<()> {
    let skill_address = hdk::entry_address(&Entry::App("skill".into(), skill.into()))?;
    hdk::remove_entry(&skill_address)
}

/// Data structure representing a thread of discussion (like internet forums)
#[derive(Debug, Clone, PartialEq, DefaultJson, Serialize, Deserialize)]
struct Thread {
    title: String,
    timestamp: Iso8601,
    creator: Address,
}

/// Singleton base structure that all threads are linked from
#[derive(Debug, Clone, PartialEq, DefaultJson, Serialize, Deserialize)]
struct ThreadBase;

/// Retrieves the address of the thread base
fn thread_base() -> ZomeApiResult<Address> {
    hdk::commit_entry(&Entry::App("thread_base".into(), ThreadBase.into()))
}

/// Create a thread
fn handle_create_thread(title: String, utc_unix_time: u64, required_skills: Vec<Skill>) -> ZomeApiResult<Address> {
    let entry_address = hdk::commit_entry(&Entry::App(
        "thread".into(),
        Thread {
            title,
            timestamp: utc_unix_time.into(),
            creator: hdk::AGENT_ADDRESS.clone(),
        }.into()
    ))?;

    for required_skill in required_skills {
        let skill_entry_address = hdk::commit_entry(&Entry::App(
            "skill".into(),
            required_skill.into(),
        ))?;
        hdk::link_entries(&entry_address, &skill_entry_address, "required")?;
    }

    hdk::link_entries(&thread_base()?, &entry_address, "thread")?;

    Ok(entry_address)
}

/// Get a threads posts
fn handle_get_thread_posts(thread: Address) -> ZomeApiResult<Vec<Post>> {
    hdk::utils::get_links_and_load_type(&thread, "post")
}

/// Get all threads' addresses
fn handle_get_threads() -> ZomeApiResult<GetLinksResult> {
    hdk::get_links(&thread_base()?, "thread")
}

/// Get the thread data structure from an address
fn handle_get_thread(address: Address) -> ZomeApiResult<Thread> {
    hdk::utils::get_as_type(address)
}

/// Get the required skills of a thread
fn handle_get_required_skills(thread: Address) -> ZomeApiResult<Vec<Skill>> {
    hdk::utils::get_links_and_load_type(&thread, "required")
}

/// Get the threads with a required skill that you have
fn handle_get_relevant_threads() -> ZomeApiResult<Vec<Address>> {
    let relevant_skills = handle_get_my_skills()?;
    let threads = handle_get_threads()?.addresses().clone();
    Ok(threads
        .into_iter()
        .filter(|thread_address| {
            let required_skills: Vec<Skill> = match hdk::utils::get_links_and_load_type(&thread_address, "required") {
                Ok(skills) => skills,
                Err(_) => return false,
            };
            required_skills
                .into_iter()
                .any(|required_skill| relevant_skills.contains(&required_skill))
        })
        .collect()
    )
}

/// Represents a comment in a thread of discussion
#[derive(Debug, Clone, PartialEq, DefaultJson, Serialize, Deserialize)]
struct Post {
    content: String,
    timestamp: Iso8601,
    creator: Address,
}

/// Create a post on a thread
fn handle_create_post(content: String, utc_unix_time: u64, thread: Address) -> ZomeApiResult<Address> {
    let post = Post {
        content,
        timestamp: utc_unix_time.into(),
        creator: hdk::AGENT_ADDRESS.clone(),
    };

    let entry = Entry::App("post".into(), post.into());
    hdk::utils::commit_and_link(&entry, &thread, "post")
}

define_zome! {
    entries: [
        entry!(
            name: "skill",
            description: "a skill that somebody claims to have",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },

            validation: | _validation_data: hdk::EntryValidationData<Skill>| {
                Ok(())
            },

            links: [
                from!(
                    "%agent_id",
                    tag: "skill",

                    validation_package: || {
                        hdk::ValidationPackageDefinition::Entry
                    },

                    validation: |link_validation_data: hdk::LinkValidationData| {
                        let (link_data, validation_data) =
                            match link_validation_data {
                                LinkValidationData::LinkAdd {
                                    link,
                                    validation_data,
                                } => (link, validation_data),
                                LinkValidationData::LinkRemove {
                                    link,
                                    validation_data,
                                } => (link, validation_data),
                            };
                        
                        let link = link_data.link();

                        if validation_data.package.chain_header.provenances()
                            .into_iter()
                            .all(|provenance| &provenance.source() == link.base())
                        {
                            Ok(())
                        } else {
                            Err("Cannot edit other people's skills".to_string())
                        }
                    }
                )
            ]
        ),
        entry!(
            name: "thread_base",
            description: "base for all threads to link from",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },

            validation: |validation_data: hdk::EntryValidationData<ThreadBase>| {
                match validation_data {
                    EntryValidationData::Delete { .. } => Err("Cannot delete thread base".to_string()),
                    _ => Ok(()),
                }
            }
        ),
        entry!(
            name: "thread",
            description: "a thread of discussion",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },

            validation: |validation_data: hdk::EntryValidationData<Thread>| {
                let not_ok = Err("`creator` field does not match chain header".to_string());
                match validation_data {
                    EntryValidationData::Create {
                        validation_data,
                        entry,
                    } => {
                        if validation_data.package.chain_header.provenances()
                            .into_iter()
                            .all(|provenance| provenance.source() == entry.creator)
                        {
                            Ok(())
                        } else {
                            not_ok
                        }
                    }
                    EntryValidationData::Modify {
                        new_entry,
                        old_entry,
                        ..
                    } => {
                        if new_entry.creator == old_entry.creator {
                            Ok(())
                        } else {
                            not_ok
                        }
                    }
                    EntryValidationData::Delete {
                        old_entry,
                        validation_data,
                        ..
                    } => {
                        if validation_data.package.chain_header.provenances()
                            .into_iter()
                            .all(|provenance| provenance.source() == old_entry.creator)
                        {
                            Ok(())
                        } else {
                            not_ok
                        }
                    }
                }
            },

            links: [
                to!(
                    "skill",
                    tag: "required",

                    validation_package: || {
                        hdk::ValidationPackageDefinition::Entry
                    },

                    validation: |link_validation_data: hdk::LinkValidationData| {
                        let (link_data, validation_data) =
                            match link_validation_data {
                                LinkValidationData::LinkAdd {
                                    link,
                                    validation_data,
                                } => (link, validation_data),
                                LinkValidationData::LinkRemove {
                                    link,
                                    validation_data,
                                } => (link, validation_data),
                            };
                        
                        let link = link_data.link();

                        let base_thread: Thread =
                            hdk::utils::get_as_type(link.base().clone())
                            .map_err(|_| "Base was not Thread".to_string())?;

                        if validation_data.package.chain_header.provenances()
                            .into_iter()
                            .all(|provenance| provenance.source() == base_thread.creator)
                        {
                            Ok(())
                        } else {
                            Err("Cannot set requirements for other people's threads".to_string())
                        }
                    }
                ),
                from!(
                    "thread_base",
                    tag: "thread",

                    validation_package: || {
                        hdk::ValidationPackageDefinition::Entry
                    },

                    validation: |link_validation_data: hdk::LinkValidationData| {
                        Ok(())
                    }
                )
            ]
        ),
        entry!(
            name: "post",
            description: "a discussion post",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },

            validation: |validation_data: hdk::EntryValidationData<Post>| {
                let not_ok = Err("`creator` field does not match chain header".to_string());
                match validation_data {
                    EntryValidationData::Create {
                        validation_data,
                        entry,
                    } => {
                        if validation_data.package.chain_header.provenances()
                            .into_iter()
                            .all(|provenance| provenance.source() == entry.creator)
                        {
                            Ok(())
                        } else {
                            not_ok
                        }
                    }
                    EntryValidationData::Modify {
                        new_entry,
                        old_entry,
                        ..
                    } => {
                        if new_entry.creator == old_entry.creator {
                            Ok(())
                        } else {
                            not_ok
                        }
                    }
                    EntryValidationData::Delete {
                        old_entry,
                        validation_data,
                        ..
                    } => {
                        if validation_data.package.chain_header.provenances()
                            .into_iter()
                            .all(|provenance| provenance.source() == old_entry.creator)
                        {
                            Ok(())
                        } else {
                            not_ok
                        }
                    }
                }
            },

            links: [
                from!(
                    "thread",
                    tag: "post",

                    validation_package: || {
                        hdk::ValidationPackageDefinition::Entry
                    },

                    validation: |link_validation_data: hdk::LinkValidationData| {
                        let (link_data, validation_data) =
                            match link_validation_data {
                                LinkValidationData::LinkAdd {
                                    link,
                                    validation_data,
                                } => (link, validation_data),
                                LinkValidationData::LinkRemove {
                                    link,
                                    validation_data,
                                } => (link, validation_data),
                            };
                        
                        let link = link_data.link();

                        let target_post: Post =
                            hdk::utils::get_as_type(link.target().clone())
                            .map_err(|_| "Target was not Post".to_string())?;

                        if validation_data.package.chain_header.provenances()
                            .into_iter()
                            .all(|provenance| provenance.source() == target_post.creator)
                        {
                            Ok(())
                        } else {
                            Err("Cannot link/unlink other people's posts".to_string())
                        }
                    }
                )
            ]
        )
    ]

    genesis: || { Ok(()) }

    functions: [
        get_username: {
            inputs: |agent_address: Address|,
            outputs: |result: ZomeApiResult<Username>|,
            handler: handle_get_username
        }
        add_skill: {
            inputs: |skill: Skill|,
            outputs: |result: ZomeApiResult<Address>|,
            handler: handle_add_skill
        }
        remove_skill: {
            inputs: |skill: Skill|,
            outputs: |result: ZomeApiResult<()>|,
            handler: handle_remove_skill
        }
        get_skills: {
            inputs: |address: Address|,
            outputs: |result: ZomeApiResult<Vec<Skill>>|,
            handler: handle_get_skills
        }
        get_my_skills: {
            inputs: | |,
            outputs: |result: ZomeApiResult<Vec<Skill>>|,
            handler: handle_get_my_skills
        }
        create_thread: {
            inputs: |title: String, utc_unix_time: u64, required_skills: Vec<Skill>|,
            outputs: |result: ZomeApiResult<Address>|,
            handler: handle_create_thread
        }
        get_thread_posts: {
            inputs: |thread: Address|,
            outputs: |result: ZomeApiResult<Vec<Post>>|,
            handler: handle_get_thread_posts
        }
        get_threads: {
            inputs: | |,
            outputs: |result: ZomeApiResult<GetLinksResult>|,
            handler: handle_get_threads
        }
        get_thread: {
            inputs: |address: Address|,
            outputs: |result: ZomeApiResult<Thread>|,
            handler: handle_get_thread
        }
        get_relevant_threads: {
            inputs: | |,
            outputs: |result: ZomeApiResult<Vec<Address>>|,
            handler: handle_get_relevant_threads
        }
        get_required_skills: {
            inputs: |thread: Address|,
            outputs: |result: ZomeApiResult<Vec<Skill>>|,
            handler: handle_get_required_skills
        }
        create_post: {
            inputs: |content: String, utc_unix_time: u64, thread: Address|,
            outputs: |result: ZomeApiResult<Address>|,
            handler: handle_create_post
        }
    ]

    traits: {
        hc_public [
            get_username,
            add_skill,
            remove_skill,
            get_skills,
            get_my_skills,
            create_thread,
            get_thread_posts,
            get_threads,
            get_thread,
            get_relevant_threads,
            get_required_skills,
            create_post
        ]
    }
}
