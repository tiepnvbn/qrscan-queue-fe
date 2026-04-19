import { PropsWithChildren } from 'react'

export default function Alert({ variant = 'info', children }: PropsWithChildren<{ variant?: 'info' | 'error' | 'success' }>) {
  const cls =
    variant === 'error'
      ? 'border-red-800/40 bg-red-900/20 text-red-200'
      : variant === 'success'
      ? 'border-gold/40 bg-badge/20 text-badge'
      : 'border-gold/30 bg-card-dark text-on-page'

  return <div className={`rounded-lg border px-3 py-2.5 text-sm font-serif ${cls}`}>{children}</div>
}
