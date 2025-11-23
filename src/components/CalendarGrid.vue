<template>
  <div :dir="direction" ref="calendar" class="calendar-wrapper dope-calendar-grid">
    <div class="calendar-header">
      <div :style="{ width: 'var(--dc-day-container-width)', flexShrink: 0 }"></div>
      <div v-for="(day, index) in monthDays" :key="index" class="day-cell" :style="{
        width: 'var(--dc-day-container-width)',
        borderLeft: 'var(--dc-border-width) solid var(--dc-border-color)'
      }">
        <div class="day-number" :style="{
          color: isWeekend(day.weekDay)
            ? 'var(--dc-weekend-day-color)'
            : 'var(--dc-day-number-color)',
          fontSize: 'var(--dc-day-number-font-size)',
          fontWeight: 'var(--dc-day-number-font-weight)'
        }">
          {{ day.day }}
        </div>
        <div class="day-name" :style="{
          color: isWeekend(day.weekDay)
            ? 'var(--dc-weekend-day-color)'
            : 'var(--dc-day-name-color)',
          fontSize: 'var(--dc-day-name-font-size)',
          fontWeight: 'var(--dc-day-name-font-weight)'
        }">
          {{ getDayTitle(day.weekDay) }}
        </div>
      </div>
    </div>
    <div class="calendar-body" :style="{ width: calendarBodyWidth }">
      <div class="grid-content"></div>
    </div>
    <div class="hours-column" >
      <div v-for="(hour, index) in dayHoursList" :key="index" class="hour-label" :style="{
        color: 'var(--dc-day-number-color)',
        fontSize: 'var(--dc-day-number-font-size)',
        fontWeight: 'var(--dc-day-number-font-weight)'
      }">
        {{ hour }}
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
      type: [Number, String] as PropType<number | 'auto'>,
      default: 'auto',
      validator: (value: unknown) => {
        if (typeof value === 'string') {
          return value === 'auto'
        }
        if (typeof value === 'number') {
          return Number.isInteger(value)
        }
        return false
      },
    },
    lang: {
      type: String as PropType<'en' | 'fa'>,
      default: 'fa',
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

    const weekdays = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const


    const toPersianNum = (n: number | string) =>
      String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]!)

    const monthDays = computed(() => {
      type DayObject = {
        day: number | string
        weekDay: string
      }
      const days: DayObject[] = []
      if (props.georgian) {
        const year = props.date.getFullYear()
        const month = props.date.getMonth() // 0-indexed
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day)
          days.push({
            day: props.lang === 'fa' ? toPersianNum(day) : day,
            weekDay: weekdays[date.getDay()]!,
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
            day: props.lang === 'fa' ? toPersianNum(day) : day,
            weekDay: weekdays[date.getDay()]!,
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
        return Array.from({ length: 24 }, (_, i) => {
          const time = `${i}:00`
          return props.lang === 'fa' ? toPersianNum(time) : time
        })
      }

      if (props.format === 'ampm') {
        const hours = []
        for (let i = 0; i < 24; i++) {
          const hour = i % 12 === 0 ? 12 : i % 12
          if (props.lang === 'fa') {
            const period = i < 12 ? 'ق.ظ' : 'ب.ظ'
            hours.push(`${toPersianNum(hour)} ${period}`)
          } else {
            const period = i < 12 ? 'am' : 'pm'
            hours.push(`${hour} ${period}`)
          }
        }
        return hours
      }

      if (props.format === 'keys') {
        if (props.lang === 'fa') {
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

    const dayCellWidth = 40 // in pixels, matching --dc-day-cell-width

    const calendarBodyWidth = computed(() => {
      return `${monthDays.value.length * dayCellWidth}px`
    })

    return {
      calendarBodyWidth,
      weekendDay,
      direction,
      monthDays,
      getDayTitle,
      calendar,
      isWeekend,
      dayHoursList,
    }
  },
})
</script>
<style scoped>
@import '@/assets/css/calendar.css';

.calendar-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  position: relative;
}

.calendar-header {
  width: 100%;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.day-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  min-width: var(--dc-day-cell-width);
  flex-shrink: 0;
  /* p-2 */
}

.day-number {
  /* Styles are applied via inline :style */
}

.day-name {
  /* Styles are applied via inline :style */
}

.calendar-body {
  flex: 1;
  white-space: nowrap;
  display: flex;
  background-color: var(--dc-bg);
}

.hours-column {
  flex-shrink: 0;
  height: calc(100% - 50px);
  min-width: 3.5rem;
  position: fixed;
  bottom: 0px;
  background-color: var(--dc-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width:var(--dc-day-container-width);
}

.hour-label {
  /* Placeholder for hour label styling */
}

.grid-content {
  flex: 1;
  height: 100%;
  background-color: var(--dc-bg);
  /* bg-red-400 */
}
</style>
