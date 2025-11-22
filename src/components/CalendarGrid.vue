<template>
  <div class="w-full overflow-auto dope-calendar-grid h-full">
    <div class=""></div>
  </div>
</template>
<script lang="ts">
import { type PropType, defineComponent, onMounted } from 'vue'
export default defineComponent({
  name: 'CalendarGrid',
  props: {
    georgian: {
      type: Boolean,
      default: true,
    },
    jalaali: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      required: true,
      default: new Date(),
    },
    days: {
      type: Number,
      default: 'auto',
    },
  },
  setup(props) {
    onMounted(() => {
      console.log(props.days)
    })
  },
})
</script>
<style scoped>
@import '@/assets/css/calendar.css';
</style>
