# The System

A Solo Leveling style daily quest tracker that runs in the browser. Set daily quests and side quests, earn XP, level up, grow your stats and attributes, and take a penalty when you slack. Everything is stored on your own device. No account, no server.

## Features

- **Status window**: name, title, level, rank, streak, XP bar, stats (Strength, Intelligence, Sense, Charm), money and attributes.
- **Attribute radar chart**: add or remove attributes. Tap one to see which tasks raised it (7 days, 30 days or all time).
- **Daily quests**: tasks that appear every day. Miss one and the penalty quest triggers, with points deducted from the related attribute and stat.
- **Side quests**: tasks for selected days of the week, every day, or one date.
- **Calendar and timeline**: month calendar with a day timeline, colour coded by attribute, with zoom for overlapping tasks.
- **Log**: green completion heatmap per month, a read-only day timeline, weekly goals and monthly goals.
- **Themes**: six colour themes, plus light and dark mode.
- **Reminders**: notifications at each task's start time (see "Notifications" below).
- **Installable and offline**: a service worker caches the app so it works without internet.

## Project structure

```
index.html          App shell
css/style.css       All styles and themes
js/app.js           All app logic
sw.js               Service worker (offline cache, notifications)
manifest.json       Web app manifest (install name, icons, colours)
icons/              App icons (PNG, maskable PNG, SVG)
README.md           This file
LICENSE             MIT licence
.nojekyll           Tells GitHub Pages to serve files as they are
```

## Run locally

Service workers need `http://localhost` or HTTPS, so do not open `index.html` by double clicking. Start a small server instead:

```
python3 -m http.server 8080
```

Then open http://localhost:8080.


## Install as an app

- **Android (Chrome)**: menu, then **Add to Home screen** or **Install app**.
- **iPhone (Safari)**: Share, then **Add to Home Screen**. Notifications on iPhone need iOS 16.4 or later and the app must be added to the Home Screen first.
- **Desktop (Chrome or Edge)**: use the install icon in the address bar.

## Notifications

Open **Settings > Alerts**, press **Enable alerts**, allow the permission, then press **Send test alert** to check that your device shows them.

How it works and what to expect:

- Alerts use the service worker (`registration.showNotification`), which is the only way notifications work on Android.
- While the app is open, or was used a moment ago, alerts fire at the task's start time.
- A web page cannot run timers once the browser freezes it. For a fully closed app the app tries two best effort methods when your browser supports them: scheduled notifications (`TimestampTrigger`) and periodic background sync. Browsers decide when periodic sync runs, so alerts can be late or skipped.
- On Android, set the browser's battery use to **Unrestricted** and keep notifications allowed.
- Guaranteed on-time alerts while the app is closed need either a push server (Web Push, the `push` handler is already in `sw.js`) or a native wrapper such as Capacitor with its Local Notifications plugin.

## Customise

- Colours and themes: the `TH` object in `js/app.js`.
- Default attributes, quote, penalty and title: the `def()` function in `js/app.js`.
- After changing any cached file, change `VERSION` in `sw.js` so installed copies update.

## Privacy

All data stays in your browser's local storage. Clearing site data erases it. Use **Settings > Data > Reset all data** to start fresh.

## Licence

MIT. See `LICENSE`.
