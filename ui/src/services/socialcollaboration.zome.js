import { connect } from '@holochain/hc-web-client';

const URL = 'ws://localhost:8888';
const instanceId = 'test-instance';
const zomeName = 'socialcollaboration';

const callZome = async (fn, param) => {
  const resp = await connect(URL).then(({callZome, close}) => callZome(instanceId, zomeName, fn)(param));
  console.log(fn, param, resp);
  return JSON.parse(resp);
};

const createThread = async (param = {
  title: 'My Test Thread',
  utc_unix_time: 0,
  required_skills: ['programming']
}) => {
  const { Ok } = await callZome('create_thread', param);
  return Ok;
};

const getThreads = async (param = {}) => {
  const { Ok } = await callZome('get_threads', param);
  return Ok;
};

const getThread = async (address) => {
  const { Ok } = await callZome('get_thread', { address: address });
  return Ok;
};

const getThreadSkills = async (address) => {
  const { Ok } = await callZome('get_required_skills', { thread: address });
  return Ok;
};

const getUsername = async (address) => {
  const { Ok } = await callZome('get_username', { agent_address: address });
  return Ok;
};

const createPost = async (param = {
  content: 'My Test Post',
  utc_unix_time: 0,
  thread: '',
}) => {
  const { Ok } = await callZome('create_post', param);
  return Ok;
};

const getPosts = async (address) => {
  const { Ok } = await callZome('get_thread_posts', { thread: address });
  return Ok;
};

const getMySkills = async () => {
  const { Ok } = await callZome('get_my_skills', {});
  return Ok;
};

const addSkill = async (skill) => {
  const { Ok } = await callZome('add_skill', { skill });
  return Ok;
};

const removeSkill = async (skill) => {
  const { Ok } = await callZome('remove_skill', { skill });
  return Ok;
};

export const zomes = {
  getUsername,
  getMySkills,
  addSkill,
  removeSkill,
  createThread,
  getThreads,
  getThread,
  getThreadSkills,
  createPost,
  getPosts
};