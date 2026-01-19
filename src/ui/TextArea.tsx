import { TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>

export default function TextArea({ className = '', ...props }: Props) {
  return (
    <textarea
      {...props}
      className={
        'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ' +
        'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ' +
        className
      }
    />
  )
}
