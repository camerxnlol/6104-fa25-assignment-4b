# Quick Start Guide

## Installation & Running

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Using the API Services

### Example 1: User Authentication

```typescript
import { userAuthApi } from "@/api";

// Register a new user
const { user } = await userAuthApi.register("username", "password");

// Login
const { user } = await userAuthApi.authenticate("username", "password");
```

### Example 2: Using Pinia Stores

```typescript
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

// Register
await authStore.register("username", "password");

// Check auth state
console.log(authStore.isAuthenticated); // true
console.log(authStore.userId); // user ID
console.log(authStore.username); // username

// Logout
authStore.logout();
```

### Example 3: Creating Posts

```typescript
import { usePostsStore } from "@/stores/posts";

const postsStore = usePostsStore();

// Create a post
await postsStore.createPost(userId, "Hello world!");

// Fetch posts by author
await postsStore.fetchPostsByAuthor(authorId);

// Access posts
console.log(postsStore.posts);
```

### Example 4: Song Rankings

```typescript
import { useRankingStore } from "@/stores/ranking";

const rankingStore = useRankingStore();

// Add a comparison (user prefers songA over songB)
await rankingStore.addComparison(userId, songA, songB, songA);

// Get rankings
await rankingStore.fetchRankings(userId);

// Access ranked songs
console.log(rankingStore.rankings);
```

### Example 5: Direct API Calls

```typescript
import { postApi, reactionApi, songRecommenderApi } from "@/api";

// Create a post
const { post } = await postApi.create(
    userId,
    "content",
    new Date().toISOString(),
);

// Add a reaction
const { reactionId } = await reactionApi.add(postId, "❤️", userId);

// Get song recommendations
const { recommendedSongs } = await songRecommenderApi.generateRecommendation(
    userId,
    5,
);
```

## Component Example

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const username = ref('');
const password = ref('');

async function handleLogin() {
  try {
    await authStore.login(username.value, password.value);
    // Login successful!
  } catch (error) {
    console.error('Login failed:', error);
  }
}
</script>

<template>
  <div class="max-w-md mx-auto p-4">
    <input 
      v-model="username" 
      type="text" 
      placeholder="Username"
      class="w-full px-3 py-2 border rounded"
    />
    <input 
      v-model="password" 
      type="password" 
      placeholder="Password"
      class="w-full px-3 py-2 border rounded mt-2"
    />
    <button 
      @click="handleLogin"
      class="w-full bg-blue-600 text-white py-2 rounded mt-2"
    >
      Login
    </button>
  </div>
</template>
```

## Error Handling

```typescript
import { handleApiError } from "@/utils/errorHandler";

try {
    await someApiCall();
} catch (error) {
    const errorMessage = handleApiError(error);
    console.error(errorMessage);
    // Display error to user
}
```

## Tailwind CSS

Use utility classes for styling:

```vue
<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white rounded-lg shadow-md p-6 max-w-md">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Title</h1>
      <p class="text-gray-600">Content here</p>
      <button class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Click me
      </button>
    </div>
  </div>
</template>
```

## Path Aliases

Use `@/` to import from the `src/` directory:

```typescript
import { useAuthStore } from "@/stores/auth";
import { postApi } from "@/api";
import MyComponent from "@/components/MyComponent.vue";
```

## Backend API

The backend should be running on `http://localhost:8000`

API base URL: `http://localhost:8000/api`

To change this, edit `src/api/client.ts`
