import { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

const stylesByVariant: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
  secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:bg-slate-200',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
}

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ' +
        'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ' +
        'disabled:cursor-not-allowed ' +
        stylesByVariant[variant] +
        ' ' +
        className
      }
    />
  )
}
