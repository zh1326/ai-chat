import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', () => {
  const sidebarOpened = ref(true)
  const isMobile = ref(false)

  function toggle(value: boolean) {
    sidebarOpened.value = value
  }

  function setIsMobile(value: boolean) {
    isMobile.value = value
  }

  return { sidebarOpened, toggle, isMobile, setIsMobile }
})
