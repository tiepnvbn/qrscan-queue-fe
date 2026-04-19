import { CSSProperties, PropsWithChildren } from 'react'
import logo from '../theme/logo.png'
import tvBg from '../theme/tv-bg.png'

const bgStyle: CSSProperties = {
  backgroundImage: `url(${tvBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
}

export default function PageShell({ title, children, className, style }: PropsWithChildren<{ title: string; className?: string; style?: CSSProperties }>) {
  return (
    <div className={`min-h-screen font-serif ${className ?? ''}`} style={{ ...bgStyle, ...style }}>
      <header className="border-b border-gold/30">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-4">
          <img src={logo} alt="Logo" className="h-32 w-auto" />
          {/* <div className="mt-1 text-xs text-muted">{title}</div> */}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">{children}</main>

      <footer className="mx-auto max-w-5xl px-4 pb-6 text-xs text-muted">
        {/* <div>LL Photobooth • Hàng đợi thông minh</div> */}
      </footer>
    </div>
  )
}
