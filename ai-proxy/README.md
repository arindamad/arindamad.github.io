# AI proxy (optional)

The portfolio's AI assistant works without this proxy, using a built-in knowledge base and a rule-based project scoper in `js/ai-assistant.js`.

Deploy this Cloudflare Worker if you want the assistant to answer with Claude. Your API key is stored as a Worker secret, so it never reaches the browser.

```bash
cd ai-proxy
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY   # paste your key from console.anthropic.com
npx wrangler deploy
```

Wrangler prints a URL like `https://arindam-ai.<subdomain>.workers.dev`. Put it in `js/ai-assistant.js`:

```js
var AI_ENDPOINT = 'https://arindam-ai.<subdomain>.workers.dev/chat';
```

Notes:
- Only origins listed in `ALLOWED_ORIGINS` in `src/index.js` can call the proxy. Add your custom domain there if you use one.
- To keep costs predictable, set a spend limit in the Anthropic Console. You can also add a Cloudflare rate-limiting rule on the worker route.
- If the proxy is down or returns an error, the site falls back to the local assistant automatically.
- To change what the assistant knows about you, edit `SYSTEM_PROMPT` in `src/index.js`.
