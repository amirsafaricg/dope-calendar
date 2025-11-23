<template>
  <div :dir="direction" ref="calendar" class="calendar-wrapper  dope-calendar-grid">
    <div class="header-container">
      <div class="header-padding"></div>
      <div ref="calendarHeader" class="calendar-header hide-scrollbar">
        <div v-for="(day, index) in monthDays" :key="index" class="day-cell" :style="{
          width: 'var(--dc-day-container-width)',
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
    </div>
    <div class="content-container hide-scrollbar">
      <div :class="{ 'hours-column': true, 'zoomable': zoom }" :style="{ height: calendarBodyHeight }"
        @mousedown="handleZoomStart" @touchstart="handleZoomStart">
        <div v-for="(hour, index) in dayHoursList" :key="index" class="hour-label">
          {{ hour }}
        </div>
      </div>
      <div class="calendar-body hide-scrollbar" @scroll="handleContentScroll" ref="calendarContent"
        :style="{ height: calendarBodyHeight }">
        <div class="grid-content" :style="{ minWidth: calendarBodyWidth }">
          <div class="horizontal-grid">
            <div v-for="(hour, index) in dayHoursList" :key="index">
              <div class="grid-line-h"></div>
            </div>
          </div>
          <div class="vertical-grid">
            <div v-for="day in monthDays.length + 1" :key="day">
              <div :class="{ 'grid-line-v': day !== 1 }"></div>
            </div>
          </div>
        </div>
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
    zoom: {
      type: Boolean,
      default: true,
    },
    minZoom: {
      type: Number,
      default: 1,
    },
    maxZoom: {
      type: Number,
      default: 5,
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

    const calendarContent = ref<HTMLElement | null>(null)
    const calendarHeader = ref<HTMLElement | null>(null)

    const handleContentScroll = () => {
      if (calendarHeader.value && calendarContent.value) {
        calendarHeader.value.scrollLeft = calendarContent.value.scrollLeft
      }
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

    const dayCellWidth = ref(0)
    const dayCellHeight = ref(0)
    const zoomAmount = ref(1)
    const isZooming = ref(false)
    const startY = ref(0)
    const initialZoom = ref(1)

    const calendarBodyWidth = computed(() => {
      return `${monthDays.value.length * dayCellWidth.value}px`
    })

    const calendarBodyHeight = computed(() => {
      return `${dayHoursList.value.length * zoomAmount.value * dayCellHeight.value}px`
    })

    const handleZoomStart = (event: MouseEvent | TouchEvent) => {
      if (!props.zoom) return
      isZooming.value = true
      startY.value = 'touches' in event ? event.touches[0]!.clientY : event.clientY
      initialZoom.value = zoomAmount.value
      window.addEventListener('mousemove', handleZoomMove)
      window.addEventListener('mouseup', handleZoomEnd)
      window.addEventListener('touchmove', handleZoomMove)
      window.addEventListener('touchend', handleZoomEnd)
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
    }

    const handleZoomMove = (event: MouseEvent | TouchEvent) => {
      if (!isZooming.value) return

      requestAnimationFrame(() => {
        const currentY = 'touches' in event ? event.touches[0]!.clientY : event.clientY
        const deltaY = startY.value - currentY // Inverted for natural feel (drag up = zoom in)
        const zoomSensitivity = 200 // Adjust this value to control zoom speed
        const newZoom = initialZoom.value + deltaY / zoomSensitivity

        // Clamp the zoom level between min and max
        zoomAmount.value = Math.max(props.minZoom, Math.min(props.maxZoom, newZoom))
      })
    }

    const handleZoomEnd = () => {
      if (!isZooming.value) return
      isZooming.value = false
      window.removeEventListener('mousemove', handleZoomMove)
      window.removeEventListener('mouseup', handleZoomEnd)
      window.removeEventListener('touchmove', handleZoomMove)
      window.removeEventListener('touchend', handleZoomEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }




    onMounted(() => {
      console.log(monthDays.value)
      if (calendar.value) {
        const style = getComputedStyle(calendar.value)
        const widthStr = style.getPropertyValue('--dc-day-container-width').trim()
        const heightStr = style.getPropertyValue('--dc-day-cell-height').trim()
        console.log(widthStr)
        if (widthStr) {
          dayCellWidth.value = parseInt(widthStr, 10)
        }
        if (heightStr) {
          dayCellHeight.value = parseInt(heightStr, 10)
        }
        console.log(calendarBodyWidth.value)
      }
    })


    return {
      calendarBodyWidth,
      weekendDay,
      direction,
      calendarContent,
      calendarHeader,
      monthDays,
      getDayTitle,
      handleContentScroll,
      calendar,
      isWeekend,
      dayHoursList,
      calendarBodyHeight,
      handleZoomStart,
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
  overflow-x: auto;
  flex: 1;
  -webkit-mask-image: linear-gradient(to right,
      transparent 0,
      black 10px,
      black calc(100% - 10px),
      transparent 100%);
  mask-image: linear-gradient(to right,
      transparent 0,
      black 10px,
      black calc(100% - 10px),
      transparent 100%);
  /* padding-left: var(--dc-day-container-width); */
}

/* [dir='rtl']{
  padding-right: var(--dc-day-container-width);
} */

.day-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  width: var(--dc-day-cell-width);
  flex-shrink: 0;
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
  overflow-y: auto;
  background-color: var(--dc-bg);
}


.hours-column {
  flex-shrink: 0;
  height: calc(100% - 50px);
  min-width: var(--dc-day-container-width);
  z-index: 10;
  bottom: 0px;
  background-color: var(--dc-bg);
  display: flex;
  flex-direction: column;
  user-select: none;
  align-items: center;
  justify-content: space-around;
  width: var(--dc-day-container-width);
  border-left: var(--dc-border-width) solid var(--dc-border-color);
}

[dir='rtl'] .hours-column {
  border-right: var(--dc-border-width) solid var(--dc-border-color);
}

.hour-label {
  color: var(--dc-day-number-color);
  font-size: var(--dc-day-number-font-size);
  min-height: var(--dc-day-cell-height);
  font-weight: var(--dc-day-number-font-weight);
}

/* .grid-padding {
  flex-shrink: 0;
  height: 100%;
  min-width: var(--dc-day-container-width);
  width: var(--dc-day-container-width);
} */

.grid-content {
  flex: 1;
  height: 100%;
  background-color: var(--dc-bg);
  position: relative;
  /* bg-red-400 */
}

.horizontal-grid {
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 0;
  align-items: items-stretch;
  justify-content: space-around;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  inset: 0;
}

.vertical-grid {
  display: flex;
  position: absolute;
  z-index: 0;
  align-items: stretch;
  justify-content: space-between;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  inset: 0;
  gap: ();
}

.content-container {
  display: flex;
  flex: 1;
  position: relative;
  width: 100%;
  overflow-y: auto;
}

.grid-line-h {
  width: 100%;
  border: var(--dc-border-width) solid var(--dc-border-color)
}

.header-container {
  display: flex;
}

.header-padding {
  width: var(--dc-day-container-width);
  flex-shrink: 0;
  height: 100%;
}

.grid-line-v {
  height: 100%;
  border: var(--dc-border-width) solid var(--dc-border-color)
}

.hide-scrollbar {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari and Opera */
}

.zoomable {
  cursor: ns-resize;
}
</style>
