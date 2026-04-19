import { PropsWithChildren } from 'react'

type CardVariant = 'light' | 'dark'

export default function Card({ variant = 'light', children }: PropsWithChildren<{ variant?: CardVariant }>) {
  const cls = variant === 'dark'
    ? 'rounded-lg border border-gold/40 bg-card-dark p-4 text-on-page'
    : 'rounded-lg border border-gold/40 bg-card p-4 text-on-card shadow-sm'
  return <div className={cls}>{children}</div>
}
