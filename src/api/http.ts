export class HttpError extends Error {
  public readonly status: number
  public readonly url: string
  public readonly bodyText?: string

  constructor(args: { status: number; url: string; bodyText?: string }) {
    super(`HTTP ${args.status} for ${args.url}`)
    this.status = args.status
    this.url = args.url
    this.bodyText = args.bodyText
  }
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let bodyText: string | undefined
    try {
      bodyText = await response.text()
    } catch {
      bodyText = undefined
    }
    throw new HttpError({ status: response.status, url: String(input), bodyText })
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
