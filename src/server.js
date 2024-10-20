import { DurableObject } from "cloudflare:workers";

export class Server extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.state = ctx;
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
