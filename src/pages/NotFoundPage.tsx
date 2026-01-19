import PageShell from '../ui/PageShell'

export default function NotFoundPage() {
  return (
    <PageShell title="Không tìm thấy">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-slate-700">Trang này không tồn tại.</p>
      </div>
    </PageShell>
  )
}
