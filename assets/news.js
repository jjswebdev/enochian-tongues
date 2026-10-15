(async () => {
  const container = document.querySelector('#facebook-news');
  if (!container) return;
  const safeUrl = (value, facebookOnly = false) => {
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && (!facebookOnly || u.hostname === 'facebook.com' || u.hostname.endsWith('.facebook.com')) ? u.href : null;
    } catch { return null; }
  };
  try {
    const response = await fetch('data/facebook-posts.json', { cache: 'no-cache' });
    if (!response.ok) return;
    const { posts } = await response.json();
    if (!Array.isArray(posts) || !posts.length) return;
    const fragment = document.createDocumentFragment();
    for (const post of posts.slice(0, 6)) {
      const url = safeUrl(post.url, true);
      if (!url) continue;
      const card = document.createElement('article');
      card.className = 'news-card';
      const stats = document.createElement('dl');
      stats.className = 'news-stats';
      stats.setAttribute('aria-label', 'Facebook post engagement');
      for (const [label, key] of [['Comments', 'comments'], ['Views', 'views'], ['Likes', 'likes']]) {
        const metric = document.createElement('div');
        const term = document.createElement('dt'); term.textContent = label;
        const value = document.createElement('dd');
        const available = Number.isSafeInteger(post[key]) && post[key] >= 0;
        value.textContent = available ? new Intl.NumberFormat('en-US').format(post[key]) : '—';
        if (!available) {
          value.title = 'Not available from Facebook';
          value.setAttribute('aria-label', 'Not available from Facebook');
        }
        metric.append(term, value); stats.append(metric);
      }
      card.append(stats);
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
