import { DurableObject } from "cloudflare:workers";

export class GameServer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.storage = ctx.storage;
    this.env = env;
  }

  async update(gameUpdate) {
    // If this is a 'first' update, clear existing storage for this game
    if (gameUpdate.type === 'first') {
      console.log(`Received 'first' update for game ${gameUpdate.gameId}, clearing existing storage`);
      // Use deleteAll() to efficiently remove all keys
      await this.storage.deleteAll();
    }
    
    // Store the current update
    await this.storage.put(gameUpdate.id, gameUpdate);
    
    // Forward to the websocket server
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
