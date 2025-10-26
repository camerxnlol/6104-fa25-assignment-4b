<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { handleApiError } from '@/utils/errorHandler'

const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function onSubmit() {
  if (loading.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    await auth.login(username.value, password.value)
    router.push('/home')
  } catch (err) {
    errorMessage.value = handleApiError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm bg-transparent p-6 text-[var(--foreground)]">
    <div class="mb-4">
      <h1 class="text-2xl font-semibold pb-6 uppercase">Login</h1>
      <p class="text-sm opacity-80">Enter your username and password to continue</p>
    </div>
    <form class="grid gap-4" @submit.prevent="onSubmit">
      <div class="grid gap-2">
        <label for="username" class="text-sm font-medium uppercase">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          required
          class="w-full px-3 py-2 rounded-md bg-transparent border border-[var(--foreground)]/40 text-[var(--foreground)] placeholder:[color:var(--foreground)]/50 focus:outline-none focus:ring-0 focus:border-[var(--foreground)]"
        />
      </div>
      <div class="grid gap-2">
        <div class="flex items-center">
          <label for="password" class="text-sm font-medium uppercase">Password</label>
        </div>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="w-full px-3 py-2 rounded-md bg-transparent border border-[var(--foreground)]/40 text-[var(--foreground)] placeholder:[color:var(--foreground)]/50 focus:outline-none focus:ring-0 focus:border-[var(--foreground)]"
        />
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="mx-auto py-1 bg-transparent text-[var(--foreground)] uppercase shadow-none rounded-none ghost-underline disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Logging in…' : 'LOGIN' }}
      </button>
      <p v-if="errorMessage" class="text-sm text-red-400">{{ errorMessage }}</p>
    </form>
    <div class="mt-4 text-center text-sm">
      Don't have an account?
      <router-link to="/register" class="ghost-underline">Sign up</router-link>
    </div>
  </div>
  </template>
