export function formatHHmm(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
}

export function addMinutes(isoOrDate: string | Date, minutes: number): Date {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : new Date(isoOrDate)
  return new Date(date.getTime() + minutes * 60_000)
}

export function safeNumber(n: unknown, fallback = 0): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback
}
