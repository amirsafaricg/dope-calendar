<template>
  <div :dir="direction" ref="calendar" class="w-full overflow-auto dope-calendar-grid h-full">
    <div class="w-full flex items-center">
      <div v-for="(day, index) in monthDays" :key="index">
        <div>{{ day.day }}</div>
        <div>{{ getDayTitle(day.weekDay) }}</div>
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
    format: {
      type: String as PropType<'ampm' | '24h' | 'keys'>,
      default: '24h',
      validator: (value: string) => {
        return ['ampm', '24h', 'keys'].includes(value)
      },
    },
  },
  setup(props) {
    const calendar = ref<HTMLElement | null>(null)
    if (props.georgian === props.jalaali) {
      throw new Error('Exactly one of "georgian" or "jalaali" props must be true.')
    }

    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

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

    const weekendDay = computed(() => {
      return props.lang === 'en' ? 'sunday' : 'friday'
    })

    const isWeekend = (day: string) => {
      return day === weekendDay.value
    }

    const getDayTitle = (day: string | undefined) => {
      let engDays = [
        {
          key: 'sunday',
          title: 'Sun',
        },
        {
          key: 'monday',
          title: 'Mon',
        },
        {
          key: 'tuesday',
          title: 'Tue',
        },
        {
          key: 'wednesday',
          title: 'Wed',
        },
        {
          key: 'thursday',
          title: 'Thu',
        },
        {
          key: 'friday',
          title: 'Fri',
        },
        {
          key: 'saturday',
          title: 'Sat',
        },
      ]
      let faDays = [
        {
          key: 'sunday',
          title: 'ی',
        },
        {
          key: 'monday',
          title: 'د',
        },
        {
          key: 'tuesday',
          title: 'س',
        },
        {
          key: 'wednesday',
          title: 'چ',
        },
        {
          key: 'thursday',
          title: 'پ',
        },
        {
          key: 'friday',
          title: 'ج',
        },
        {
          key: 'saturday',
          title: 'ش',
        },
      ]

      return (
        (props.lang === 'en'
          ? engDays.find((d) => d.key === day)?.title
          : faDays.find((d) => d.key === day)?.title) || ''
      )
    }

    const dayHoursList = computed(() => {
      if (props.format === '24h') {
        return Array.from({ length: 24 }, (_, i) => `${i}:00`)
      }

      if (props.format === 'ampm') {
        const hours = []
        for (let i = 0; i < 24; i++) {
          const hour = i % 12 === 0 ? 12 : i % 12
          const period = i < 12 ? 'am' : 'pm'
          hours.push(`${hour} ${period}`)
        }
        return hours
      }

      if (props.format === 'keys') {
        if (props.lang === 'fa') {
          const toPersianNum = (n: number) =>
            n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])
          const faHours = []
          for (let i = 0; i < 24; i++) {
            let period = ''
            if (i >= 0 && i < 6)
              period = 'شب' // Night
            else if (i >= 6 && i < 12)
              period = 'صبح' // Morning
            else if (i >= 12 && i < 18)
              period = 'ظهر' // Afternoon
            else period = 'عصر' // Evening

            faHours.push(`${toPersianNum(i)} ${period}`)
          }
          return faHours
        } else {
          // English ('en')
          const enHours = []
          for (let i = 0; i < 24; i++) {
            let period = ''
            if (i >= 0 && i < 6) period = 'Night'
            else if (i >= 6 && i < 12) period = 'Morning'
            else if (i >= 12 && i < 18) period = 'Afternoon'
            else period = 'Evening'

            enHours.push(`${i}:00 ${period}`)
          }
          return enHours
        }
      }

      return [] // Default empty array
    })

    return {
      weekendDay,
      direction,
      monthDays,
      getDayTitle,
      calendar,
      isWeekend,
    }
  },
})
</script>
<style scoped>
@import '@/assets/css/calendar.css';
</style>
