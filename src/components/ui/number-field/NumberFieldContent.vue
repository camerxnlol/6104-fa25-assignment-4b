<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div class="pt-5">
  <div :class="cn('relative [&>[data-slot=input]]:has-[[data-slot=increment]]:pr-5 [&>[data-slot=input]]:has-[[data-slot=decrement]]:pl-5', props.class)">
    <slot />
  </div>
</div>
</template>
