<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <div>
    <NavBar />
    <div class="pt-16">
      <router-view />
    </div>
  </div>
  </template>
