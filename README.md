# 🍃 Save-A-Bite — Saving Food. Serving Hope.

> A social impact platform that bridges **food donors**, **NGOs**, and **volunteers** to fight hunger and reduce food waste across India.

---

## 🌟 Features

- **Donor Portal** — List surplus food with expiry tracking and urgency scoring
- **NGO Portal** — Browse, claim, and manage incoming food donations
- **Volunteer Hub** — Accept delivery tasks and earn points on the leaderboard
- **Admin Dashboard** — Monitor platform-wide impact metrics in real time
- **Live Map** — Canvas-based visual of donors, NGOs, and delivery routes
- **Impact Stats** — Animated counters showing meals saved, cities covered, and more

## 🚀 Quick Start

### Prerequisites
- Python 3.x installed ([python.org](https://www.python.org))

### Run Locally

**Windows:**
```bash
Double-click START.bat
```

Or manually:
```bash
python -m http.server 3000
```
Then open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
save-a-bite/
├── index.html        # Home / landing page
├── donor.html        # Food donor portal
├── ngo.html          # NGO management portal
├── volunteer.html    # Volunteer hub
├── admin.html        # Admin dashboard
├── css/
│   └── style.css     # Global styles
├── js/
│   ├── app.js        # Core logic, DB, data models
│   └── map.js        # Canvas map engine
└── START.bat         # One-click Windows launcher
```

## 💡 Tech Stack

| Layer | Tech |
|-------|------|
| Structure | HTML5 |
| Styling | Vanilla CSS (dark mode, glassmorphism) |
| Logic | Vanilla JavaScript (ES6+) |
| Storage | localStorage (browser-based DB) |
| Map | HTML5 Canvas |
| Server | Python `http.server` |

## 📸 Pages

| Page | URL |
|------|-----|
| Home | `/index.html` |
| Donate Food | `/donor.html` |
| NGO Portal | `/ngo.html` |
| Volunteer | `/volunteer.html` |
| Dashboard | `/admin.html` |

---

Made with ❤️ to end hunger · *Saving Food. Serving Hope.*
