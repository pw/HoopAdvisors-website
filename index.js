import { Hono } from 'hono';
import { WebsocketServer } from './lib/websocket_server.js';
import { GameServer } from './lib/game_server.js';
import { slideRulePage } from './templates/slide_rule_page.js'
import { gamePage } from './templates/game_page.js'
import { landing } from './templates/landing.js'
import { authMiddleware, createSignedToken } from './lib/auth.js';

export { WebsocketServer, GameServer };

// Create Hono app instance
const app = new Hono();

// Add middleware to all routes
app.use('*', authMiddleware);

// Route handlers
app.get('/', async (c) => {
  const isAuthenticated = c.get('isAuthenticated');
  return c.html(isAuthenticated ? slideRulePage() : landing());
});

app.all('/connect', async (c) => {
  const env = c.env;
  const date = c.req.query()['date'];
  const id = env.WEBSOCKET_SERVER.idFromName(date);
  const stub = env.WEBSOCKET_SERVER.get(id);
  return await stub.fetch(c.req.raw);
});

app.all('/update', async (c) => {
  const env = c.env;
  const json = await c.req.json();
  const id = env.GAME_SERVER.idFromName(json.gameId);
  const stub = env.GAME_SERVER.get(id);
  await stub.update(json);
  return c.json({ success: true }, { status: 200 });
});

app.all('/game', async (c) => {
  const env = c.env;
  const gameId = c.req.query()['id'];
  const id = env.GAME_SERVER.idFromName(gameId);
  const stub = env.GAME_SERVER.get(id);
  const gameData = await stub.getGameData();
  return c.html(gamePage(Array.from(gameData.values())));
});

app.all('/clear', async (c) => {
  const env = c.env;
  const id = env.SERVER.idFromName("server");
  const stub = env.SERVER.get(id);
  return await stub.fetch(c.req.raw);
});

app.post('/validate', async (c) => {
  const { code } = await c.req.json();
  
  if (code === c.env.ACCESS_CODE) {
    const token = await createSignedToken(c.env.SECRET_KEY);
    return c.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': `hoop-advisors-auth=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
        },
      }
    );
  }
  
  return c.json({ success: false }, { status: 401 });
});

// 404 for everything else
app.all('*', (c) => c.text('Not Found', 404));

export default {
  fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },
};
