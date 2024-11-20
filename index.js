import { Hono } from 'hono';
import { Server } from './lib/server.js';
import { slideRulePage } from './templates/slide_rule_page.js'
import { landing } from './templates/landing.js'
import { authMiddleware, createSignedToken } from './lib/auth.js';

export { Server };

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
  const id = env.SERVER.idFromName("server");
  const stub = env.SERVER.get(id);
  return await stub.fetch(c.req.raw);
});

app.all('/update', async (c) => {
  const env = c.env;
  const id = env.SERVER.idFromName("server");
  const stub = env.SERVER.get(id);
  return await stub.fetch(c.req.raw);
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
