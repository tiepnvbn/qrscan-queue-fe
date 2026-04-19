export default function StarsInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={
            'inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium font-serif transition-colors ' +
            (n <= value
              ? 'border-gold bg-badge text-on-card'
              : 'border-gold/30 bg-card-dark text-muted hover:bg-card-dark/80')
          }
        >
          {'★'.repeat(n)}
        </button>
      ))}
    </div>
  )
}
