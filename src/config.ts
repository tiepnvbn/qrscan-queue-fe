function trimTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export const config = {
  apiBaseUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'),
  feedbackMoreUrl: import.meta.env.VITE_FEEDBACK_MORE_URL as string | undefined,
}
