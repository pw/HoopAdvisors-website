import { DurableObject } from "cloudflare:workers";

export class WebsocketServer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.storage = ctx.storage;
    this.gamesData = new Map();
    this.state.blockConcurrencyWhile(async () => {
      const storedGames = await this.state.storage.get('gamesData');
      if (storedGames) {
        this.gamesData = new Map(Object.entries(storedGames));
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
    const clients = this.state.getWebSockets();
    const messageString = JSON.stringify(message);
    for (const client of clients) {
      client.send(messageString);
    }
  }

  async update(gameUpdate) {
    this.gamesData.set(gameUpdate.gameId, gameUpdate);
    await this.state.storage.put('gamesData', Object.fromEntries(this.gamesData));
    this.broadcast(gameUpdate);
  }

  async connect() {
    const [client, server] = Object.values(new WebSocketPair());
    this.state.acceptWebSocket(server);
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}
