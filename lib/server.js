import { DurableObject } from "cloudflare:workers";

export class Server extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.state = ctx;
    this.gameData = new Map();
    const date = new Date();
    const laDate = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
    this.date = laDate;
    // Block concurrency while initializing from storage
    this.state.blockConcurrencyWhile(async () => {
      // Load the stored game data
      const storedGames = await this.state.storage.get(`gameData-${this.date}`);
      if (storedGames) {
        // Convert the stored object back to a Map
        this.gameData = new Map(Object.entries(storedGames));
      }
    });
  }

  async webSocketMessage(webSocket, msg) {
    let data = JSON.parse(msg);
    if (data.type === 'initial') {
      if (this.gameData.size > 0) {
        const currentGames = Array.from(this.gameData.values());
        webSocket.send(JSON.stringify({
          type: 'initial',
          games: currentGames
        }));
      }
    }
  }

  async fetch(request) {
    if (request.url.endsWith('/connect')) {
      const [client, server] = Object.values(new WebSocketPair());
      this.state.acceptWebSocket(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    } else if (request.url.endsWith('/update')) {
      const body = await request.json();

      if (body.type === 'update') {
        // Store/update the game data using gameId as key
        this.gameData.set(body.gameId, body);
      } else if (body.type === 'final') {
        this.gameData.set(body.gameId, body);
        if (!body.hasComeback) {
          this.gameData.delete(body.gameId);
        }
      }
      // Persist the updated game data to storage
      await this.state.storage.put(`gameData-${this.date}`, Object.fromEntries(this.gameData));

      const clients = this.state.getWebSockets();
      const message = JSON.stringify(body);
      for (const client of clients) {
        client.send(message);
      }
      return new Response(null, {
        status: 200,
      });
    }
  }
}
