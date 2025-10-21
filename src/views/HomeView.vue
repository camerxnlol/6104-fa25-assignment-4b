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
const { username, userId } = storeToRefs(authStore);

const songCount = ref<number | null>(null);
const recommendedSongs = ref<string[]>([]);

async function onGenerateRecommendations() {
  recommendedSongs.value = [];
  const count = Number(songCount.value ?? 0);
  if (!userId.value) return;
  if (!Number.isFinite(count) || count <= 0) return;
  try {
    const resp = await songRecommenderApi.generateRecommendation(userId.value, count);
    const list = resp.recommendedSongs ?? [];
    recommendedSongs.value = list;
    router.push({ name: 'rank' });
  } catch (e) {
    // silently ignore
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-semibold">Ready to listen, {{ username || 'guest' }}?</h1>
      <AlertDialog>
        <AlertDialogTrigger>
          <button
            class="px-4 py-2 rounded bg-[#02474D] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black/50"
          >
            Generate Recommendation
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogCancel class="absolute right-4 top-4">Close</AlertDialogCancel>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Recommendation</AlertDialogTitle>
            <AlertDialogDescription>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div class="space-y-4 mt-2">
            <NumberField v-model="songCount" class="px-40">
              <Label>Number of Songs</Label>
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
          <div class="mt-6 flex justify-center">
            <AlertDialogAction class="px-6 bg-[#02474D] text-white" @click="onGenerateRecommendations">
              Go!
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</template>


