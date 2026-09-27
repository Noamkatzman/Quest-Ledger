<p align="center">
  <img src="build/icon.png" width="120" alt="Quest Ledger icon">
</p>

<h1 align="center">Quest Ledger</h1>

<p align="center">A to-do app that plays like a game. Complete quests, earn XP and gold, level up, and spend your gold on rewards you choose.</p>

<p align="center">
  <a href="../../releases/latest"><b>Download for Windows</b></a>
</p>

---

## Features

- **Quests**: dailies that reset at midnight, and one-time to-dos
- **Difficulty**: easy, medium, or hard quests worth +10, +25, or +50 XP
- **Levels**: an XP bar that fills up, and a level-up screen when you reach the next level
- **Streaks**: bonus XP for doing a daily several days in a row, plus an overall day streak
- **Gold and rewards shop**: every quest earns gold, which you spend on rewards you set yourself, like "30 minutes of gaming"
- **Achievements**: 12 badges to unlock
- **Stats**: a chart of the XP you earned over the last 7 days
- **Reminders**: Windows notifications at a time you choose for each quest
- **System tray**: closing the window keeps the app running in the tray so reminders still arrive
- **Start with Windows**: optional, and it opens quietly in the tray
- **Backups**: save your progress to a file and restore it any time
- **Light and dark mode**: follows your Windows theme

## Install

1. Go to [Releases](../../releases/latest) and download `QuestLedger-Setup-x.x.x.exe`.
2. Run it. Quest Ledger installs and opens, and adds a shortcut to your desktop and Start menu.

The installer isn't code-signed, so Windows may show **"Windows protected your PC"** the first time. Click **More info**, then **Run anyway**.

Your progress is saved on your PC in `%APPDATA%\Quest Ledger\ledger.json`.

## Run from source

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
git clone https://github.com/Noamkatzman/Quest-Ledger.git
cd Quest-Ledger
npm install
npm start
```

To build the Windows installer yourself:

```bash
npm run dist
```

The installer is written to the `dist/` folder.

## How it's built

Quest Ledger is an [Electron](https://www.electronjs.org/) app.

| File | What it does |
|---|---|
| `main.js` | Creates the window and tray icon, sends notifications, and reads and writes the save file |
| `preload.js` | The safe bridge between the app page and `main.js` |
| `app/index.html` | The whole interface: HTML, CSS, and the game logic |
| `build/icon.png` | The app icon |

## XP and levels

| Difficulty | XP | Gold |
|---|---|---|
| Easy | 10 | 3 |
| Medium | 25 | 8 |
| Hard | 50 | 15 |

Dailies get +2 bonus XP for each day of their streak, up to +20. Level 1 needs 100 XP, and each level after that needs 25 XP more than the one before.
