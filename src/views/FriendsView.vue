<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { friendsApi, userAuthApi } from '@/api';
import { Card, CardHeader } from '@/components/ui/card'

const auth = useAuthStore();
const router = useRouter();
const { userId } = storeToRefs(auth);

const friends = ref<string[]>([]);
const outgoing = ref<string[]>([]);
const incoming = ref<string[]>([]);
const usernameById = ref<Record<string, string>>({});

async function getUsername(id: string): Promise<string> {
  if (usernameById.value[id]) return usernameById.value[id];
  try {
    const resp = await userAuthApi.getUsername(id);
    const name = Array.isArray(resp) && resp[0]?.username ? resp[0].username : id;
    usernameById.value[id] = name;
    return name;
  } catch (_) {
    usernameById.value[id] = id;
    return id;
  }
}

async function loadAll() {
  if (!userId.value) return;
  try {
    const [f, s, r] = await Promise.all([
      friendsApi.getFriends(userId.value),
      friendsApi.getSentRequests(userId.value),
      friendsApi.getReceivedRequests(userId.value),
    ]);
    friends.value = f;
    outgoing.value = s;
    incoming.value = r;

    const uniqueIds = Array.from(new Set([...f, ...s, ...r]));
    await Promise.all(uniqueIds.map((id) => getUsername(id)));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error loading friends data:', err);
  }
}

async function acceptRequest(senderId: string) {
  if (!userId.value) return;
  try {
    await friendsApi.acceptFriendRequest(userId.value, senderId);
    await loadAll();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error accepting friend request:', err);
  }
}

async function rejectRequest(senderId: string) {
  if (!userId.value) return;
  try {
    await friendsApi.rejectFriendRequest(userId.value, senderId);
    await loadAll();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error rejecting friend request:', err);
  }
}

onMounted(async () => {
  await loadAll();
});

function goToProfile(id: string) {
  router.push({ name: 'profile-user', params: { userId: id } });
}

const stepMs = 120;
function delayMsForIndex(n: number): string {
  return (n * stepMs) + 'ms';
}
function delayFor(
  kind: 'title' | 'friendsHeading' | 'friendItem' | 'outgoingHeading' | 'outgoingItem' | 'incomingHeading' | 'incomingItem',
  idx = 0,
) {
  const friendsCount = friends.value.length;
  const outgoingCount = outgoing.value.length;
  // title (0)
  if (kind === 'title') return delayMsForIndex(0);
  // friends heading (1)
  if (kind === 'friendsHeading') return delayMsForIndex(1);
  // friend items start at 2
  if (kind === 'friendItem') return delayMsForIndex(2 + idx);
  // outgoing heading after friend items
  if (kind === 'outgoingHeading') return delayMsForIndex(2 + friendsCount);
  // outgoing items after heading
  if (kind === 'outgoingItem') return delayMsForIndex(3 + friendsCount + idx);
  // incoming heading after outgoing items
  if (kind === 'incomingHeading') return delayMsForIndex(3 + friendsCount + outgoingCount);
  // incoming items after heading
  if (kind === 'incomingItem') return delayMsForIndex(4 + friendsCount + outgoingCount + idx);
  return '0ms';
}
</script>

<template>
  <div class="p-6 max-w-xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-center uppercase card-slide-in" :style="{ animationDelay: delayFor('title') }">SOCIAL</h1>
    </div>

    <div class="space-y-4">
      <section>
        <h2 class="text-lg font-semibold mb-2 uppercase card-slide-in" :style="{ animationDelay: delayFor('friendsHeading') }">Friends</h2>
        <div v-if="!friends.length" class="text-sm text-muted-foreground card-slide-in" :style="{ animationDelay: delayFor('friendItem', 0) }">None</div>
        <div v-else class="space-y-2">
          <Card v-for="(id, idx) in friends" :key="`f-${id}`" class="w-full transition shadow-none border !py-2 card-slide-in" :style="{ animationDelay: delayFor('friendItem', idx) }">
            <CardHeader class="!px-3 py-2">
              <div class="flex items-center justify-between gap-3">
                <span>{{ usernameById[id] || id }}</span>
                <button
                  class="px-2 py-1 rounded border hover:bg-accent text-xs uppercase inline-flex items-center justify-center"
                  @click="goToProfile(id)"
                >
                  GO TO PROFILE
                </button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2 uppercase card-slide-in" :style="{ animationDelay: delayFor('outgoingHeading') }">Pending outgoing requests</h2>
        <div v-if="!outgoing.length" class="text-sm text-muted-foreground card-slide-in" :style="{ animationDelay: delayFor('outgoingItem', 0) }">None</div>
        <ul v-else class="list-disc pl-5 space-y-1">
          <li v-for="(id, idx) in outgoing" :key="`o-${id}`" class="card-slide-in" :style="{ animationDelay: delayFor('outgoingItem', idx) }">{{ usernameById[id] || id }}</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2 uppercase card-slide-in" :style="{ animationDelay: delayFor('incomingHeading') }">Pending incoming requests</h2>
        <div v-if="!incoming.length" class="text-sm text-muted-foreground card-slide-in" :style="{ animationDelay: delayFor('incomingItem', 0) }">None</div>
        <ul v-else class="pl-0 space-y-1">
          <li v-for="(id, idx) in incoming" :key="`i-${id}`" class="flex items-center gap-2 card-slide-in" :style="{ animationDelay: delayFor('incomingItem', idx) }">
            <span>{{ usernameById[id] || id }}</span>
            <span class="flex items-center gap-1">
              <button
                class="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-accent"
                aria-label="Accept friend request"
                @click="acceptRequest(id)"
                title="Accept"
              >
                ✓
              </button>
              <button
                class="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-accent"
                aria-label="Reject friend request"
                @click="rejectRequest(id)"
                title="Reject"
              >
                ✕
              </button>
            </span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>


