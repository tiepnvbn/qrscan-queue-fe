import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CustomerRoomPage from './pages/CustomerRoomPage'
import MyTicketPage from './pages/MyTicketPage'
import StaffRoomPage from './pages/StaffRoomPage'
import TvSitePage from './pages/TvSitePage'
import FeedbackPage from './pages/FeedbackPage'
import QrCodesPage from './pages/QrCodesPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/s/:siteSlug/r/:roomSlug" element={<CustomerRoomPage />} />
      <Route path="/s/:siteSlug/r/:roomSlug/mine" element={<MyTicketPage />} />

      <Route path="/staff/s/:siteSlug/r/:roomSlug" element={<StaffRoomPage />} />

      <Route path="/tv/s/:siteSlug" element={<TvSitePage />} />

      <Route path="/qr" element={<QrCodesPage />} />

      <Route path="/feedback" element={<FeedbackPage />} />

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
