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

### Build

Build for production:

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
.
├── src/
│   ├── api/                    # API services
│   │   ├── client.ts          # Axios client configuration
│   │   ├── post.ts            # Post API endpoints
│   │   ├── ranking.ts         # Ranking API endpoints
│   │   ├── reaction.ts        # Reaction API endpoints
│   │   ├── songRecommender.ts # Song Recommender API endpoints
│   │   ├── userAuthentication.ts # User Auth API endpoints
│   │   └── index.ts           # API exports
│   ├── stores/                # Pinia stores
│   │   ├── auth.ts           # Authentication store
│   │   ├── posts.ts          # Posts store
│   │   └── ranking.ts        # Ranking store
│   ├── components/           # Vue components
│   │   └── AuthExample.vue  # Example component
│   ├── utils/               # Utility functions
│   │   └── errorHandler.ts # Error handling
│   ├── App.vue              # Root component
│   ├── main.ts              # Application entry point
│   └── style.css            # Global styles (Tailwind)
├── public/                  # Static assets
├── all-api-spec.md         # Complete API specification
├── QUICK_START.md          # Quick reference guide
├── PROJECT_STRUCTURE.md    # Detailed architecture docs
├── SETUP_COMPLETE.md       # Setup summary
└── README.md               # This file
```

## API Configuration

The backend API is configured to run on `http://localhost:8000/api`. This is set
in `src/api/client.ts`.

To change the API URL, modify the `baseURL` in `src/api/client.ts`:

```typescript
const apiClient = axios.create({
    baseURL: "http://localhost:8000/api", // Change this URL
    headers: {
        "Content-Type": "application/json",
    },
});
```

## Available API Services

All API services are located in the `src/api/` directory and are fully typed
based on the API specification in `all-api-spec.md`:

### Post API (`postApi`)

- `create(userId, content, timestamp)` - Create a new post
- `delete(post)` - Delete a post
- `getPostsByAuthor(authorId)` - Get posts by author
- `getPostById(postId)` - Get post by ID

### Ranking API (`rankingApi`)

- `addComparison(user, songA, songB, preferred)` - Add song comparison
- `remove(user, song)` - Remove song from ranking
- `getRankings(user)` - Get user's ranked songs

### Reaction API (`reactionApi`)

- `add(post, reactionType, reactingUser)` - Add reaction to post
- `remove(post, reactionType, reactingUser)` - Remove reaction
- `getReactionsForPost(post)` - Get all reactions for a post
- `getReactionsByPostAndUser(post, reactingUser)` - Get user's reactions on a
  post

### Song Recommender API (`songRecommenderApi`)

- `addSongToCatalog(userId, songId)` - Add song to catalog
- `generateRecommendation(userId, count)` - Generate song recommendations
- `removeSong(userId, songId)` - Remove song from catalog

### User Authentication API (`userAuthApi`)

- `register(username, password)` - Register new user
- `authenticate(username, password)` - Login user
- `delete(user)` - Delete user
- `changePassword(user, oldPassword, newPassword)` - Change password
- `changeUsername(user, newUsername, password)` - Change username
- `getUserByUsername(username)` - Get user ID by username
- `getUsername(user)` - Get username by user ID

## Using Pinia Stores

### Example: Authentication Store

```typescript
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

// Register
await authStore.register("username", "password");

// Login
await authStore.login("username", "password");

// Logout
authStore.logout();

// Access state
console.log(authStore.userId);
console.log(authStore.isAuthenticated);
```

### Example: Posts Store

```typescript
import { usePostsStore } from "@/stores/posts";

const postsStore = usePostsStore();

// Create post
await postsStore.createPost(userId, "Post content");

// Fetch posts by author
await postsStore.fetchPostsByAuthor(authorId);

// Access posts
console.log(postsStore.posts);
```

## Tailwind CSS

Tailwind CSS is configured and ready to use. The configuration file is
`tailwind.config.js`.

Example usage in components:

```vue
<template>
  <div class="bg-blue-500 text-white p-4 rounded-lg">
    <h1 class="text-2xl font-bold">Hello World</h1>
  </div>
</template>
```

## Type Safety

All API responses are typed. Import types from the API modules:

```typescript
import type { Post, RankedSong, Reaction } from "@/api";
```

## Documentation

- **QUICK_START.md** - Quick reference with code examples
- **PROJECT_STRUCTURE.md** - Detailed project structure and architecture
- **SETUP_COMPLETE.md** - Setup summary and features
- **all-api-spec.md** - Complete API endpoint specifications

## Features

✅ Modern Vue 3 setup with TypeScript ✅ Fully typed API client for all backend
endpoints ✅ State management with Pinia ✅ Tailwind CSS for styling ✅ Path
aliases configured (`@/` for `src/`) ✅ Example components included ✅ Hot
Module Replacement (HMR) ✅ Production-ready build configuration ✅ Centralized
error handling

## Development Tips

1. **Hot Module Replacement (HMR)**: Changes are reflected instantly during
   development
2. **TypeScript**: Use type hints for better IDE support
3. **Composition API**: Leverage Vue 3's Composition API for better code
   organization
4. **Pinia Stores**: Use stores for global state management
5. **API Services**: Keep API logic separate from components

## Backend Connection

Make sure your backend API is running on `http://localhost:8000` before starting
the frontend application.

The frontend will connect to `http://localhost:8000/api` for all API calls.
