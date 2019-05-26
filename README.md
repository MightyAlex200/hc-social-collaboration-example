# Example "Social Collaboration" Holochain application
This is a simple example Holochain app.

## Getting started

### Dependencies

This project is build on [Holochain](https://holochain.org/), which has a GitHub repo found [here](https://github.com/holochain/holochain-rust). To install Holochain, you will need a few things first:
- [NodeJS](https://nodejs.org/en/), Version 11.13.0 is what this repo was created with, although older versions should work up to 8.x.x
- [Rust](https://rustup.rs/), specifically `nightly-2019-01-24` which you can install with the command `rustup default nightly-2019-01-24`
- Rust WASM target. Using `rustup` you can install this with `rustup target add wasm32-unknown-unknown`
- **[OPTIONAL, NOT RECOMMENDED FOR NEW USERS]** [n3h](https://github.com/holochain/n3h) for networking

---

#### Downloading Holochain

Once you have these dependencies, you can install Holochain by going to the [releases](https://github.com/holochain/holochain-rust/releases) section of the repository and downloading version **v0.0.16-alpha1**. You are looking for the file that starts with `cli-v0.0.16-alpha1-x86_64` (32-bit computers are not supported) and has your OS listed (`apple-darwin` for macOS, `pc-windows-msvc` for Windows, `generic-linux-gnu` for GNU/Linux computers). Do **not** download the file that starts with `container`, as that is an application intended for deployment, and not development.

After you've downloaded and extracted the files to a folder where they will be moved or deleted, you must add that folder to your path variable. If you are unaware, the path variable is a list of folders where the computer looks to find executable programs that you run from the command line.

---

#### Changing the path variable

>*It is important that the folder you add to the path contains the file named `hc`*.

If you are running macOS or GNU/Linux, the instructions for changing your path variable are as follows:
1. Navigate to the file with `hc` in the terminal (such that running `./hc` will execute the program)
1. Run the following command:

        echo "export PATH=\"`pwd`\":\$PATH" >> ~/.bashrc

**NOTE: Your directory name must NOT contain any `"` characters**

If you are running Windows, you can find a website detailing how to change your path variable [here](https://www.computerhope.com/issues/ch000549.htm)

---

### Downloading, compiling, and running the project

#### Downloading

If you have [git](https://git-scm.com/) installed, you can simply run `git clone https://github.com/MightyAlex200/hc-social-collaboration-example` to download the latest version of the repository. If not, you can simply press the green `Clone or download` button on GitHub to download a zip that you will need to extact.

#### Compiling

>*Before trying to compile the project, please ensure that you've installed all of the dependencies for Holochain, as well as Holochain itself.*

Once you've downloaded the project, all you need to do is run `hc test` at the root of the project in a terminal window, which will compile the project (this make take some time), and run the automated tests.

#### Running

If you have successfully compiled the project, you can run it by running `hc run` at the root of the project in a terminal window. It should say "Running websocket server on port 8888" in the terminal. You may now interact with the development conductor by json-rpc in websockets on port 8888 of `localhost`. An interactive UI is coming soon.

## API
The `socialcollaboration` zome contains the following functions
- `add_skill`
- `remove_skill`
- `get_skills`
- `get_my_skills`
- `create_thread`
- `get_thread_posts`
- `get_threads`
- `get_thread`
- `get_relevant_threads`
- `get_required_skills`
- `create_post`

Check `zomes/socialcollaboration/code/src/lib.rs` for more info
