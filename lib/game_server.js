import { DurableObject } from "cloudflare:workers";

export class GameServer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.storage = ctx.storage;
    const websocketServerId = this.env.WEBSOCKET_SERVER.idFromName('server');
    this.websocketServer = this.env.WEBSOCKET_SERVER.get(websocketServerId);
  }

  async update(gameUpdate) {
    let gameData = await this.ctx.storage.get('gameData');
    if (gameData) {
      gameData.push(gameUpdate);
      await this.ctx.storage.put('gameData', gameData);
    } else {
      gameData = [gameUpdate];
      await this.ctx.storage.put('gameData', gameData);
    }
    this.websocketServer.update(gameUpdate);
  }

  async getGameData() {
    return await this.ctx.storage.get('gameData');
  }
}
