import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { SnackbarState } from '@/types'

export const useSnackbarStore = defineStore('snackbar', () => {
  const show = ref<boolean>(false)
  const message = ref<string>('')
  const color = ref<SnackbarState['color']>('success')
  const timeout = ref<number>(3000)

  const showSnackbar = (
    msg: string,
    type: SnackbarState['color'] = 'success',
    duration: number = 3000,
  ): void => {
    message.value = msg
    color.value = type
    timeout.value = duration
    show.value = true
  }

  const hide = (): void => {
    show.value = false
  }

  const success = (msg: string, duration: number = 3000): void => {
    showSnackbar(msg, 'success', duration)
  }

  const error = (msg: string, duration: number = 5000): void => {
    showSnackbar(msg, 'error', duration)
  }

  const warning = (msg: string, duration: number = 4000): void => {
    showSnackbar(msg, 'warning', duration)
  }

  const info = (msg: string, duration: number = 3000): void => {
    showSnackbar(msg, 'info', duration)
  }

  return {
    show,
    message,
    color,
    timeout,
    showSnackbar,
    hide,
    success,
    error,
    warning,
    info,
  }
})
