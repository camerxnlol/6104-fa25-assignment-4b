<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import { songRecommenderApi } from '@/api';
import router from '@/router';
import {
  AlertDialog,
  AlertDialogAction,
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

async function onGenerateRecommendations() {
  recommendedSongs.value = [];
  const count = Number(songCount.value ?? 0);
  const uid = userId.value;
  if (!isAuthenticated.value || !uid) {
    router.push({ name: 'login' });
    return;
  }
  if (!Number.isFinite(count) || count <= 0) return;
  try {
    const resp = await songRecommenderApi.generateRecommendation(uid, count);
    const list = resp.recommendedSongs ?? [];
    recommendedSongs.value = list;
    router.push({ name: 'rank' });
  } catch (e) {
    // silently ignore
  }
}
</script>

<template>
  <div class="min-h-screen -mt-16 flex items-center justify-center">
    <div class="text-center space-y-4 uppercase text-[var(--foreground)]">
      <h1 class="text-3xl font-semibold headline-words font-expanded">
        <span class="word">READY</span>
        <span class="word">TO</span>
        <span class="word">LISTEN,</span>
        <span class="word">{{ (username || 'GUEST').toUpperCase() }}?</span>
      </h1>
      <div v-if="isAuthenticated">
        <AlertDialog>
          <AlertDialogTrigger>
            <button
              class="px-0 py-2 bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-0 rounded-none shadow-none ghost-underline btn-fade-late"
            >
              GENERATE RECOMMENDATION
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

              <div v-if="recommendedSongs.length" class="text-left">
                <ul class="list-disc pl-5 space-y-1">
                  <li v-for="song in recommendedSongs" :key="song">{{ song }}</li>
                </ul>
              </div>
            </div>
            <div class="mt-3 flex justify-center">
              <AlertDialogAction
                class="bg-transparent text-[var(--foreground)] pb-0 px-0 ghost-underline btn-fade-late hover:bg-transparent focus:bg-transparent active:bg-transparent"
                @click="onGenerateRecommendations"
              >
                GO!
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div v-else>
        <button
          class="px-0 py-2 bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-0 rounded-none shadow-none ghost-underline btn-fade-late"
          @click="router.push({ name: 'login' })"
        >
          LOG IN TO GENERATE RECOMMENDATIONS
        </button>
      </div>
    </div>
  </div>
</template>


