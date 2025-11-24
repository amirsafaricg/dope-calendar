import { onMounted, onUnmounted, type Ref } from 'vue'

export function useDragToScroll(elementRef: Ref<HTMLElement | null>) {
  let isDown = false
  let startX: number
  let scrollLeft: number

  const handleMouseDown = (e: MouseEvent) => {
    if (!elementRef.value) return
    isDown = true
    elementRef.value.classList.remove('cursor-grab')
    elementRef.value.classList.add('cursor-grabbing')
    startX = e.pageX - elementRef.value.offsetLeft
    scrollLeft = elementRef.value.scrollLeft
    e.preventDefault() // Prevent text selection
  }

  const handleMouseLeave = () => {
    if (!elementRef.value) return
    isDown = false
        elementRef.value.classList.add('cursor-grab')
    elementRef.value.classList.remove('cursor-grabbing')
  }

  const handleMouseUp = () => {
    if (!elementRef.value) return
    isDown = false
            elementRef.value.classList.add('cursor-grab')
    elementRef.value.classList.remove('cursor-grabbing')
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDown || !elementRef.value) return
    e.preventDefault()
    const x = e.pageX - elementRef.value.offsetLeft
    const walk = (x - startX) * 2 // The multiplier makes scrolling feel faster
    elementRef.value.scrollLeft = scrollLeft - walk
  }

  onMounted(() => {
    const el = elementRef.value
    if (el) {
      el.addEventListener('mousedown', handleMouseDown)
      el.addEventListener('mouseleave', handleMouseLeave)
      el.addEventListener('mouseup', handleMouseUp)
      el.addEventListener('mousemove', handleMouseMove)
    }
  })

  onUnmounted(() => {
    const el = elementRef.value
    if (el) {
      el.removeEventListener('mousedown', handleMouseDown)
      el.removeEventListener('mouseleave', handleMouseLeave)
      el.removeEventListener('mouseup', handleMouseUp)
      el.removeEventListener('mousemove', handleMouseMove)
    }
  })
}