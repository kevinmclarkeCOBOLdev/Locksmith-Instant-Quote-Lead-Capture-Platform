const SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-purposes-only-123456';

export async function signJWT(payload: any): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
    
  const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    secretKey,
    encoder.encode(`${header}.${body}`)
  );

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${header}.${body}.${signature}`;
}

export async function verifyJWT(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Padding helper for atob
    const base64UrlDecode = (str: string) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return atob(base64);
    };

    const signatureBytes = new Uint8Array(
      base64UrlDecode(signature)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      secretKey,
      signatureBytes,
      encoder.encode(`${header}.${body}`)
    );

    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(body));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}
