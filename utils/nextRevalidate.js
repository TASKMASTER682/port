// backend/utils/nextRevalidate.js
// Fire-and-forget: tells Next.js to revalidate cached pages after a content change.
async function triggerRevalidate(paths = ['/']) {
  const url = process.env.NEXT_REVALIDATE_URL;
  if (!url) return;
  try {
    const res = await fetch(`${url}?secret=${encodeURIComponent(process.env.REVALIDATE_SECRET || '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    });
    if (!res.ok) console.warn(`[revalidate] failed: ${res.status}`);
  } catch (e) {
    console.warn('[revalidate] skipped:', e.message);
  }
}

module.exports = triggerRevalidate;
