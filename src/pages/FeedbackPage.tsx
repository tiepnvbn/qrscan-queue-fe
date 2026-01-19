import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { publicApi } from '../api/publicApi'
import { config } from '../config'
import PageShell from '../ui/PageShell'
import Card from '../ui/Card'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import TextArea from '../ui/TextArea'
import StarsInput from '../components/StarsInput'

export default function FeedbackPage() {
  const [searchParams] = useSearchParams()
  const ticketId = searchParams.get('ticketId')
  const siteSlug = searchParams.get('siteSlug')
  const roomSlug = searchParams.get('roomSlug')

  const backLink = useMemo(() => {
    if (siteSlug && roomSlug) return `/s/${encodeURIComponent(siteSlug)}/r/${encodeURIComponent(roomSlug)}`
    return '/'
  }, [siteSlug, roomSlug])

  const [stars, setStars] = useState<number>(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!ticketId) return
    setLoading(true)
    setError(null)
    try {
      if (stars < 1 || stars > 5) throw new Error('Số sao phải từ 1 đến 5')
      await publicApi.submitFeedback(ticketId, { stars, comment: comment.trim() ? comment.trim() : null })
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gửi đánh giá thất bại')
    } finally {
      setLoading(false)
    }
  }

  if (!ticketId) {
    return (
      <PageShell title="Đánh giá">
        <Alert variant="error">Thiếu ticketId.</Alert>
        <div className="mt-3">
          <Link to={backLink} className="text-sm">
            Quay lại
          </Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Đánh giá">
      <div className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}
        {done ? <Alert>Cảm ơn! Đánh giá của bạn đã được gửi.</Alert> : null}

        <Card>
          <div className="text-sm text-slate-600">Vé</div>
          <div className="font-mono text-xs">{ticketId}</div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold">Đánh giá trải nghiệm</div>
            <StarsInput value={stars} onChange={setStars} />
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold">Góp ý (tùy chọn)</div>
            <TextArea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Bạn muốn chia sẻ gì không?" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={submit} disabled={loading || done}>
              Gửi
            </Button>
            <Link
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              to={backLink}
            >
              Quay lại
            </Link>

            {config.feedbackMoreUrl ? (
              <a
                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                href={config.feedbackMoreUrl}
                target="_blank"
                rel="noreferrer"
              >
                Xem thêm
              </a>
            ) : null}
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
