import { TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>

export default function TextArea({ className = '', ...props }: Props) {
  return (
    <textarea
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
