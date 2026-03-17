# ⚽ Football GeoGuesser

> GeoGuesser-style quiz game about legendary football matches. Guess the minute goals were scored — the closer you are, the more points you get.

![Version](https://img.shields.io/badge/version-0.1.0-green)
![Status](https://img.shields.io/badge/status-PoC-yellow)

## 🎮 How It Works

1. **You get a match** — a random legendary match from football history (e.g. Champions League Final 1999)
2. **You guess the minutes** — slide the timeline to when you think each goal was scored
3. **You earn points** — exact hit = 100 pts, ±5 min = 65 pts, linear scale down

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/football-geoguesser.git
cd football-geoguesser

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Build & Deploy

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect the GitHub repo to [vercel.com](https://vercel.com) for automatic deploys.

## 📁 Project Structure

```
football-geoguesser/
├── public/             # Static assets
├── src/
│   ├── data/
│   │   └── matches.js  # Match database (hardcoded for PoC)
│   ├── App.jsx          # Main game component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## ⚽ Available Matches (PoC)

| Match | Competition | Season | Goals |
|-------|------------|--------|-------|
| Man United vs Bayern | CL Final | 1998/99 | 3 |
| AC Milan vs Liverpool | CL Final | 2004/05 | 6 |
| Niemcy vs Argentyna | WC Final | 2014 | 1 |
| Liverpool vs Barcelona | CL Semi | 2018/19 | 4 |
| Argentyna vs Francja | WC Final | 2022 | 6 |
| Man City vs QPR | Premier League | 2011/12 | 5 |
| Juventus vs Real Madryt | CL Final | 2016/17 | 5 |
| Argentyna vs Anglia | WC Quarter | 1986 | 3 |
| Barcelona vs PSG | CL R16 | 2016/17 | 7 |
| Brazylia vs Niemcy | WC Semi | 2014 | 8 |
| Barcelona vs Man United | CL Final | 2010/11 | 4 |
| Liverpool vs Arsenal | Premier League | 2001/02 | 3 |

## 🛣️ Roadmap

- [x] Core gameplay — guess goal minutes
- [x] Timer (45s per goal)
- [x] Scoring system (linear scale)
- [x] Leaderboard
- [x] Difficulty levels
- [ ] Backend + database (soccerdata scraper)
- [ ] User accounts & persistent leaderboard
- [ ] Multiplayer mode
- [ ] More game modes (guess lineup, guess scorers)
- [ ] Daily challenge (Wordle-style)
- [ ] Mobile app (React Native)

## 🔧 Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** CSS-in-JS (inline styles)
- **Data:** Hardcoded (PoC) → [soccerdata](https://github.com/probberechts/soccerdata) for production
- **Deploy:** Vercel

## 📄 License

MIT

---

*Built as a PoC to validate the concept. If people come back — we scale it up.*
