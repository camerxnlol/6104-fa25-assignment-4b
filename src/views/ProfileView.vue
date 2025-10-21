<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { rankingApi, type RankedSong } from '@/api';

const auth = useAuthStore();
const { userId } = storeToRefs(auth);

const rankings = ref<{ rankedSongs: RankedSong[] }>({ rankedSongs: [] });

onMounted(async () => {
  if (!userId.value) return;
  try {
    rankings.value = await rankingApi.getRankings(userId.value);
    console.log('rankings', rankings.value.rankedSongs);
  } catch (err) {
    console.error('Error fetching rankings:', err);
    // ignore errors
  }
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Profile</h1>
    <h2 class="text-xl font-medium mb-2">My Rankings</h2>
    <div v-if="!rankings.rankedSongs.length" class="text-sm text-muted-foreground">No rankings yet.</div>
    <ul v-else class="space-y-1 list-disc pl-5">
      <li v-for="r in rankings.rankedSongs" :key="r.songId">
        <span class="font-medium">{{ r.songId }}</span>
        <span class="text-muted-foreground"> — score: {{ (r.score / 10).toFixed(1) }}</span>
      </li>
    </ul>
  </div>
</template>
