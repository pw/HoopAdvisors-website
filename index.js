import { Hono } from 'hono';
import { WebsocketServer } from './lib/websocket_server.js';
import { GameServer } from './lib/game_server.js';
import { slideRulePage } from './templates/slide_rule_page.js'
import { gamePage } from './templates/game_page.js'
import { landing } from './templates/landing.js'
import { momentumPage } from './templates/momentum_page.js'
import { authMiddleware, createSignedToken } from './lib/auth.js';

export { WebsocketServer, GameServer };

// Create Hono app instance
const app = new Hono();

// Add middleware to all routes
app.use('*', authMiddleware);

// Route handlers
app.get('/', async (c) => {
  const isAuthenticated = c.get('isAuthenticated');
  return c.html(isAuthenticated ? momentumPage() : landing(c.req.url));
});

app.get('/lead_tracker', async (c) => {
  const isAuthenticated = c.get('isAuthenticated');
  return c.html(isAuthenticated ? slideRulePage() : landing(c.req.url));
});

app.get('/qualifiers', async (c) => {
  const isAuthenticated = c.get('isAuthenticated');
  return c.html(isAuthenticated ? momentumPage() : landing(c.req.url));
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

app.post('/api/get-data', async (c) => {
  const { date } = await c.req.json();
  
  try {
    const result = await c.env.scrapers.getData(date);
    return c.json({ success: result });
  } catch (error) {
    console.error('Error calling getData:', error);
    return c.json({ success: false });
  }
});

app.post('/api/process-odds/:date', async (c) => {
  const date = c.req.param('date');
  
  // Validate date format (YYYYMMDD)
  if (!/^\d{8}$/.test(date)) {
    return c.json({ success: false, error: "Invalid date format" }, 400);
  }
  
  try {
    // Get the WebSocketServer for this date
    const websocketServerId = c.env.WEBSOCKET_SERVER.idFromName(date);
    const websocketServer = c.env.WEBSOCKET_SERVER.get(websocketServerId);
    
    // Process odds data
    const result = await websocketServer.processOddsData(date);
    
    return c.json({ success: true, ...result });
  } catch (error) {
    console.error('Error processing odds data:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Helper function to generate dates in range
function* dateRange(start, end) {
  let current = new Date(start.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
  const endDate = new Date(end.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
  
  while (current <= endDate) {
    yield current.toISOString().slice(0,10).replace(/-/g, '');
    current.setDate(current.getDate() + 1);
  }
}

app.get('/api/historical-games', async (c) => {
  const startDate = c.req.query('start_date');
  const endDate = c.req.query('end_date') || startDate;
  
  try {
    const results = [];
    
    for (const date of dateRange(startDate, endDate)) {
      const id = c.env.WEBSOCKET_SERVER.idFromName(date);
      const stub = c.env.WEBSOCKET_SERVER.get(id);
      const games = await stub.getHistoricalGames();
      if (games.length > 0) {
        results.push(...games);
      }
    }
    
    return c.json({ 
      success: true, 
      games: results 
    });
  } catch (error) {
    console.error('Error fetching historical games:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch historical games' 
    }, 500);
  }
});

// 404 for everything else
app.all('*', (c) => c.text('Not Found', 404));

export default {
  fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },
};
