import { Server } from './server.js';
export { Server };

import { slideRulePage } from './templates/slide_rule.js'
import { landing } from './templates/landing.js'

const ACCESS_CODE = 'b@ll';
const COOKIE_NAME = 'hoop-advisors-auth';

// Helper function to create a signed token
async function createSignedToken(secretKey) {
  const timestamp = Date.now();
  const payload = `${timestamp}`;
  
  // Create signature using HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  // Convert signature to base64
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${payload}.${signatureBase64}`;
}

// Helper function to verify signed token
async function isValidSignedToken(token, secretKey) {
  if (!token) return false;
  
  try {
    const [timestamp, signature] = token.split('.');
    const tokenAge = Date.now() - parseInt(timestamp);
    
    // Check if token is expired (24 hours)
    if (tokenAge > 86400000) return false;
    
    // Verify signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(timestamp)
    );
    
    return isValid;
  } catch {
    return false;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/connect') {
      const id = env.SERVER.idFromName("server");
      const stub = env.SERVER.get(id);
      return await stub.fetch(request);
    }

    // Check for auth cookie
    const cookie = request.headers.get('Cookie') || '';
    const tokenMatch = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    const token = tokenMatch ? tokenMatch[1] : null;
    const isAuthenticated = await isValidSignedToken(token, env.SECRET_KEY);

    if (url.pathname === '/') {
      if (isAuthenticated) {
        return new Response(slideRulePage(), {
          headers: { 'Content-Type': 'text/html' },
        });
      }
      return new Response(landing(), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (url.pathname === '/validate' && request.method === 'POST') {
      const { code } = await request.json();
      
      if (code === ACCESS_CODE) {
        const token = await createSignedToken(env.SECRET_KEY);
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
          },
        });
      }
      
      return new Response(JSON.stringify({ success: false }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/dashboard') {
      if (!isAuthenticated) {
        return Response.redirect(url.origin, 302);
      }
      return new Response(slideRulePage(), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
