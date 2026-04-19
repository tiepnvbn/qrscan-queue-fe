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
          <Link to={backLink} className="text-sm text-gold">
            ← Quay lại
          </Link>
        </div>
      </PageShell>
    )
  }

  if (done) {
    return (
      <PageShell title="Cảm ơn!">
        <div className="flex flex-col items-center py-12 text-center">
          <div className="text-5xl font-bold italic text-on-page tracking-wide">LL Photobooth</div>
          <div className="mt-6 text-xl font-bold text-gold">Cảm ơn bạn!</div>
          <div className="mt-2 text-sm text-on-page/80">Đánh giá của bạn đã được gửi thành công.</div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-gold/40 bg-card-dark px-4 py-2.5 text-sm font-medium text-on-page hover:bg-primary/80"
              to={backLink}
            >
              Quay lại phòng
            </Link>
            {config.feedbackMoreUrl ? (
              <a
                className="inline-flex items-center justify-center rounded-lg border border-gold bg-badge px-4 py-2.5 text-sm font-medium text-on-card hover:bg-gold"
                href={config.feedbackMoreUrl}
                target="_blank"
                rel="noreferrer"
              >
                Xem thêm
              </a>
            ) : null}
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Đánh giá dịch vụ">
      <div className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}

        <div className="py-4 text-center">
          <div className="text-xl font-bold text-on-page">Đánh giá dịch vụ</div>
          <div className="mt-1 text-sm text-muted">Chia sẻ trải nghiệm của bạn</div>
        </div>

        <Card>
          <div className="mt-2">
            <div className="mb-3 text-sm font-bold">Bạn đánh giá bao nhiêu sao?</div>
            <StarsInput value={stars} onChange={setStars} />
          </div>

          <div className="mt-5">
            <div className="mb-2 text-sm font-bold">Góp ý (tùy chọn)</div>
            <TextArea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Bạn muốn chia sẻ gì không?" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="gold" onClick={submit} disabled={loading}>
              Gửi đánh giá
            </Button>
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-gold/40 bg-card-dark px-4 py-2.5 text-sm font-medium text-on-page hover:bg-primary/80"
              to={backLink}
            >
              Quay lại
            </Link>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
