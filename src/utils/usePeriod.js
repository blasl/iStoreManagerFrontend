import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_PERIOD, PERIODS } from './period'

export function usePeriod() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('periodo')
  const period = PERIODS.some((p) => p.key === raw) ? raw : DEFAULT_PERIOD

  const setPeriod = useCallback(
    (key) => setParams(key === DEFAULT_PERIOD ? {} : { periodo: key }, { replace: true }),
    [setParams]
  )

  return [period, setPeriod]
}