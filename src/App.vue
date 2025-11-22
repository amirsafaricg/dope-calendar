<template>
  <div class="h-dvh w-dvw">
    <CalendarGrid :days="4" />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import CalendarGrid from './components/CalendarGrid.vue'

export default defineComponent({
  name: 'AppView',
  components: {
    CalendarGrid,
  },
  setup() {},
})
</script>
<style scoped></style>
