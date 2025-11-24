<template>
  <div class="h-dvh w-dvw">
    <!-- <CalendarGrid
      mode="custom"
      :start-date="new Date()"
      :end-date="new Date(new Date().setDate(new Date().getDate() + 9))"
      :georgian="true"
      lang="fa"
    /> -->
    <CalendarGrid
      mode="month"
      lang="en"
      dir="ltr"
      jalaali
      :startHour="10"
      :endHour="22"
    />
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
