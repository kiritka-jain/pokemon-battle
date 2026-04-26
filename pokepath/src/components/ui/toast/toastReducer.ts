export type ToastVariant = 'default' | 'error' | 'success'

export type ToastActionButton = {
  label: string
  onClick: () => void
}

export type ToastItem = {
  id: number
  message: string
  variant: ToastVariant
  primaryAction?: ToastActionButton
  secondaryAction?: ToastActionButton
}

export type ToastState = {
  toast: ToastItem | null
}

export type ToastAction =
  | {
      type: 'SHOW'
      id: number
      message: string
      variant: ToastVariant
      primaryAction?: ToastActionButton
      secondaryAction?: ToastActionButton
    }
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
          primaryAction: action.primaryAction,
          secondaryAction: action.secondaryAction,
        },
      }
    case 'DISMISS':
      return { toast: null }
  }
}
