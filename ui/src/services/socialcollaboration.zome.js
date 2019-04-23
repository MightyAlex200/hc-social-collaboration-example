import { connect } from '@holochain/hc-web-client';

const URL = 'ws://localhost:8888';
const instanceId = 'test-instance';
const zome = 'socialcollaboration';

const callZome = (fn, param) => connect(URL).then(({callZome, close}) => callZome(instanceId, zome, fn)(param = {}));

export default {
  add_skill: (param = {}) => callZome('add_skill', param),
  get_my_skills: (param = {}) => callZome('get_my_skills', param),
  create_thread: (param = {}) => callZome('create_thread', param),
  get_thread: (param = {}) => callZome('get_thread', param),
  get_required_skills: (param = {}) => callZome('get_required_skills', param),
  create_post: (param = {}) => callZome('create_post', param),
  get_thread_posts: (param = {}) => callZome('get_thread_posts', param),
  get_threads: (param = {}) => callZome('get_threads', param),
  get_relevant_threads: (param = {}) => callZome('get_relevant_threads', param),
  remove_skill: (param = {}) => callZome('remove_skill', param),
};