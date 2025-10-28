<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const ctaText = computed(() => {
  if (auth.isAuthenticated && route.name === 'profile') return 'LOGOUT'
  return auth.isAuthenticated ? 'PROFILE' : 'LOGIN'
})

const ctaTo = computed(() => (auth.isAuthenticated ? '/profile' : '/login'))

function go() {
  if (auth.isAuthenticated && route.name === 'profile') {
    auth.logout()
    router.push('/home')
    return
  }
  router.push(ctaTo.value)
}
</script>

<template>
  <nav class="w-full bg-transparent text-[var(--foreground)] fixed top-3 left-0 z-10">
    <div class="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
      <router-link to="/home" class="font-extrabold text-xl uppercase tracking-wide select-none nav-fall-in font-expanded">MELI</router-link>
      <button
        @click="go"
        class="px-0 py-2 bg-transparent text-[var(--foreground)] text-sm shadow-none rounded-none transition ghost-underline nav-fall-in"
      >
        {{ ctaText }}
      </button>
    </div>
  </nav>
</template>

 