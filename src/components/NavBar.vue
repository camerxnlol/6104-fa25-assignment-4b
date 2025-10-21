<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const ctaText = computed(() => (auth.isAuthenticated ? 'Profile' : 'Login'))
const ctaTo = computed(() => (auth.isAuthenticated ? '/profile' : '/login'))
function go() { router.push(ctaTo.value) }
</script>

<template>
  <nav class="w-full bg-[#02474D] text-white">
    <div class="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
      <div class="font-semibold text-lg text-white select-none">Meli</div>
      <button
        @click="go"
        class="px-4 py-2 rounded-lg bg-white text-[#02474D] font-medium shadow-sm hover:shadow-md hover:bg-white/90 transition"
      >
        {{ ctaText }}
      </button>
    </div>
  </nav>
</template>

 