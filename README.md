# Harish Yeluri · Portfolio

Live: https://harish-cloud-8800.github.io

AI/ML, Generative AI and Forward Deployed Engineer portfolio with a 3D hero portrait, a narrated voice tour, a model card, a professional summary and an "Ask my resume" box.

- `index.html` – page and styles
- `js/ask.js` – in-browser BM25 search over the resume (no LLM)
- `js/profile.js` – optional answers for salary, work authorization and start date
- `js/tour.js`, `js/tour-data.js`, `assets/tour.mp3` – the voice tour; the page follows the audio clock so visuals stay in sync with the narration
- `assets/photo3d.js`, `assets/three.min.js` – the 3D portrait (falls back to the flat photo without WebGL)
