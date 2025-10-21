<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { rankingApi, type RankedSong } from '@/api';
import { songRecommenderApi } from '@/api';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const auth = useAuthStore();
const { userId } = storeToRefs(auth);

const pastRecommendations = ref<string[]>([]);
const rankedSongs = ref<Array<string>>([]);
const unrankedPastSongs = ref<string[]>([]);
const rankingsList = ref<RankedSong[]>([]);

const openSongId = ref<string | null>(null);
const activeSongId = ref<string | null>(null);
const competitorIndex = ref(0);

onMounted(async () => {
  if (!userId.value) return;
    let past = [];
    try {
      past = await songRecommenderApi.getPastRecommendations(userId.value);
      const rankResponse = await rankingApi.getRankings(userId.value);
      pastRecommendations.value = past;
      // rankResponse should have rankedSongs: {songId: string, score: number}[]
      rankedSongs.value = rankResponse.rankedSongs.map((r: {songId: string, score: number}) => r.songId);
      console.log('rankedSongs', rankedSongs.value);
      unrankedPastSongs.value = past.filter((song) => !rankedSongs.value.includes(song));
  } catch (err) {
    console.error('Error fetching past recommendations or rankings:', err);
  }
});

function onDialogOpenChange(song: string, isOpen: boolean) {
  if (isOpen) {
    activeSongId.value = song;
    competitorIndex.value = 0;
    openSongId.value = song;
  } else {
    openSongId.value = null;
    activeSongId.value = null;
  }
}

async function selectPreferred(preferA: boolean) {
  if (!userId.value || !activeSongId.value) return;
  const competitor = rankedSongs.value[competitorIndex.value];

  const songA = activeSongId.value;
  const songB = competitor;
  const preferred = preferA ? songA : songB ? songB : undefined;

  try {
    if (songB) {
      await rankingApi.addComparison(userId.value, songA, preferred!, songB);
    } else {
      await rankingApi.addComparison(userId.value, songA, songA);
    }
  } catch (err) {
    console.error('Error adding comparison:', err);
    // ignore errors per requirements
  }

  if (preferA) {
    // One last comparison done choosing A; close dialog
    openSongId.value = null;
    activeSongId.value = null;
    return;
  }

  // Move to next competitor
  competitorIndex.value += 1;
  if (competitorIndex.value >= rankedSongs.value.length) {
    // No more competitors; close
    openSongId.value = null;
    activeSongId.value = null;
  }
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Outstanding Recommendations</h1>
    <div v-if="!unrankedPastSongs.length" class="text-sm text-muted-foreground">
      No recommendations available.
    </div>
    <ul v-else class="list-decimal pl-6 space-y-2">
      <li v-for="song in unrankedPastSongs" :key="song">
        <AlertDialog :open="openSongId === song" @update:open="(v) => onDialogOpenChange(song, v)">
          <AlertDialogTrigger>
            <button class="underline text-primary hover:opacity-80">{{ song }}</button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogCancel class="absolute right-4 top-4">Close</AlertDialogCancel>
            <AlertDialogHeader>
              <AlertDialogTitle>{{ song }}</AlertDialogTitle>
              <AlertDialogDescription>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div class="mt-6 flex flex-col items-center gap-3">
              <div class="flex gap-3">
                <button class="px-4 py-2 rounded bg-[#02474D] text-white hover:opacity-90" @click="selectPreferred(true)">
                  Choose This Song
                </button>
                <button v-if="competitorIndex < rankedSongs.length" class="px-4 py-2 rounded border hover:bg-accent" @click="selectPreferred(false)">
                  Choose {{ rankedSongs[competitorIndex] }}
                </button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </li>
    </ul>
  </div>
</template>


