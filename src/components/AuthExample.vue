<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const mode = ref<'login' | 'register'>('login');

async function handleSubmit() {
  loading.value = true;
  error.value = '';
  
  try {
    if (mode.value === 'login') {
      await authStore.login(username.value, password.value);
    } else {
      await authStore.register(username.value, password.value);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    loading.value = false;
  }
}

function handleLogout() {
  authStore.logout();
  username.value = '';
  password.value = '';
  error.value = '';
}
</script>

<template>
  <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
    <div v-if="!authStore.isAuthenticated">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">
        {{ mode === 'login' ? 'Login' : 'Register' }}
      </h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Register' }}
        </button>
      </form>
      
      <div class="mt-4 text-center">
        <button
          @click="mode = mode === 'login' ? 'register' : 'login'"
          class="text-blue-600 hover:text-blue-700 text-sm"
        >
          {{ mode === 'login' ? 'Need an account? Register' : 'Have an account? Login' }}
        </button>
      </div>
    </div>
    
    <div v-else class="text-center">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Welcome!</h2>
      <p class="text-gray-600 mb-2">Username: <span class="font-semibold">{{ authStore.username }}</span></p>
      <p class="text-gray-600 mb-4">User ID: <span class="font-mono text-sm">{{ authStore.userId }}</span></p>
      <button
        @click="handleLogout"
        class="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
    </div>
  </div>
</template>

