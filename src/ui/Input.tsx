import { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement>

export default function Input({ className = '', ...props }: Props) {
  return (
    <input
      {...props}
      className={
        'w-full rounded-lg border border-gold/40 bg-surface px-3 py-2.5 text-sm text-on-card font-serif ' +
        'placeholder:text-muted ' +
        'focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 ' +
        className
      }
    />
  )
}
