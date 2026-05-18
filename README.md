# Akane MD 🤖

Your personal AI assistant — web version. Built with Node.js/Express + vanilla JS frontend.

## Features
- 4 personality modes: Default, Coder, Tutor, Friend
- Markdown + code block rendering
- Chat history per session
- Copy any reply to clipboard
- Mobile responsive

## Deploy to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set these:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add Environment Variables:
   - `OPENROUTER_API_KEY` → your OpenRouter key
   - `SITE_URL` → your Render URL (e.g. `https://akanemd.onrender.com`)
6. Click Deploy

## Local Dev

```bash
npm install
cp .env.example .env
# edit .env with your API key
npm start
# open http://localhost:3000
```

## Environment Variables

| Variable | Required | Default |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | hardcoded fallback |
| `MODEL` | No | `deepseek/deepseek-v4-flash:free` |
| `PORT` | No | `3000` |
| `SITE_URL` | No | `https://akanemd.onrender.com` |
