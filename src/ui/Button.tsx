import { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'gold'
}

const stylesByVariant: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-card-dark text-on-page border border-gold/40 hover:bg-primary/80 disabled:opacity-50',
  secondary: 'bg-card text-on-card border border-gold/40 hover:bg-badge disabled:opacity-50',
  danger: 'bg-red-800 text-white border border-red-600 hover:bg-red-700 disabled:opacity-50',
  gold: 'bg-badge text-on-card border border-gold hover:bg-gold disabled:opacity-50',
}

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium font-serif ' +
        'transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-page ' +
        'disabled:cursor-not-allowed ' +
        stylesByVariant[variant] +
        ' ' +
        className
      }
    />
  )
}
