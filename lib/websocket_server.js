import { DurableObject } from "cloudflare:workers";

export class WebsocketServer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.storage = ctx.storage;
    this.gamesData = new Map();
    this.ctx.blockConcurrencyWhile(async () => {
      const storedGames = await this.storage.list({ prefix: 'game:' });
      if (storedGames.size > 0) {
        this.gamesData = storedGames;
      }
    });
  }

  async webSocketMessage(webSocket, msg) {
    let data = JSON.parse(msg);
    if (data.type === 'initial') {
      if (this.gamesData.size > 0) {
        const currentGames = Array.from(this.gamesData.values());
        webSocket.send(JSON.stringify({
          type: 'initial',
          games: currentGames
        }));
      }
    }
  }

  async broadcast(message) {
    const clients = this.ctx.getWebSockets();
    const messageString = JSON.stringify(message);
    for (const client of clients) {
      client.send(messageString);
    }
  }

  async update(gameUpdate) {
    const key = `game:${gameUpdate.gameId}`;
    this.gamesData.set(key, gameUpdate);
    await this.storage.put(key, gameUpdate);
    await this.broadcast(gameUpdate);
  }

  async fetch(request) {
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}
