// Print queue backend for the South Korea Spotlight name-card app.
// Uses Netlify Blobs (built into every Netlify site, no extra account or
// credentials needed) as the shared storage between guest phones and the
// host-stand screen.
//
// GET    /api/queue          -> list all pending orders
// POST   /api/queue          -> add a new order (guest tapped "Print")
// DELETE /api/queue?key=...  -> remove an order (staff tapped "Mark Printed")
//
// NOTE: this site uses a custom base directory (netlify-deploy), which on
// some Netlify projects prevents the siteID/token from being auto-injected
// into the function. So we supply them explicitly via environment variables
// (BLOBS_SITE_ID / BLOBS_TOKEN, set in Site configuration -> Environment
// variables) instead of relying on the zero-config getStore('name') form.

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const siteID = process.env.BLOBS_SITE_ID;
  const token = process.env.BLOBS_TOKEN;

  // Surface a clear, specific error instead of letting the Blobs SDK throw
  // its generic MissingBlobsEnvironmentError, which doesn't tell us WHY the
  // credentials weren't found.
  if (!siteID || !token) {
    return json(500, {
      error: 'Blobs credentials not available to this function',
      siteIDPresent: !!siteID,
      tokenPresent: !!token,
      hint: 'Check that BLOBS_SITE_ID and BLOBS_TOKEN are scoped to "Functions" (and Production context) in Site configuration -> Environment variables, then trigger a fresh deploy.'
    });
  }

  try {
    const store = getStore({ name: 'print-queue', siteID, token });

    if (event.httpMethod === 'GET') {
      const { blobs } = await store.list({ prefix: 'order:' });
      const orders = [];
      for (const b of blobs) {
        const data = await store.get(b.key, { type: 'json' });
        if (data) orders.push({ key: b.key, ...data });
      }
      orders.sort((a, b) => a.ts - b.ts);
      return json(200, orders);
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!body.name || !body.img) {
        return json(400, { error: 'Missing name or image' });
      }
      const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      const key = 'order:' + id;
      await store.setJSON(key, {
        name: String(body.name).slice(0, 60),
        wordEn: String(body.wordEn || '').slice(0, 40),
        wordKo: String(body.wordKo || '').slice(0, 20),
        nameKo: String(body.nameKo || '').slice(0, 60),
        img: body.img,
        ts: Date.now()
      });
      return json(200, { ok: true, key });
    }

    if (event.httpMethod === 'DELETE') {
      const key = event.queryStringParameters && event.queryStringParameters.key;
      if (!key) return json(400, { error: 'Missing key' });
      await store.delete(key);
      return json(200, { ok: true });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    return json(500, { error: String(err && err.message || err) });
  }
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj)
  };
}
