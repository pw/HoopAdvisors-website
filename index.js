import { Server } from './server.js';

export { Server };

export default {
  async fetch(request, env, ctx) {
    const id = env.SERVER.idFromName("server");
    const stub = env.SERVER.get(id);
    return await stub.fetch(request);
  },
};
