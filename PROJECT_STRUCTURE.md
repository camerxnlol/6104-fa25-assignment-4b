# Project Structure

This document provides a comprehensive overview of the project structure and
organization.

## Directory Structure

```
.
├── src/
│   ├── api/                    # API service layer
│   │   ├── client.ts          # Axios configuration & base client
│   │   ├── index.ts           # API exports barrel file
│   │   ├── post.ts            # Post concept API endpoints
│   │   ├── ranking.ts         # Ranking concept API endpoints
│   │   ├── reaction.ts        # Reaction concept API endpoints
│   │   ├── songRecommender.ts # Song Recommender concept API endpoints
│   │   └── userAuthentication.ts # User Auth concept API endpoints
│   │
│   ├── stores/                # Pinia state management
│   │   ├── auth.ts           # Authentication state & actions
│   │   ├── posts.ts          # Posts state & actions
│   │   └── ranking.ts        # Rankings state & actions
│   │
│   ├── components/           # Vue components
│   │   └── AuthExample.vue  # Example authentication component
│   │
│   ├── utils/               # Utility functions
│   │   └── errorHandler.ts # API error handling utilities
│   │
│   ├── assets/             # Static assets (images, icons, etc.)
│   │   └── vue.svg
│   │
│   ├── App.vue             # Root component
│   ├── main.ts             # Application entry point
│   └── style.css           # Global styles (Tailwind directives)
│
├── public/                 # Public static assets
│   └── vite.svg
│
├── dist/                   # Build output (gitignored)
├── node_modules/          # Dependencies (gitignored)
│
├── .gitignore            # Git ignore rules
├── index.html            # HTML entry point
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript configuration
├── tsconfig.app.json     # App-specific TypeScript config
├── tsconfig.node.json    # Node-specific TypeScript config
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
│
├── README.md             # Main documentation
├── QUICK_START.md        # Quick start guide
└── PROJECT_STRUCTURE.md  # This file
```

## Key Files Explained

### Configuration Files

#### `vite.config.ts`

- Vite build tool configuration
- Defines path aliases (`@/` → `src/`)
- Vue plugin setup

#### `tsconfig.app.json`

- TypeScript configuration for app code
- Enables strict type checking
- Configures path aliases for imports
- Sets up Vue support

#### `tailwind.config.js`

- Tailwind CSS configuration
- Defines content sources for CSS purging
- Custom theme extensions (if any)

#### `postcss.config.js`

- PostCSS configuration
- Integrates Tailwind CSS and Autoprefixer

#### `package.json`

- Project dependencies
- NPM scripts (dev, build, preview)
- Project metadata

### Source Code

#### `src/main.ts`

Entry point of the application. Sets up:

- Vue app instance
- Pinia state management
- Global styles
- Root component mounting

#### `src/App.vue`

Root Vue component. Contains:

- Main application layout
- Welcome page demonstrating Tailwind CSS
- Overview of configured features

#### `src/style.css`

Global stylesheet with Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### API Layer (`src/api/`)

The API layer provides a clean interface to the backend.

#### `client.ts`

- Configures Axios instance
- Sets base URL (`http://localhost:8000/api`)
- Sets default headers
- Exports configured client

#### API Service Files

Each file corresponds to a backend concept:

- **`post.ts`**: Post creation, deletion, and retrieval
- **`ranking.ts`**: Song ranking and comparison management
- **`reaction.ts`**: Emoji reactions on posts
- **`songRecommender.ts`**: Song catalog and recommendations
- **`userAuthentication.ts`**: User registration, login, password management

#### `index.ts`

Barrel file that exports all API services and types for convenient importing.

### State Management (`src/stores/`)

Pinia stores manage global application state.

#### `auth.ts`

Manages authentication state:

- `userId`: Current user ID
- `username`: Current username
- `isAuthenticated`: Auth status
- `error`: Auth error messages
- Actions: `register()`, `login()`, `logout()`

#### `posts.ts`

Manages posts state:

- `posts`: Array of posts
- `loading`: Loading state
- `error`: Error messages
- Actions: `createPost()`, `fetchPostsByAuthor()`, `deletePost()`

#### `ranking.ts`

Manages song rankings:

- `rankings`: Array of ranked songs
- `loading`: Loading state
- `error`: Error messages
- Actions: `addComparison()`, `fetchRankings()`, `removeSong()`

### Components (`src/components/`)

#### `AuthExample.vue`

Demonstrates:

- Using Pinia stores in components
- Form handling with v-model
- Conditional rendering
- Tailwind CSS styling
- Error handling

### Utilities (`src/utils/`)

#### `errorHandler.ts`

Provides centralized error handling:

- `handleApiError()`: Extracts user-friendly error messages from API errors
- Type guards for Axios errors
- Helpful messages when backend is unreachable

## Naming Conventions

### Files

- **Components**: PascalCase (e.g., `AuthExample.vue`)
- **Stores**: camelCase (e.g., `auth.ts`)
- **API Services**: camelCase (e.g., `post.ts`)
- **Utilities**: camelCase (e.g., `errorHandler.ts`)

### Code

- **Variables/Functions**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Components**: PascalCase

## Import Patterns

### Path Aliases

Use `@/` for imports from `src/`:

```typescript
// Good
import { useAuthStore } from "@/stores/auth";
import { postApi } from "@/api";

// Avoid
import { useAuthStore } from "../stores/auth";
import { postApi } from "../api";
```

### API Imports

```typescript
// Import specific API
import { postApi } from "@/api";

// Import types
import type { Post, RankedSong } from "@/api";

// Import multiple APIs
import { postApi, reactionApi, userAuthApi } from "@/api";
```

### Store Imports

```typescript
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useRankingStore } from "@/stores/ranking";
```

## Design Patterns

### API Services

- Each concept has its own service file
- Services export typed functions
- All API calls go through the configured Axios client
- Return typed responses

### Pinia Stores

- Use Composition API style (setup function)
- Reactive state with `ref()`
- Async actions for API calls
- Error handling in stores
- Loading states for async operations

### Components

- Use `<script setup>` syntax
- Composition API for logic
- Tailwind CSS for styling
- Props and emits are typed
- Error handling at component level

### Error Handling

- Centralized in `errorHandler.ts`
- User-friendly messages
- Specific handling for network errors
- Errors bubble up from API → Store → Component

## Backend Integration

### API Endpoints

All endpoints follow the pattern:

```
POST http://localhost:8000/api/{Concept}/{action}
```

Examples:

- `POST /api/UserAuthentication/register`
- `POST /api/Post/create`
- `POST /api/Ranking/addComparison`

### Request/Response Format

All requests and responses use JSON.

See `all-api-spec.md` for complete endpoint documentation.

## Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Edit components in `src/components/`
   - Update stores in `src/stores/`
   - Modify API services in `src/api/`

3. **Test Changes**
   - Hot Module Replacement (HMR) updates instantly
   - Check browser console for errors
   - Verify TypeScript types

4. **Build for Production**
   ```bash
   npm run build
   ```

5. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Adding New Features

### Adding a New API Endpoint

1. Add endpoint to appropriate service in `src/api/`
2. Update types if needed
3. Export from `src/api/index.ts` if it's a new type

### Adding a New Store

1. Create file in `src/stores/`
2. Define state and actions
3. Use API services for async operations
4. Include error handling and loading states

### Adding a New Component

1. Create `.vue` file in `src/components/`
2. Use `<script setup lang="ts">`
3. Import and use stores as needed
4. Style with Tailwind CSS

## Best Practices

1. **Type Safety**: Always use TypeScript types
2. **Error Handling**: Use the error handler utility
3. **Loading States**: Show loading indicators for async operations
4. **Path Aliases**: Use `@/` for cleaner imports
5. **Component Composition**: Keep components focused and small
6. **State Management**: Use Pinia for global state, local state for
   component-specific data
7. **API Abstraction**: Never call Axios directly in components, use API
   services
8. **Styling**: Prefer Tailwind utilities over custom CSS
