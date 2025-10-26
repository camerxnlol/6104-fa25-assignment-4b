<script setup lang="ts" async>
import { getSongMetadataCached } from '@/composables/useSongMetadata'
import { ref } from 'vue'

const props = defineProps<{ songId: string; size?: number }>()

const meta = await getSongMetadataCached(props.songId)
const src = meta?.artworkUrl || null
const loaded = ref(false)

function onLoad() {
  loaded.value = true
}

function onError() {
  loaded.value = false
}
</script>

<template>
  <div :style="{ width: (size ?? 48) + 'px', height: (size ?? 48) + 'px' }">
    <img
      v-if="src"
      :src="src"
      alt="Cover"
      class="object-cover rounded opacity-0"
      :class="{ 'opacity-100': loaded }"
      :style="{ width: '100%', height: '100%', transition: 'opacity 500ms ease' }"
      @load="onLoad"
      @error="onError"
    />
    <div v-else class="bg-muted/20 text-muted-foreground grid place-items-center rounded" style="width: 100%; height: 100%;">
      <span class="text-[10px]">No Image</span>
    </div>
  </div>
  
</template>


