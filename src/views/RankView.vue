<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { rankingApi, type RankedSong } from '@/api';
import { songRecommenderApi } from '@/api';
import { postApi } from '@/api';
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
const { userId, username } = storeToRefs(auth);

const pastRecommendations = ref<string[]>([]);
const rankedSongs = ref<string[]>([]);
const unrankedPastSongs = ref<string[]>([]);

const openSongId = ref<string | null>(null);
const activeSongId = ref<string | null>(null);
const competitorIndex = ref(0);
const direction = ref<"up" | "down" | null>(null);
const candidates = computed(() => rankedSongs.value.filter((id) => id !== activeSongId.value));

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
    direction.value = null;
    openSongId.value = song;
  } else {
    openSongId.value = null;
    activeSongId.value = null;
    direction.value = null;
  }
}

async function finalizeComparison(preferredId: string, otherId?: string) {
  if (!userId.value || !activeSongId.value) return;
  const songA = activeSongId.value;
  const songB = otherId ?? songA;
  try {
    await rankingApi.addComparison(userId.value, songA, songB, preferredId);
    try {
      const ranks = await rankingApi.getRankings(userId.value);
      const list: RankedSong[] = Array.isArray((ranks as any)?.rankedSongs)
        ? (ranks as any).rankedSongs
        : (Array.isArray(ranks) ? (ranks as RankedSong[]) : []);
      const entry = list.find((r) => r.songId === songA);
      const normalized = entry ? (entry.score / 10).toFixed(1) : 'N/A';
      const content = `${username.value ?? 'user'} ranked ${songA} ${normalized}`;
      await postApi.create(userId.value, content, new Date().toISOString());
    } catch (_) {}
  } catch (err) {
    console.error('Error finalizing comparison:', err);
  } finally {
    openSongId.value = null;
    activeSongId.value = null;
    direction.value = null;
  }
}

function advanceOrFinalize(preferA: boolean) {
  const len = candidates.value.length;
  if (len === 0) {
    // No competitors at all
    finalizeComparison(activeSongId.value!);
    return;
  }
  // Set direction on first choice
  if (direction.value === null) direction.value = preferA ? 'up' : 'down';

  if (direction.value === 'up') {
    // Move to a better B (higher index)
    if (preferA) {
      competitorIndex.value += 1;
      if (competitorIndex.value >= len) {
        // out of candidates → finalize preferring A vs last
        finalizeComparison(activeSongId.value!, candidates.value[len - 1] as string);
      }
    } else {
      // User picked B → finalize with current competitor
      finalizeComparison(candidates.value[competitorIndex.value] as string, activeSongId.value!);
    }
  } else {
    // direction === 'down' → move to worse B (lower index)
    if (!preferA) {
      competitorIndex.value -= 1;
      if (competitorIndex.value < 0) {
        // out of candidates → finalize preferring current B (the first one we had)
        finalizeComparison(candidates.value[0] as string, activeSongId.value!);
      }
    } else {
      // User picked A → finalize with current competitor
      finalizeComparison(activeSongId.value!, candidates.value[Math.max(0, competitorIndex.value)] as string);
    }
  }
}

async function selectPreferred(preferA: boolean) {
  if (!userId.value || !activeSongId.value) return;
  // Ensure index is within bounds before using it in the UI
  if (competitorIndex.value < 0) competitorIndex.value = 0;
  if (competitorIndex.value >= candidates.value.length && candidates.value.length > 0) {
    competitorIndex.value = candidates.value.length - 1;
  }
  advanceOrFinalize(preferA);
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
                <button v-if="candidates.length" class="px-4 py-2 rounded border hover:bg-accent" @click="selectPreferred(false)">
                  Choose {{ candidates[competitorIndex] }}
                </button>
              </div>
              <div v-if="candidates.length" class="text-xs text-muted-foreground">
                Comparing against {{ candidates[competitorIndex] }} ({{ Math.min(competitorIndex + 1, candidates.length) }}/{{ candidates.length }})
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </li>
    </ul>
  </div>
</template>


