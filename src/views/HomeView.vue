<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import { songRecommenderApi } from '@/api';
import router from '@/router';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'

const authStore = useAuthStore();
const { username, userId, isAuthenticated } = storeToRefs(authStore);

const songCount = ref<number | null>(null);
const recommendedSongs = ref<string[]>([]);
const generateError = ref<string | null>(null);
const recommendDialogOpen = ref(false);

async function onGenerateRecommendations() {
  recommendedSongs.value = [];
  generateError.value = null;
  const count = Number(songCount.value ?? 0);
  const uid = userId.value;
  if (!isAuthenticated.value || !uid) {
    router.push({ name: 'login' });
    return;
  }
  if (!Number.isFinite(count) || count <= 0) {
    // No new generation requested; still allow user to rank existing songs
    router.push({ name: 'rank' });
    return;
  }
  try {
    const resp = await songRecommenderApi.generateRecommendation(uid, count);
    // If API returns an error in a 200 response shape, surface it
    if (resp && typeof resp === 'object' && (resp as any).error) {
      generateError.value = String((resp as any).error);
      return;
    }
    const list = Array.isArray(resp?.recommendedSongs) ? resp.recommendedSongs : [];
    recommendedSongs.value = list;
    router.push({ name: 'rank' });
    recommendDialogOpen.value = false;
  } catch (e) {
    let message = 'Failed to generate recommendations';
    if (e && typeof e === 'object') {
      const anyErr = e as any;
      message = anyErr?.response?.data?.error || anyErr?.message || message;
    }
    generateError.value = String(message);
    // stay on page on error
  }
}
</script>

<template>
  <div class="min-h-screen w-full relative overflow-hidden -mt-16 flex items-center justify-center">
    <div class="relative z-10 text-center space-y-4 uppercase text-[var(--foreground)]">
      <h1 class="text-3xl font-semibold headline-words font-expanded">
        <span class="word">READY</span>
        <span class="word">TO</span>
        <span class="word">LISTEN,</span>
        <span class="word">{{ (username || 'GUEST').toUpperCase() }}?</span>
      </h1>
      <div v-if="isAuthenticated">
        <AlertDialog :open="recommendDialogOpen" @update:open="(v) => (recommendDialogOpen = v)">
          <AlertDialogTrigger>
            <button
              class="group relative px-8 py-4 bg-transparent text-[var(--foreground)] focus:outline-none rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 headline-rise-reveal button-rise-ease"
            >
              <!-- Button glow effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(251,240,218,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span class="relative text-lg tracking-wider ghost-underline-thick">
                GENERATE RECOMMENDATION
              </span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent class="uppercase">
            <AlertDialogCancel class="absolute right-4 top-4">Close</AlertDialogCancel>
            <AlertDialogHeader>
              <AlertDialogTitle>Generate Recommendation</AlertDialogTitle>
              <AlertDialogDescription>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div class="space-y- mt-2">
              <NumberField v-model="songCount" class="px-40">
                <Label class="whitespace-nowrap">Number of Songs</Label>
                <NumberFieldContent>
                  <NumberFieldDecrement />
                  <NumberFieldInput />
                  <NumberFieldIncrement />
                </NumberFieldContent>
              </NumberField>

              <div v-if="generateError" class="text-red-600 text-sm text-center px-40 pt-2 -mb-6">
                {{ generateError }}
              </div>

              <div v-if="recommendedSongs.length" class="text-left">
                <ul class="list-disc pl-5 space-y-1">
                  <li v-for="song in recommendedSongs" :key="song">{{ song }}</li>
                </ul>
              </div>
            </div>
            <div class="mt-3 flex justify-center">
              <button
                type="button"
                class="bg-transparent text-[var(--foreground)] pb-1 px-0 ghost-underline btn-fade-late hover:bg-transparent focus:bg-transparent active:bg-transparent"
                @click="onGenerateRecommendations"
              >
                GO!
              </button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div v-else class="pt-4">
        <button
          class="group relative px-8 py-4 bg-transparent text-[var(--foreground)] focus:outline-none rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 headline-rise-reveal button-rise-ease"
          @click="router.push({ name: 'login' })"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(251,240,218,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span class="relative text-lg md:text-xl tracking-wider font-medium ghost-underline-thick">
            LOG IN TO GENERATE RECOMMENDATIONS
          </span>
        </button>
      </div>
    </div>
  </div>
</template>


<style scoped>
/*  Animated gradient orbs for background effect */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(251, 240, 218, 0.3) 0%, transparent 70%);
  top: -10%;
  left: -10%;
  animation-delay: 0s;
  animation-duration: 25s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 200, 150, 0.25) 0%, transparent 70%);
  bottom: -5%;
  right: -5%;
  animation-delay: -8s;
  animation-duration: 22s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(251, 240, 218, 0.2) 0%, transparent 70%);
  top: 40%;
  right: 10%;
  animation-delay: -15s;
  animation-duration: 28s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.95);
  }
  75% {
    transform: translate(20px, 30px) scale(1.05);
  }
}

/*  Enhanced underline effect for buttons */
.ghost-underline-thick {
  position: relative;
  display: inline-block;
  text-decoration: none;
  line-height: 1;
  vertical-align: baseline;
}

.ghost-underline-thick::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  height: 2px;
  width: 100%;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.ghost-underline-thick:hover::after {
  transform: scaleX(1);
}

/*  Added delay variant for staggered animation */
.word.delay-1 {
  animation-delay: calc(var(--ani-duration) * 0.24) !important;
}
</style>