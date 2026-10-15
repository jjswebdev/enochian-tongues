import { writeFile, mkdir } from 'node:fs/promises';
const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const page = process.env.FACEBOOK_PAGE_ID;
const version = process.env.FACEBOOK_GRAPH_VERSION || 'v23.0';
if (!token || !/^\d+$/.test(page || '') || !/^v\d+\.0$/.test(version)) {
  throw new Error('Configure FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID and a valid FACEBOOK_GRAPH_VERSION in GitHub Actions settings.');
}
try {
  const url = new URL(`https://graph.facebook.com/${version}/${page}/published_posts`);
  url.searchParams.set('fields', 'id,message,created_time,permalink_url,full_picture,is_published,is_hidden');
  url.searchParams.set('limit', '12');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000)
  });
  const body = await response.json();
  if (!response.ok || body.error || !Array.isArray(body.data)) {
    throw new Error(`Facebook sync failed (HTTP ${response.status}, API code ${body.error?.code || 'unknown'}). Check Page token permissions and expiry.`);
  }
  const safeUrl = (value, facebookOnly = false) => {
    try {
      const u = new URL(value);
      if (u.protocol !== 'https:' || (facebookOnly && u.hostname !== 'facebook.com' && !u.hostname.endsWith('.facebook.com'))) return null;
      return u.href;
    } catch { return null; }
  };
  const posts = body.data.filter(p => p.is_published === true && p.is_hidden !== true)
    .map(p => ({ id: p.id, message: typeof p.message === 'string' ? p.message : '',
      date: p.created_time, url: safeUrl(p.permalink_url, true), image: safeUrl(p.full_picture) }))
    .filter(p => p.url && Number.isFinite(Date.parse(p.date)) && (p.message || p.image)).slice(0, 6);
  const count = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
  await Promise.all(posts.map(async post => {
    post.comments = null;
    post.likes = null;
    post.views = null;
    try {
      if (!/^[0-9_]+$/.test(post.id)) return;
      const metricsUrl = new URL(`https://graph.facebook.com/${version}/${post.id}`);
      metricsUrl.searchParams.set('fields', 'likes.limit(0).summary(true),comments.limit(0).summary(true).filter(stream)');
      const result = await fetch(metricsUrl, {
        headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000)
      });
      const metrics = await result.json();
      if (!result.ok || metrics.error) return;
      post.likes = count(metrics.likes?.summary?.total_count);
      post.comments = count(metrics.comments?.summary?.total_count);
    } catch { /* Keep the post and mark unavailable metrics honestly. */ }
  }));
  await mkdir('data', { recursive: true });
  await writeFile('data/facebook-posts.json', JSON.stringify({ posts }, null, 2) + '\n');
  console.log(`Synced ${posts.length} published Facebook posts.`);
} catch (error) {
  // Do not log API responses, request URLs or tokens. Preserve the last successful cache.
  console.error(error.message.startsWith('Facebook sync failed') ? error.message : 'Facebook sync failed. Check credentials, API version and network access. Existing posts were preserved.');
  process.exitCode = 1;
}
