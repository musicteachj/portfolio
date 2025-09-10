import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSnackbarStore } from '../snackbar'
import type { SnackbarState } from '@/types'

describe('Snackbar Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useSnackbarStore()

      expect(store.show).toBe(false)
      expect(store.message).toBe('')
      expect(store.color).toBe('success')
      expect(store.timeout).toBe(3000)
    })
  })

  describe('showSnackbar method', () => {
    it('should show snackbar with default parameters', () => {
      const store = useSnackbarStore()
      const message = 'Test message'

      store.showSnackbar(message)

      expect(store.show).toBe(true)
      expect(store.message).toBe(message)
      expect(store.color).toBe('success')
      expect(store.timeout).toBe(3000)
    })

    it('should show snackbar with custom parameters', () => {
      const store = useSnackbarStore()
      const message = 'Custom message'
      const color: SnackbarState['color'] = 'error'
      const timeout = 5000

      store.showSnackbar(message, color, timeout)

      expect(store.show).toBe(true)
      expect(store.message).toBe(message)
      expect(store.color).toBe(color)
      expect(store.timeout).toBe(timeout)
    })

    it('should update existing snackbar when called multiple times', () => {
      const store = useSnackbarStore()

      store.showSnackbar('First message', 'success', 3000)
      expect(store.message).toBe('First message')
      expect(store.color).toBe('success')

      store.showSnackbar('Second message', 'error', 4000)
      expect(store.message).toBe('Second message')
      expect(store.color).toBe('error')
      expect(store.timeout).toBe(4000)
      expect(store.show).toBe(true)
    })
  })

  describe('hide method', () => {
    it('should hide the snackbar', () => {
      const store = useSnackbarStore()

      // First show the snackbar
      store.showSnackbar('Test message')
      expect(store.show).toBe(true)

      // Then hide it
      store.hide()
      expect(store.show).toBe(false)

      // Other properties should remain unchanged
      expect(store.message).toBe('Test message')
      expect(store.color).toBe('success')
      expect(store.timeout).toBe(3000)
    })

    it('should work when snackbar is already hidden', () => {
      const store = useSnackbarStore()

      expect(store.show).toBe(false)
      store.hide()
      expect(store.show).toBe(false)
    })
  })

  describe('Convenience methods', () => {
    describe('success method', () => {
      it('should show success snackbar with default duration', () => {
        const store = useSnackbarStore()
        const message = 'Success message'

        store.success(message)

        expect(store.show).toBe(true)
        expect(store.message).toBe(message)
        expect(store.color).toBe('success')
        expect(store.timeout).toBe(3000)
      })

      it('should show success snackbar with custom duration', () => {
        const store = useSnackbarStore()
        const message = 'Success message'
        const duration = 2000

        store.success(message, duration)

        expect(store.show).toBe(true)
        expect(store.message).toBe(message)
        expect(store.color).toBe('success')
        expect(store.timeout).toBe(duration)
      })
    })

    describe('error method', () => {
      it('should show error snackbar with default duration', () => {
        const store = useSnackbarStore()
        const message = 'Error message'

        store.error(message)

        expect(store.show).toBe(true)
        expect(store.message).toBe(message)
        expect(store.color).toBe('error')
        expect(store.timeout).toBe(5000)
      })

      it('should show error snackbar with custom duration', () => {
        const store = useSnackbarStore()
        const message = 'Error message'
        const duration = 7000

        store.error(message, duration)

        expect(store.show).toBe(true)
        expect(store.message).toBe(message)
        expect(store.color).toBe('error')
        expect(store.timeout).toBe(duration)
      })
    })

    describe('warning method', () => {
      it('should show warning snackbar with default duration', () => {
        const store = useSnackbarStore()
        const message = 'Warning message'

        store.warning(message)

        expect(store.show).toBe(true)
        expect(store.message).toBe(message)
        expect(store.color).toBe('warning')
        expect(store.timeout).toBe(4000)
      })

      it('should show warning snackbar with custom duration', () => {
        const store = useSnackbarStore()
        const message = 'Warning message'
        const duration = 6000

        store.warning(message, duration)

        expect(store.show).toBe(true)
        expect(store.message).toBe(message)
        expect(store.color).toBe('warning')
        expect(store.timeout).toBe(duration)
      })
    })

    describe('info method', () => {
      it('should show info snackbar with default duration', () => {
        const store = useSnackbarStore()
        const message = 'Info message'

        store.info(message)

        expect(store.show).toBe(true)
        expect(store.message).toBe(message)
        expect(store.color).toBe('info')
        expect(store.timeout).toBe(3000)
      })

      it('should show info snackbar with custom duration', () => {
        const store = useSnackbarStore()
        const message = 'Info message'
        const duration = 4500

        store.info(message, duration)

        expect(store.show).toBe(true)
        expect(store.message).toBe(message)
        expect(store.color).toBe('info')
        expect(store.timeout).toBe(duration)
      })
    })
  })

  describe('State transitions', () => {
    it('should handle rapid state changes correctly', () => {
      const store = useSnackbarStore()

      store.success('Success')
      expect(store.color).toBe('success')

      store.error('Error')
      expect(store.color).toBe('error')
      expect(store.show).toBe(true)

      store.hide()
      expect(store.show).toBe(false)

      store.warning('Warning')
      expect(store.color).toBe('warning')
      expect(store.show).toBe(true)
    })

    it('should maintain message history correctly', () => {
      const store = useSnackbarStore()

      store.success('First message')
      expect(store.message).toBe('First message')

      store.error('Second message')
      expect(store.message).toBe('Second message')

      // Previous message should be overwritten
      expect(store.message).not.toBe('First message')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty messages', () => {
      const store = useSnackbarStore()

      store.success('')
      expect(store.message).toBe('')
      expect(store.show).toBe(true)
    })

    it('should handle zero timeout', () => {
      const store = useSnackbarStore()

      store.showSnackbar('Test', 'info', 0)
      expect(store.timeout).toBe(0)
      expect(store.show).toBe(true)
    })

    it('should handle negative timeout', () => {
      const store = useSnackbarStore()

      store.showSnackbar('Test', 'info', -1000)
      expect(store.timeout).toBe(-1000)
      expect(store.show).toBe(true)
    })
  })
})
