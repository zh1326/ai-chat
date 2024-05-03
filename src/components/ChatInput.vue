<script setup lang="ts">
const props = defineProps<{
  curSessionId?: string
}>()
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ props.curSessionId }}</h1>
    <h3>
      You’ve successfully created a project with
      <a href="https://vitejs.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>. What's next?
    </h3>
  </div>
</template>

<style lang="scss" scoped></style>
