# South Korea Spotlight — Name in Hangul

Guest-facing card generator for Traditions Global Cuisine, plus a host-stand
print queue. No Claude account, no login, for guests OR staff — the queue
runs on Netlify's own infrastructure (Netlify Blobs), which is included free
with every Netlify site.

## What's in this folder

- `index.html` — the whole app (guest form, card generator, staff queue). One file.
- `netlify/functions/queue.js` — the serverless function that stores/reads/clears print orders.
- `netlify.toml` — routes `/api/queue` to that function.
- `package.json` + `node_modules/` — the one dependency (`@netlify/blobs`), already installed and included so nothing needs to be downloaded at deploy time.

## Deploy it — use the Netlify CLI, not drag-and-drop

**Important:** plain drag-and-drop deploys (dragging the folder onto
netlify.com or the Sites page) are built for static sites and don't
reliably pick up serverless functions or `netlify.toml` — that's almost
certainly what caused the "could not reach the print queue" error. The CLI
deploy handles it correctly every time, and it's still just one command.

1. If you don't already have Node.js on your computer, install it from
   [nodejs.org](https://nodejs.org) (the "LTS" version — takes a couple of minutes).
2. Unzip this folder, open a terminal, and `cd` into it.
3. Run these commands one at a time:
   ```
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```
4. When it asks:
   - **"Create & configure a new site"** (first time) — say yes, and either
     accept a random name or type your own (this decides the
     `your-name.netlify.app` URL).
   - If you already created `traditionshangul.netlify.app` from the earlier
     attempt, choose **"link this directory to an existing site"** instead
     and pick that one — the new deploy will replace it, same URL.
5. It'll print your live URL when done. That's the one for the QR code.

## Test it before putting the QR code out

1. Open your Netlify URL on your own phone. Make a card, tap **Print — $5**.
2. On another device (or the same one), tap **Staff**, enter the PIN, and confirm the order shows up.
3. Tap **Open / Print**, confirm the image opens, then **Mark Printed** and confirm it disappears from the list.

If step 1 still fails after deploying via the CLI, open your browser's dev
tools (or just tell me what happened) and we'll look at the actual function
logs in the Netlify dashboard under **your site → Functions → queue**.

## Changing the PIN

Open `index.html`, search for `STAFF_PIN`, change the 4-digit value, then
redeploy with `netlify deploy --prod` again from the same folder.

## Updating the app later

If you ever want changes made (wording, colors, new words, etc.), just come
back to this conversation and ask — I'll hand you an updated folder to
redeploy the same way.
