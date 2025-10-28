<script setup lang="ts">
import { onMounted, ref, defineComponent, h } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { postApi, type Post } from '@/api';
import { reactionApi, type Reaction } from '@/api';
import { musicMetadataApi } from '@/api';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
const { userId, username } = storeToRefs(auth);

const posts = ref<Post[]>([]);
const reactionsByPost = ref<Record<string, Record<string, number>>>({});
const emojiPickerOpenFor = ref<string | null>(null);
const openPostId = ref<string | null>(null);

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎵'];

async function loadPosts() {
  if (!userId.value) return;
  const result = await postApi.getPostsByAuthor(userId.value);
  posts.value = (result ?? []).map((p) => p.post);
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
    await loadPosts();
    // Load reactions for each post initially so they show on the list
    await Promise.all(posts.value.map((p) => loadReactions(p._id)));
  } catch (err) {
    console.error('Error loading posts or reactions:', err);
  }
});

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
              <div class="flex-1 text-left">
                <p class="text-left text-3xl font-semibold">
                  {{ (username || 'User') + "'s RANKINGS" }}
                </p>
              </div>
            </div>
            <div class="flex items-center justify-center">
              <button
                class="px-3 py-1.5 rounded border hover:bg-accent text-sm uppercase"
                @click="router.push({ name: 'rank' })"
              >
                view recommendations
              </button>
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
                      class="absolute right-0 z-10 mt-2 w-44 rounded border bg-white p-2 shadow-md grid grid-cols-7 gap-1"
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
              <AlertDialogDescription>
                {{ p.content }}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div class="mt-4 flex items-center gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <template v-for="(count, emoji) in reactionsByPost[p._id]" :key="`${p._id}-${emoji}`">
                  <span class="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-sm">
                    <span>{{ emoji }}</span>
                    <span class="text-muted-foreground">{{ count }}</span>
                  </span>
                </template>
              </div>
              <div class="relative">
                <button
                  class="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-accent"
                  aria-label="Add reaction"
                  @click.stop="emojiPickerOpenFor = emojiPickerOpenFor === p._id ? null : p._id"
                >
                  +
                </button>
                <div
                  v-if="emojiPickerOpenFor === p._id"
                  class="absolute z-10 mt-2 w-44 rounded border bg-white p-2 shadow-md grid grid-cols-7 gap-1"
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
            </div>
          </AlertDialogContent>
        </AlertDialog>

        
      </div>
    </div>
    <div v-else class="max-w-xl mx-auto text-sm text-muted-foreground">No posts yet.</div>
  </div>
</template>
