<template>
  <div :dir="direction" ref="calendar" class="w-full overflow-auto dope-calendar-grid h-full">
    <div class="w-full flex items-center">
      <div v-for="(day, index) in monthDays" :key="index">
        <div>{{ day.day }}</div>
        <div>{{ day.weekDay }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { type PropType, ref, defineComponent, onMounted, computed } from 'vue'
import jalaali from 'jalaali-js'

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
      default: () => new Date(),
    },
    days: {
      type: Number,
      default: 'auto',
    },
    lang: {
      type: String as PropType<'en' | 'fa'>,
      default: 'en',
      validator: (value: string) => {
        return ['en', 'fa'].includes(value)
      },
    },
  },
  setup(props) {
    const calendar = ref<HTMLElement | null>(null)
    // 1. Prop Validation
    if (props.georgian === props.jalaali) {
      throw new Error('Exactly one of "georgian" or "jalaali" props must be true.')
    }

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const monthDays = computed(() => {
      const days = []
      if (props.georgian) {
        const year = props.date.getFullYear()
        const month = props.date.getMonth() // 0-indexed
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day)
          days.push({
            day: day,
            weekDay: weekdays[date.getDay()],
          })
        }
      } else {
        // --- Jalaali Logic ---
        const { jy: year, jm: month } = jalaali.toJalaali(props.date)
        const daysInMonth = jalaali.jalaaliMonthLength(year, month)

        for (let day = 1; day <= daysInMonth; day++) {
          const gregorianDate = jalaali.toGregorian(year, month, day)
          const date = new Date(gregorianDate.gy, gregorianDate.gm - 1, gregorianDate.gd)
          days.push({
            day: day,
            weekDay: weekdays[date.getDay()],
          })
        }
      }
      return days
    })

    onMounted(() => {
      console.log(monthDays.value)
    })

    const direction = computed(() => {
      return props.lang === 'en' ? 'ltr' : 'rtl'
    })

    return {
      direction,
      monthDays,
      calendar,
    }
  },
})
</script>
<style scoped>
@import '@/assets/css/calendar.css';
</style>
