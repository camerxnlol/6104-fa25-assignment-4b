<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { postApi, type Post } from '@/api';
import { reactionApi, type Reaction } from '@/api';
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
const router = useRouter();
const { userId } = storeToRefs(auth);

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

function onLogout() {
  auth.logout();
  router.push('/home');
}
</script>

<template>
  <div class="p-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Profile</h1>
      <button
        class="px-0 py-2 bg-transparent text-[var(--foreground)] uppercase ghost-underline"
        @click="onLogout"
      >
        LOGOUT
      </button>
    </div>
    <h2 class="text-xl font-medium mb-2">My Posts</h2>
    <div v-if="!posts.length" class="text-sm text-muted-foreground">No posts yet.</div>

    <ul v-else class="space-y-3">
      <li v-for="p in posts" :key="p._id" class="border rounded p-3 relative">
        <AlertDialog :open="openPostId === p._id" @update:open="(v) => openPostId = v ? p._id : null">
          <AlertDialogTrigger>
            <button class="text-left w-full">
              <div class="text-sm text-muted-foreground">{{ new Date(p.timestamp).toLocaleString() }}</div>
              <div class="mt-1">{{ p.content }}</div>
            </button>
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

        <div class="mt-2 flex items-center gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <template v-for="(count, emoji) in reactionsByPost[p._id]" :key="`list-${p._id}-${emoji}`">
              <span class="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-sm">
                <span>{{ emoji }}</span>
                <span class="text-muted-foreground">{{ count }}</span>
              </span>
            </template>
          </div>
          <div class="relative ml-auto">
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
                :key="`list-${e}`"
                class="h-8 w-8 flex items-center justify-center rounded hover:bg-accent"
                @click.stop="addReaction(p._id, e)"
              >
                {{ e }}
              </button>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
