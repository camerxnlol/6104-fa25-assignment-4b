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
    await auth.register(username.value, password.value)
    router.push('/home')
  } catch (err) {
    errorMessage.value = handleApiError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm bg-white rounded-xl shadow p-6">
    <div class="mb-4">
      <h1 class="text-2xl font-semibold pb-6">Create your account</h1>
      <p class="text-sm text-gray-600">Choose a username and password to get started</p>
    </div>
    <form class="grid gap-4" @submit.prevent="onSubmit">
      <div class="grid gap-2">
        <label for="username" class="text-sm font-medium text-gray-800">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#02474D]"
        />
      </div>
      <div class="grid gap-2">
        <div class="flex items-center">
          <label for="password" class="text-sm font-medium text-gray-800">Password</label>
        </div>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#02474D]"
        />
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full px-4 py-2 rounded-lg bg-[#02474D] text-white font-medium shadow-sm hover:shadow-md hover:bg-[#03545B] disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {{ loading ? 'Creating account…' : 'Sign up' }}
      </button>
      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
    </form>
    <div class="mt-4 text-center text-sm">
      Already have an account?
      <router-link to="/login" class="underline">Log in</router-link>
    </div>
  </div>
  </template>


