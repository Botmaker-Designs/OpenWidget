import { useMemo } from 'react'
import { defaultConfig } from '../config/defaultConfig'

export function useConfig(overrides = {}) {
  return useMemo(() => ({ ...defaultConfig, ...overrides }), [overrides])
}
