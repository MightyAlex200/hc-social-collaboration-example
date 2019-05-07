// This test file uses the tape testing framework.
// To learn more, go here: https://github.com/substack/tape
const { Config, Scenario } = require('@holochain/holochain-nodejs');
Scenario.setTape(require('tape'));

const dnaPath = './dist/social-collaboration.dna.json';
const agentAlice = Config.agent('alice');
const dna = Config.dna(dnaPath);
const instanceAlice = Config.instance(agentAlice, dna);
const scenario = new Scenario([instanceAlice]);

scenario.runTape('test', async (t, { alice }) => {
    // Test `add_skill`
    const skill_addr = await alice.callSync('socialcollaboration', 'add_skill', { skill: 'programming' });
    t.deepEquals(skill_addr, { Ok: 'QmVDar5WaMc4af2sCzrx2i3LxttAddLeTw19qW8oRL2buK' }, 'skills can be added');

    // Test `get_my_skills` (also tests `get_skills`)
    const skills = await alice.callSync('socialcollaboration', 'get_my_skills', {});
    t.deepEquals(skills, { Ok: ['programming'] }, 'skills are stored');

    // Test `create_thread`
    const thread_addr = await alice.callSync('socialcollaboration', 'create_thread', {
        title: 'test thread',
        utc_unix_time: 0,
        required_skills: ['programming']
    });
    t.deepEquals(thread_addr, { Ok: 'QmUWrNGG9ZMX4D3BFxPbVTTFFKZn8veVb7LP6ETV8o6reM' }, 'threads can be made');

    // Test `get_thread`
    const thread = await alice.callSync('socialcollaboration', 'get_thread', {
        address: thread_addr.Ok,
    });
    t.deepEquals(
        thread,
        {
            Ok: {
                title: 'test thread',
                timestamp: '1970-01-01T00:00:00+00:00',
                creator: 'HcScjwO9ji9633ZYxa6IYubHJHW6ctfoufv5eq4F7ZOxay8wR76FP4xeG9pY3ui'
            }
        },
        'threads can be read'
    );

    // Test `get_required_skills`
    const required_skills = await alice.callSync('socialcollaboration', 'get_required_skills', {
        thread: thread_addr.Ok,
    });
    t.deepEquals(required_skills, { Ok: ['programming'] }, 'threads have required skills');

    // Test `create_post`
    const post_addr = await alice.callSync('socialcollaboration', 'create_post', {
        content: 'test post',
        utc_unix_time: 0,
        thread: thread_addr.Ok,
    });
    t.deepEquals(post_addr, { Ok: 'QmZiFNrgtukQED6x7SF6yFNXYsU8x8WFoQhVXuDbSqEhPd' }, 'posts can be made on threads');

    // Test `get_thread_posts`
    const thread_posts = await alice.callSync('socialcollaboration', 'get_thread_posts', {
        thread: thread_addr.Ok,
    });
    t.deepEquals(
        thread_posts,
        {
            Ok: [
                {
                    content: 'test post',
                    timestamp: '1970-01-01T00:00:00+00:00',
                    creator: 'HcScjwO9ji9633ZYxa6IYubHJHW6ctfoufv5eq4F7ZOxay8wR76FP4xeG9pY3ui'
                }
            ]
        },
        'posts can be read from threads',
    );

    // Test `get_threads`
    const threads = await alice.callSync('socialcollaboration', 'get_threads', {});
    t.deepEquals(
        threads,
        { Ok: { links: [{ address: thread_addr.Ok, headers: [] }] } },
        'threads can be found'
    );

    // Test `get_relevant_threads`
    const relevant_threads = await alice.callSync('socialcollaboration', 'get_relevant_threads', {});
    t.deepEquals(
        relevant_threads,
        { Ok: [thread_addr.Ok] },
        'relevant threads can be found'
    );

    // Test `remove_skill`
    const skill_removed = await alice.callSync('socialcollaboration', 'remove_skill', { skill: 'programming' });
    t.deepEquals(skill_removed, { Ok: null }, 'skills can be removed');

    // Test `get_username`
    const username = await alice.callSync(
        'socialcollaboration',
        'get_username',
        {
            agent_address:
                'HcScjwO9ji9633ZYxa6IYubHJHW6ctfoufv5eq4F7ZOxay8wR76FP4xeG9pY3ui'
        }
    );
    t.deepEquals(username, { Ok: 'alice' }, 'usernames can be retrieved from agent addresses')
});
