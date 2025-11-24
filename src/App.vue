<template>
  <div class="h-dvh w-dvw">
    <CalendarGrid
      mode="custom"
      :start-date="new Date()"
      :end-date="new Date(new Date().setDate(new Date().getDate() + 35))"
      jalaali
      lang="fa"
      dir="rtl"
    />
   <!-- <CalendarGrid
      mode="month"
      lang="fa"
      dir="rtl"
      jalaali
    />-->
    <!-- <CalendarGrid mode="month" :start-date="new Date()" :jalaali="true" lang="fa" /> -->
  <!-- <CalendarGrid mode="week" jalaali :start-date="new Date()"  lang="fa" />  -->
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
