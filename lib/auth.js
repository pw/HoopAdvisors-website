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

// Middleware to check authentication
const authMiddleware = async (c, next) => {
  const cookie = c.req.header('Cookie') || '';
  const tokenMatch = cookie.match(new RegExp(`hoop-advisors-auth=([^;]+)`));
  const token = tokenMatch ? tokenMatch[1] : null;
  const isAuthenticated = await isValidSignedToken(token, c.env.SECRET_KEY);
  c.set('isAuthenticated', isAuthenticated);
  await next();
};

export { createSignedToken, isValidSignedToken, authMiddleware }; 