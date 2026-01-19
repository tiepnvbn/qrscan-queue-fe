import { LabelHTMLAttributes } from 'react'

type Props = LabelHTMLAttributes<HTMLLabelElement>

export default function Label({ className = '', ...props }: Props) {
  return <label {...props} className={'block text-sm font-medium text-slate-700 ' + className} />
}
