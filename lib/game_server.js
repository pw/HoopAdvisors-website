import { DurableObject } from "cloudflare:workers";

export class GameServer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.storage = ctx.storage;
    this.env = env;
  }

  async update(gameUpdate) {
    await this.storage.put(gameUpdate.id, gameUpdate);
    const websocketServerId = this.env.WEBSOCKET_SERVER.idFromName(gameUpdate.date);
    const websocketServer = this.env.WEBSOCKET_SERVER.get(websocketServerId);
    await websocketServer.update(gameUpdate);
  }

  async getGameData() {
    const gameData = await this.storage.list();
    console.log('gameData', gameData);
    return gameData;
  }
}
