<script setup lang="ts" async>
import { getSongMetadataCached } from '@/composables/useSongMetadata'

const props = defineProps<{ songId: string }>()

const meta = await getSongMetadataCached(props.songId)
const title = meta?.title || 'No title'
const artist = meta?.artist || 'No artist'
</script>

<template>
  <div class="text-left" style="opacity: 0; animation: fade-in 2000ms ease forwards;">
    <div class="text-base font-semibold leading-none">{{ title }}</div>
    <div class="text-sm text-muted-foreground">{{ artist }}</div>
  </div>
</template>


