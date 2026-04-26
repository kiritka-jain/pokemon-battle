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
    expect(s1.toast).toEqual({
      id: 1,
      message: 'a',
      variant: 'default',
      primaryAction: undefined,
      secondaryAction: undefined,
    })

    const s2 = toastReducer(s1, {
      type: 'SHOW',
      id: 2,
      message: 'b',
      variant: 'error',
    })
    expect(s2.toast).toEqual({
      id: 2,
      message: 'b',
      variant: 'error',
      primaryAction: undefined,
      secondaryAction: undefined,
    })
  })

  it('SHOW stores action buttons when provided', () => {
    const onHome = () => {}
    const onPlayAgain = () => {}
    const next = toastReducer(initialToastState, {
      type: 'SHOW',
      id: 3,
      message: 'done',
      variant: 'success',
      primaryAction: { label: 'Home', onClick: onHome },
      secondaryAction: { label: 'Play Again', onClick: onPlayAgain },
    })

    expect(next.toast?.primaryAction?.label).toBe('Home')
    expect(next.toast?.primaryAction?.onClick).toBe(onHome)
    expect(next.toast?.secondaryAction?.label).toBe('Play Again')
    expect(next.toast?.secondaryAction?.onClick).toBe(onPlayAgain)
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
