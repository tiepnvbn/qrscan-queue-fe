import { PropsWithChildren } from 'react'

export default function Alert({ variant = 'info', children }: PropsWithChildren<{ variant?: 'info' | 'error' }>) {
  const cls =
    variant === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : 'border-slate-200 bg-slate-50 text-slate-800'

  return <div className={`rounded-md border px-3 py-2 text-sm ${cls}`}>{children}</div>
}
