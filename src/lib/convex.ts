import { ConvexHttpClient } from 'convex/browser';

export function getConvexClient(): ConvexHttpClient | null {
  const convexUrl =
    process.env.CONVEX_URL ||
    process.env.NEXT_PUBLIC_CONVEX_URL ||
    process.env['NEXT_PUBLIC_CONVEX_URL'];

  if (!convexUrl || convexUrl.trim() === '') {
    return null;
  }

  try {
    return new ConvexHttpClient(convexUrl.trim());
  } catch (err) {
    console.error('[ConvexClient] Initialization failed:', err);
    return null;
  }
}
