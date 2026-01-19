import Button from '../ui/Button'

export default function StarsInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <Button
          key={n}
          type="button"
          variant={n === value ? 'primary' : 'secondary'}
          onClick={() => onChange(n)}
        >
          {n} ★
        </Button>
      ))}
    </div>
  )
}
