// composables/useToast.ts
// Global toast state (singleton pattern for Nuxt)

interface ToastItem {
  id: string | number
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
}

const toasts = ref<ToastItem[]>([])
let counter = 0

export function useToastStore() {
  function add(toast: Omit<ToastItem, 'id'>) {
    const id = ++counter
    toasts.value.push({ id, duration: 4000, ...toast })
    return id
  }

  function dismiss(id: string | number) {
    const i = toasts.value.findIndex((t) => t.id === id)
    if (i !== -1) toasts.value.splice(i, 1)
  }

  function clear() { toasts.value = [] }

  return { toasts: readonly(toasts), add, dismiss, clear }
}

// Convenience composable for use in components
export function useToast() {
  const { add } = useToastStore()

  return {
    info:    (message: string, title?: string, opts?: Partial<ToastItem>) => add({ variant: 'info',    message, title, ...opts }),
    success: (message: string, title?: string, opts?: Partial<ToastItem>) => add({ variant: 'success', message, title, ...opts }),
    warning: (message: string, title?: string, opts?: Partial<ToastItem>) => add({ variant: 'warning', message, title, ...opts }),
    error:   (message: string, title?: string, opts?: Partial<ToastItem>) => add({ variant: 'danger',  message, title, ...opts }),
    add,
  }
}
