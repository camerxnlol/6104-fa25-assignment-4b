<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { rankingApi, type RankedSong } from '@/api';
import { songRecommenderApi } from '@/api';
import { musicMetadataApi } from '@/api';
import type { SongMetadata } from '@/api/musicMetadata';
import { postApi } from '@/api';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Card,
  CardHeader,
} from '@/components/ui/card'
import SongArtwork from '@/components/SongArtwork.vue'
import SongTitleArtist from '@/components/SongTitleArtist.vue'

const auth = useAuthStore();
const { userId, username } = storeToRefs(auth);

const pastRecommendations = ref<string[]>([]);
const rankedSongs = ref<string[]>([]);
const rankedList = ref<RankedSong[]>([]);
const rankInfoById = computed(() => {
  const sorted = [...rankedList.value].sort((a, b) => b.score - a.score);
  const map: Record<string, { position: number; score: number }> = {};
  sorted.forEach((entry, i) => {
    map[entry.songId] = { position: i + 1, score: entry.score };
  });
  return map;
});
const unrankedPastSongs = ref<string[]>([]);
const songMeta = ref<Record<string, SongMetadata | null>>({});

const openSongId = ref<string | null>(null);
const activeSongId = ref<string | null>(null);
const competitorIndex = ref(0);
const direction = ref<"up" | "down" | null>(null);
const candidates = computed(() => rankedSongs.value.filter((id) => id !== activeSongId.value));
const currentCompetitorId = computed(() => candidates.value[competitorIndex.value]);
const currentCompetitorIdSafe = computed(() => currentCompetitorId.value ?? '');

function scoreDisplayById(id: string): string | null {
  const info = rankInfoById.value[id];
  if (!info) return null;
  return (info.score / 10).toFixed(1);
}

function getScoreColorClassById(id: string): string {
  const info = rankInfoById.value[id];
  if (!info) return '';
  const val = info.score / 10;
  if (val <= 3.3) return 'text-red-600';
  if (val <= 6.6) return 'text-yellow-600';
  return 'text-green-600';
}

onMounted(async () => {
  if (!userId.value) return;
    let past = [];
    try {
      past = await songRecommenderApi.getPastRecommendations(userId.value);
      const rankResponse = await rankingApi.getRankings(userId.value);
      pastRecommendations.value = past;
      // rankResponse should have rankedSongs: {songId: string, score: number}[]
      rankedList.value = rankResponse.rankedSongs as RankedSong[];
      rankedSongs.value = rankResponse.rankedSongs.map((r: {songId: string, score: number}) => r.songId);
      console.log('rankedSongs', rankedSongs.value);
      unrankedPastSongs.value = past.filter((song) => !rankedSongs.value.includes(song));
    // Fetch MusicBrainz metadata per unranked song using lookupSongMetadata
    for (const id of unrankedPastSongs.value) {
      try {
        songMeta.value[id] = await musicMetadataApi.lookupSongMetadata(id);
      } catch (_) {
        songMeta.value[id] = null;
      }
    }
  } catch (err) {
    console.error('Error fetching past recommendations or rankings:', err);
  }
});

async function onDialogOpenChange(song: string, isOpen: boolean) {
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

watch([currentCompetitorId, openSongId], async ([id, open]) => {
  if (!open) return;
  if (!id) return;
  if (songMeta.value[id] === undefined) {
    try {
      songMeta.value[id] = await musicMetadataApi.lookupSongMetadata(id);
    } catch (_) {
      songMeta.value[id] = null;
    }
  }
});

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
      rankedList.value = list;
      rankedSongs.value = list.map((r) => r.songId);
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
    <h1 class="text-2xl font-semibold mb-4 text-center fade-in-400">OUTSTANDING RECOMMENDATIONS</h1>
    <div v-if="!unrankedPastSongs.length" class="text-sm text-muted-foreground">
    </div>
    <div v-else class="flex flex-col gap-4">
      <div v-for="(song, idx) in unrankedPastSongs" :key="song" class="w-full px-36">
        <AlertDialog :open="openSongId === song" @update:open="(v) => onDialogOpenChange(song, v)">
          <AlertDialogTrigger class="block w-full">
            <Card class="w-full transition hover:shadow-md cursor-pointer card-slide-in" :style="{ animationDelay: (idx * 400) + 'ms' }">
              <CardHeader class="flex flex-row items-center gap-4">
                <Suspense>
                  <template #default>
                    <SongArtwork :song-id="song" :size="64" />
                  </template>
                  <template #fallback>
                    <div class="w-16 h-16 rounded bg-foreground/20 border border-border/30 animate-pulse" aria-busy="true" />
                  </template>
                </Suspense>
                <Suspense>
                  <template #default>
                    <SongTitleArtist :song-id="song" />
                  </template>
                  <template #fallback>
                    <div class="space-y-1" aria-busy="true">
                      <div class="h-4 w-28 bg-foreground/20 border border-border/30 rounded animate-pulse" />
                      <div class="h-3 w-16 bg-foreground/20 border border-border/30 rounded animate-pulse" />
                    </div>
                  </template>
                </Suspense>
              </CardHeader>
            </Card>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogCancel class="absolute right-4 top-4">Close</AlertDialogCancel>
            <AlertDialogHeader>
              <AlertDialogTitle>COMPARE</AlertDialogTitle>
            </AlertDialogHeader>
            <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              <div class="flex flex-col items-center text-center gap-2">
                <div class="relative inline-block">
                  <Suspense>
                    <template #default>
                      <SongArtwork :song-id="song" :size="120" />
                    </template>
                    <template #fallback>
                      <div class="w-28 h-28 rounded bg-foreground/20 border border-border/30 animate-pulse" aria-busy="true" />
                    </template>
                  </Suspense>
                  <div v-if="scoreDisplayById(song)" class="absolute top-1 right-1 w-8 h-8 rounded-full bg-white border border-border text-xs font-semibold shadow-sm flex items-center justify-center" :class="getScoreColorClassById(song)" :aria-label="`Score: ${scoreDisplayById(song)}`">
                    {{ scoreDisplayById(song) }}
                  </div>
                </div>
                <div class="text-sm">
                  <Suspense>
                    <template #default>
                      <SongTitleArtist :song-id="song" />
                    </template>
                    <template #fallback>
                      <div class="space-y-1">
                        <div class="h-4 w-32 bg-muted/20 rounded animate-pulse" />
                        <div class="h-3 w-20 bg-muted/20 rounded animate-pulse" />
                      </div>
                    </template>
                  </Suspense>
                </div>
              </div>

              <div v-if="candidates.length" class="flex flex-col items-center text-center gap-2">
                <div class="relative inline-block">
                  <Suspense>
                    <template #default>
                      <SongArtwork :song-id="currentCompetitorIdSafe" :size="120" />
                    </template>
                    <template #fallback>
                      <div class="w-28 h-28 rounded bg-foreground/20 border border-border/30 animate-pulse" aria-busy="true" />
                    </template>
                  </Suspense>
                  <div v-if="scoreDisplayById(currentCompetitorIdSafe)" class="absolute top-1 right-1 w-8 h-8 rounded-full bg-white border border-border text-xs font-semibold shadow-sm flex items-center justify-center" :class="getScoreColorClassById(currentCompetitorIdSafe)" :aria-label="`Score: ${scoreDisplayById(currentCompetitorIdSafe)}`">
                    {{ scoreDisplayById(currentCompetitorIdSafe) }}
                  </div>
                </div>
                <div class="text-sm">
                  <Suspense>
                    <template #default>
                      <SongTitleArtist :song-id="currentCompetitorIdSafe" />
                    </template>
                    <template #fallback>
                      <div class="space-y-1">
                        <div class="h-4 w-32 bg-muted/20 rounded animate-pulse" />
                        <div class="h-3 w-20 bg-muted/20 rounded animate-pulse" />
                      </div>
                    </template>
                  </Suspense>
                </div>
              </div>
            </div>
            <div class="mt-6 flex flex-col items-center gap-3">
              <div class="flex gap-3">
                <button class="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90" @click="selectPreferred(true)">
                  Choose {{ songMeta[song]?.title || 'This Song' }}
                </button>
                <button v-if="candidates.length" class="px-4 py-2 rounded border hover:bg-accent" @click="selectPreferred(false)">
                  Choose {{ songMeta[currentCompetitorIdSafe]?.title || 'This Song' }}
                </button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  </div>
</template>


