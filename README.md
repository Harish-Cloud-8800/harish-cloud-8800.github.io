# Harish Yeluri · Portfolio

AI/ML, Generative AI and Forward Deployed Engineer portfolio, built like a production AI console.

**Live site:** https://harish-cloud-8800.github.io

## What's inside

- **Ask Harish:** a question box that answers from my resume using BM25 retrieval, entirely in the browser. No LLM, so it can't invent facts; every answer cites its source, and unanswerable questions get a "not in my resume" guardrail.
- **Professional summary**, **production metrics**, **experience as a deployment log**, **projects as an eval table**, **119 skills with live search**, **model card** with certifications and education, and **contact**.
- Light and dark mode, mobile layout, keyboard accessible, and a spoken intro using the browser's speech synthesis.

## Project structure

```
index.html              page markup
css/styles.css          all styles (light and dark themes via CSS variables)
js/skills.js            skills data: [symbol, name, family, where used]
js/app.js               ask box (BM25), skill filter, copy buttons, voice intro
assets/harish-yeluri.jpg  profile photo
assets/favicon.svg      tab icon
.nojekyll               tells GitHub Pages to serve files as-is
404.html                sends unknown paths back to the homepage
```

No build step and no dependencies. Fonts load from Google Fonts.

## Run it locally

Open `index.html` in a browser, or run a local server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy on GitHub Pages

1. Create a public repository named `YOUR-USERNAME.github.io`.
2. Upload every file and folder from this project, keeping the same structure, then commit.
3. Go to **Settings → Pages**, set **Source** to **Deploy from a branch**, choose **main** and **/ (root)**, and click **Save**.
4. After 1–2 minutes the site is live at `https://YOUR-USERNAME.github.io`.

## Editing

- **Text and experience:** edit `index.html`.
- **Answers in the Ask box:** edit the `KB` list near the top of the knowledge-base section in `js/app.js`. Each entry is `[section id, title, answer sentence, search keywords]`.
- **Skills:** edit `js/skills.js`.
- **Colors and fonts:** edit the variables at the top of `css/styles.css`.

## Contact

- Email: harishyeluri8800@gmail.com
- LinkedIn: https://www.linkedin.com/in/harish8800/
