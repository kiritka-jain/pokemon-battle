import { describe, expect, it } from 'vitest'

import { initialToastState, toastReducer } from './toastReducer'

describe('toastReducer', () => {
  it('SHOW replaces any existing toast', () => {
    const s1 = toastReducer(initialToastState, {
      type: 'SHOW',
      id: 1,
      message: 'a',
      variant: 'default',
    })
    expect(s1.toast).toEqual({ id: 1, message: 'a', variant: 'default' })

    const s2 = toastReducer(s1, {
      type: 'SHOW',
      id: 2,
      message: 'b',
      variant: 'error',
    })
    expect(s2.toast).toEqual({ id: 2, message: 'b', variant: 'error' })
  })

  it('DISMISS clears toast', () => {
    const withToast = toastReducer(initialToastState, {
      type: 'SHOW',
      id: 1,
      message: 'x',
      variant: 'success',
    })
    expect(toastReducer(withToast, { type: 'DISMISS' })).toEqual(initialToastState)
  })
})
