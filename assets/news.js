(async () => {
  const container = document.querySelector('#facebook-news');
  if (!container) return;
  const safeUrl = (value, facebookOnly = false) => {
    if (typeof value !== 'string') return null;
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && (!facebookOnly || u.hostname === 'facebook.com' || u.hostname.endsWith('.facebook.com')) ? u.href : null;
    } catch { return null; }
  };
  try {
    const response = await fetch('data/facebook-posts.json', { cache: 'no-cache' });
    if (!response.ok) return;
    const data = await response.json();
    const posts = data?.posts;
    if (!Array.isArray(posts) || !posts.length) return;
    const fragment = document.createDocumentFragment();
    for (const post of posts.slice(0, 6)) {
      if (!post || typeof post !== 'object') continue;
      const url = safeUrl(post.url, true);
      if (!url) continue;
      const card = document.createElement('article');
      card.className = 'news-card';
      const imageUrl = safeUrl(post.image);
      if (imageUrl) {
        const image = document.createElement('img');
        image.src = imageUrl; image.alt = ''; image.loading = 'lazy';
        image.referrerPolicy = 'no-referrer';
        image.addEventListener('error', () => image.remove());
        card.append(image);
      }
      const content = document.createElement('div'); content.className = 'news-card-content';
      const date = new Date(post.date);
      if (!Number.isNaN(date.valueOf())) {
        const time = document.createElement('time'); time.dateTime = date.toISOString();
        time.textContent = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'America/Chicago' }).format(date);
        content.append(time);
      }
      const message = typeof post.message === 'string' ? post.message.trim() : '';
      const firstLine = message.split('\n').find(line => line.trim()) || 'Update from Enochian Tongues';
      const title = document.createElement('h3');
      title.textContent = firstLine.length > 90 ? firstLine.slice(0, 87) + '…' : firstLine;
      content.append(title);
      const excerpt = message.startsWith(firstLine) ? message.slice(firstLine.length).trim() : message;
      if (excerpt || firstLine.length > 90) {
        const p = document.createElement('p'); const text = firstLine.length > 90 ? message : excerpt;
        p.textContent = text.length > 420 ? text.slice(0, 417) + '…' : text;
        content.append(p);
      }
      const link = document.createElement('a'); link.className = 'button';
      link.href = url; link.textContent = 'Read on Facebook'; content.append(link);
      card.append(content); fragment.append(card);
    }
    if (fragment.childElementCount) container.replaceChildren(fragment);
  } catch { /* Keep the visible Facebook fallback when no cached feed is available. */ }
})();
