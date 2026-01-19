import { PropsWithChildren } from 'react'

export default function PageShell({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-sm text-slate-500">Hàng đợi QR</div>
            <h1 className="text-lg font-semibold leading-6">{title}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">{children}</main>

      <footer className="mx-auto max-w-5xl px-4 pb-6 text-xs text-slate-500">
        <div>Cập nhật realtime qua SignalR • Xây dựng bằng Vite/React</div>
      </footer>
    </div>
  )
}
