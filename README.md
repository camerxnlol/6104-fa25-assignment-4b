# Assignment 4B - Vue 3 Frontend

This repository contains a Vue.js v3 frontend application configured to work
with a backend API on port 8000.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management for Vue
- **Axios** - Promise-based HTTP client configured for
  `http://localhost:8000/api`

## Quick Start

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## User Journey

Bob opens the app. He’s greeted with a login screen. He tries his usual username
and password. If he didn't have an account, he'd click Register, enters a new
username and password, and gets signed in automatically. Next time, he can just
log in.

He lands on the Home page. It says “Ready to listen, Bob?” with a Generate
Recommendation button. He clicks it and a small dialog opens.

Bob types how many songs he wants (say 1) and hits Go. The app generates those
recommendations and takes him to the Rank page.

On the Rank page, Bob sees a list of “Outstanding Recommendations.” He clicks
one. A dialog opens showing that song, and a second button with another song to
compare against.

He starts ranking. If he prefers the selected song (Song A), the app keeps
showing another comparison song (Song B) moving upward through the ranked list
until he finally picks a B—or runs out of Bs. If he prefers the comparison song
first, the app moves downward through the ranked list until he picks A—or runs
out. When the comparison is decided (or short-circuited because there are no
more options), the app records the comparison and makes a post like “bob ranked
\[song] \[score]”.

Then Bob visits his Profile. He sees a list of posts the app created as he
ranked songs. Each post shows the timestamp and a short message like “bob ranked
It Will Rain - Bruno Mars 6.0”.

He clicks a post to open it. The dialog shows any existing reactions—just emojis
with counts. There’s a little + button; he taps it to pop open an emoji picker
(👍 ❤️ 😂 😮 😢 🔥 🎵). He picks one, and the reaction is added immediately. The
counts update both in the dialog and in the list.

<video src="UserJourney.mov" controls width="640">
  Your browser does not support the video tag. Here is a
  <a href="UserJourney.mov">link to the video</a> instead.

</video>
