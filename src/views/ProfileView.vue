<script setup lang="ts">
import { onMounted, ref, defineComponent, h, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { postApi, type Post } from '@/api';
import { reactionApi, type Reaction } from '@/api';
import { musicMetadataApi } from '@/api';
import { rankingApi, type RankedSong } from '@/api';
import { userAuthApi } from '@/api';
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

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const { userId, username } = storeToRefs(auth);

const posts = ref<Post[]>([]);
const reactionsByPost = ref<Record<string, Record<string, number>>>({});
const emojiPickerOpenFor = ref<string | null>(null);
const emojiPickerOpenForModal = ref<string | null>(null);
const openPostId = ref<string | null>(null);
const kebabOpenFor = ref<string | null>(null);
const rankedSongs = ref<RankedSong[]>([]);
const topRank = ref<{ id: string; score: number } | null>(null);
const topTitle = ref<string | null>(null);
const displayUsername = ref<string | null>(null);

// Determine which user's profile we're viewing: self or :userId route param
const activeUserId = computed<string | null>(() => {
  const paramUserId = route.params.userId ? String(route.params.userId) : null;
  return paramUserId || userId.value || null;
});
const isSelfProfile = computed<boolean>(() => !!userId.value && activeUserId.value === userId.value);

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎵'];

async function loadPosts() {
  if (!activeUserId.value) return;
  const result = await postApi.getPostsByAuthor(activeUserId.value);
  posts.value = (result ?? [])
    .map((p) => p.post)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

async function loadRankings() {
  if (!activeUserId.value) return;
  try {
    const resp = await rankingApi.getRankings(activeUserId.value);
    rankedSongs.value = resp.rankedSongs || [];
    if (rankedSongs.value.length) {
      const sorted = [...rankedSongs.value].sort((a, b) => b.score - a.score);
      const best = sorted[0];
      if (best) {
        topRank.value = { id: best.songId, score: Number((best.score / 10).toFixed(1)) };
        try {
          const meta = await musicMetadataApi.lookupSongMetadata(best.songId);
          topTitle.value = meta?.title || best.songId;
        } catch (_) {
          topTitle.value = best.songId;
        }
      } else {
        topRank.value = null;
        topTitle.value = null;
      }
    } else {
      topRank.value = null;
      topTitle.value = null;
    }
  } catch (_) {
    rankedSongs.value = [];
    topRank.value = null;
    topTitle.value = null;
  }
}

async function loadDisplayUsername() {
  // If viewing own profile, use store username; else fetch by userId
  if (!activeUserId.value) {
    displayUsername.value = username.value ?? null;
    return;
  }
  if (activeUserId.value === userId.value) {
    displayUsername.value = username.value ?? null;
    return;
  }
  try {
    const resp = await userAuthApi.getUsername(activeUserId.value);
    displayUsername.value = Array.isArray(resp) && resp[0]?.username ? resp[0].username : null;
  } catch (_) {
    displayUsername.value = null;
  }
}

function aggregateReactions(reactions: Array<{ reactions: Reaction }>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of reactions) {
    const emoji = item.reactions.reactionType;
    counts[emoji] = (counts[emoji] ?? 0) + 1;
  }
  return counts;
}

async function loadReactions(postId: string) {
  const resp = await reactionApi.getReactionsForPost(postId);
  reactionsByPost.value[postId] = aggregateReactions(resp ?? []);
}

async function addReaction(postId: string, emoji: string) {
  if (!userId.value) return;
  await reactionApi.add(postId, emoji, userId.value);
  await loadReactions(postId);
  emojiPickerOpenFor.value = null;
}

onMounted(async () => {
  try {
    await Promise.all([loadDisplayUsername(), loadPosts(), loadRankings()]);
    await Promise.all(posts.value.map((p) => loadReactions(p._id)));
  } catch (err) {
    console.error('Error loading profile data:', err);
  }
});

watch(activeUserId, async () => {
  try {
    posts.value = [];
    rankedSongs.value = [];
    topRank.value = null;
    topTitle.value = null;
    await Promise.all([loadDisplayUsername(), loadPosts(), loadRankings()]);
    await Promise.all(posts.value.map((p) => loadReactions(p._id)));
  } catch (err) {
    console.error('Error reloading profile data:', err);
  }
});

watch(openPostId, (val) => {
  if (val) {
    // Dialog opened → ensure feed emoji pickers are closed
    emojiPickerOpenFor.value = null;
  } else {
    // Dialog closed → ensure modal emoji pickers are closed
    emojiPickerOpenForModal.value = null;
    kebabOpenFor.value = null;
  }
});

// feed reaction toggling handled inline; modal toggle ensures feed picker is closed

function toggleModalEmoji(postId: string) {
  emojiPickerOpenForModal.value = emojiPickerOpenForModal.value === postId ? null : postId;
  // Close feed picker if open
  emojiPickerOpenFor.value = null;
}

function toggleKebabMenu(postId: string) {
  kebabOpenFor.value = kebabOpenFor.value === postId ? null : postId;
  // Close any emoji pickers when opening kebab
  emojiPickerOpenFor.value = null;
  emojiPickerOpenForModal.value = null;
}

async function deletePostById(postId: string) {
  try {
    await postApi.delete(postId);
    posts.value = posts.value.filter((p) => p._id !== postId);
    delete reactionsByPost.value[postId];
    if (openPostId.value === postId) openPostId.value = null;
    kebabOpenFor.value = null;
  } catch (err) {
    console.error('Failed to delete post:', err);
  }
}

// no-op: page-level logout removed; use navbar logout instead

function parsePostContent(content: string): { username: string | null; songId: string | null; score: number | null } {
  // Expected format from RankView: "<username> ranked <songId> <score>"
  const match = content.match(/^(.*)\s+ranked\s+([^\s]+)\s+([0-9.]+)$/);
  if (!match) return { username: null, songId: null, score: null };
  const [, uname, songId, scoreStr] = match;
  const scoreNum = Number(scoreStr);
  return { username: uname?.trim() || null, songId: songId || null, score: Number.isFinite(scoreNum) ? scoreNum : null };
}

function getScoreColorClass(val: number | null): string {
  if (val == null) return '';
  if (val <= 3.3) return 'text-red-600';
  if (val <= 6.6) return 'text-yellow-600';
  return 'text-green-600';
}

const OneLineSongText = defineComponent<{ username?: string | null; songId: string }>(
  {
    name: 'OneLineSongText',
    props: {
      username: { type: String, required: false },
      songId: { type: String, required: true },
    },
    async setup(props) {
      const meta = await musicMetadataApi.lookupSongMetadata(props.songId);
      const title = meta?.title || props.songId;
      const artist = meta?.artist || '';
      const before = `${props.username || 'user'} ranked `;
      const after = artist ? ` by ${artist}` : '';
      return () => h('p', { class: 'text-left' }, [before, h('em', { class: 'italic' }, title), after]);
    },
  }
);
</script>

<template>
  <div class="p-6">
    <div class="max-w-xl mx-auto space-y-3">
      <Card class="w-full transition shadow-none border-0 !py-0 mb-4">
        <CardHeader class="gap-1 !px-3 pb-2">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 flex-1">
              <div class="flex-1 text-left flex flex-col">
                <p class="text-left text-3xl font-semibold">
                  {{ (displayUsername || username || 'User') + "'s" }}
                </p>
                <p class="text-left text-2xl font-semibold pb-3">
                  RANKINGS
                </p>
                <div class="flex items-center gap-2">
                  <button
                    v-if="isSelfProfile"
                    class="px-3 py-1.5 rounded border hover:bg-accent text-sm uppercase w-max"
                    @click="router.push({ name: 'rank' })"
                  >
                    view recommendations
                  </button>
                  <button
                    v-if="isSelfProfile"
                    class="px-3 py-1.5 rounded border hover:bg-accent text-sm uppercase w-max"
                    @click="router.push({ name: 'friends' })"
                  >
                    friends
                  </button>
                </div>
              </div>
            </div>
            <div class="text-right text-sm">
              <div>
                <span class="text-muted-foreground">Total rankings:</span>
                <span class="font-semibold ml-1">{{ rankedSongs.length }}</span>
              </div>
              <div class="mt-1">
                <span class="text-muted-foreground">Highest rated:</span>
                <span v-if="topRank && topTitle" class="font-semibold ml-1">{{ topTitle }} - {{ topRank.score.toFixed(1) }}</span>
                <span v-else class="text-muted-foreground ml-1">N/A</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>

    <div v-if="posts.length" class="max-w-xl mx-auto space-y-3">
      <div v-for="(p, idx) in posts" :key="p._id" class="relative">
        <AlertDialog :open="openPostId === p._id" @update:open="(v) => openPostId = v ? p._id : null">
          <AlertDialogTrigger class="block w-full">
            <Card class="w-full transition hover:shadow-md cursor-pointer !py-3 card-slide-in" :style="{ animationDelay: (idx * 200) + 'ms' }">
              <CardHeader class="gap-1 !px-3">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3 flex-1">
                    <div>
                      <Suspense>
                        <template #default>
                          <SongArtwork :song-id="parsePostContent(p.content).songId || ''" :size="64" />
                        </template>
                        <template #fallback>
                          <div class="w-16 h-16 rounded bg-foreground/20 border border-border/30 animate-pulse" aria-busy="true" />
                        </template>
                      </Suspense>
                    </div>
                    <div class="flex-1 text-left">
                      <template v-if="parsePostContent(p.content).songId">
                        <Suspense>
                          <template #default>
                            <OneLineSongText :username="parsePostContent(p.content).username" :songId="parsePostContent(p.content).songId!" />
                          </template>
                          <template #fallback>
                            <span class="space-y-1" aria-busy="true">
                              <span class="h-4 w-48 bg-foreground/20 border border-border/30 rounded inline-block align-middle animate-pulse" />
                            </span>
                          </template>
                        </Suspense>
                      </template>
                      <template v-else>
                        <p class="text-left">{{ p.content }}</p>
                      </template>
                    </div>
                  </div>
                  <div v-if="parsePostContent(p.content).score != null" class="flex items-center justify-center self-center">
                    <div
                      class="w-12 h-12 rounded-full bg-white border border-border text-lg font-semibold shadow-sm flex items-center justify-center"
                      :class="getScoreColorClass(parsePostContent(p.content).score)"
                      :aria-label="`Score: ${parsePostContent(p.content).score}`"
                    >
                      {{ Number(parsePostContent(p.content).score).toFixed(1) }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <div class="text-xs text-muted-foreground text-left">
                    {{ new Date(p.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) }}
                  </div>
                  <div class="relative self-center">
                    <button
                      class="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-accent"
                      aria-label="Add reaction"
                      @click.stop="emojiPickerOpenFor = emojiPickerOpenFor === p._id ? null : p._id"
                    >
                      +
                    </button>
                    <div
                      v-if="emojiPickerOpenFor === p._id"
                      class="absolute right-0 z-50 mt-2 w-44 rounded border bg-white p-2 shadow-md grid grid-cols-7 gap-1"
                    >
                      <button
                        v-for="e in EMOJIS"
                        :key="`in-card-${e}`"
                        class="h-8 w-8 flex items-center justify-center rounded hover:bg-accent"
                        @click.stop="addReaction(p._id, e)"
                      >
                        {{ e }}
                      </button>
                    </div>
                  </div>
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-1.5">
                  <template v-for="(count, emoji) in reactionsByPost[p._id]" :key="`in-card-count-${p._id}-${emoji}`">
                    <span class="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-sm">
                      <span>{{ emoji }}</span>
                      <span class="text-muted-foreground">{{ count }}</span>
                    </span>
                  </template>
                </div>
              </CardHeader>
            </Card>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogCancel class="absolute right-4 top-4">Close</AlertDialogCancel>
            <AlertDialogHeader>
              <AlertDialogTitle>Post</AlertDialogTitle>
            </AlertDialogHeader>

            <div class="space-y-2">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 flex-1">
                  <div>
                    <Suspense>
                      <template #default>
                        <SongArtwork :song-id="parsePostContent(p.content).songId || ''" :size="64" />
                      </template>
                      <template #fallback>
                        <div class="w-16 h-16 rounded bg-foreground/20 border border-border/30 animate-pulse" aria-busy="true" />
                      </template>
                    </Suspense>
                  </div>
                  <div class="flex-1 text-left">
                    <template v-if="parsePostContent(p.content).songId">
                      <Suspense>
                        <template #default>
                          <OneLineSongText :username="parsePostContent(p.content).username" :songId="parsePostContent(p.content).songId!" />
                        </template>
                        <template #fallback>
                          <span class="space-y-1" aria-busy="true">
                            <span class="h-4 w-48 bg-foreground/20 border border-border/30 rounded inline-block align-middle animate-pulse" />
                          </span>
                        </template>
                      </Suspense>
                    </template>
                    <template v-else>
                      <p class="text-left">{{ p.content }}</p>
                    </template>
                  </div>
                </div>
                <div v-if="parsePostContent(p.content).score != null" class="flex items-center justify-center self-center">
                  <div
                    class="w-12 h-12 rounded-full bg-white border border-border text-lg font-semibold shadow-sm flex items-center justify-center"
                    :class="getScoreColorClass(parsePostContent(p.content).score)"
                    :aria-label="`Score: ${parsePostContent(p.content).score}`"
                  >
                    {{ Number(parsePostContent(p.content).score).toFixed(1) }}
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between mt-1">
                <div class="text-xs text-muted-foreground text-left">
                  {{ new Date(p.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) }}
                </div>
                <div class="relative self-center flex items-center gap-2">
                  <div class="relative">
                    <button
                      class="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-accent"
                      aria-label="Add reaction"
                      @click.stop="toggleModalEmoji(p._id)"
                    >
                      +
                    </button>
                    <div
                      v-if="emojiPickerOpenForModal === p._id"
                      class="absolute right-0 z-10 mt-2 w-44 rounded border bg-white p-2 shadow-md grid grid-cols-7 gap-1"
                    >
                      <button
                        v-for="e in EMOJIS"
                        :key="e"
                        class="h-8 w-8 flex items-center justify-center rounded hover:bg-accent"
                        @click.stop="addReaction(p._id, e)"
                      >
                        {{ e }}
                      </button>
                    </div>
                  </div>
                  <div v-if="isSelfProfile" class="relative">
                    <button
                      class="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-accent"
                      aria-label="Post options"
                      @click.stop="toggleKebabMenu(p._id)"
                    >
                      ⋮
                    </button>
                    <div
                      v-if="kebabOpenFor === p._id"
                      class="absolute right-0 z-10 mt-2 w-40 rounded border bg-white p-2 shadow-md"
                    >
                      <button
                        class="w-full text-left px-2 py-1.5 rounded hover:bg-accent text-sm text-red-600"
                        @click.stop="deletePostById(p._id)"
                      >
                        Delete post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-1 flex flex-wrap items-center gap-1.5">
                <template v-for="(count, emoji) in reactionsByPost[p._id]" :key="`${p._id}-modal-${emoji}`">
                  <span class="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-sm">
                    <span>{{ emoji }}</span>
                    <span class="text-muted-foreground">{{ count }}</span>
                  </span>
                </template>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        
      </div>
    </div>
    <div v-else class="max-w-xl mx-auto text-sm text-muted-foreground">No posts yet.</div>
  </div>
</template>
