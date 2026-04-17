export type ToastVariant = 'default' | 'error' | 'success'

export type ToastItem = {
  id: number
  message: string
  variant: ToastVariant
}

export type ToastState = {
  toast: ToastItem | null
}

export type ToastAction =
  | { type: 'SHOW'; id: number; message: string; variant: ToastVariant }
  | { type: 'DISMISS' }

export const initialToastState: ToastState = { toast: null }

export function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'SHOW':
      return {
        toast: {
          id: action.id,
          message: action.message,
          variant: action.variant,
        },
      }
    case 'DISMISS':
      return { toast: null }
  }
}
