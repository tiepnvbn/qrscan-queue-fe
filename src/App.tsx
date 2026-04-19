import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ScanQrPage from './pages/ScanQrPage'
import ChooseRoomPage from './pages/ChooseRoomPage'
import CustomerRoomPage from './pages/CustomerRoomPage'
import ThankYouPage from './pages/ThankYouPage'
import StaffLoginPage from './pages/StaffLoginPage'
import StaffDashboardPage from './pages/StaffDashboardPage'
import StaffRoomListPage from './pages/StaffRoomListPage'
import StaffCustomerListPage from './pages/StaffCustomerListPage'
import StaffRoomPage from './pages/StaffRoomPage'
import TvSitePage from './pages/TvSitePage'
import FeedbackPage from './pages/FeedbackPage'
import QrCodesPage from './pages/QrCodesPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/s/:siteSlug" element={<ScanQrPage />} />
      <Route path="/s/:siteSlug/rooms" element={<ChooseRoomPage />} />
      <Route path="/s/:siteSlug/r/:roomSlug" element={<CustomerRoomPage />} />
      <Route path="/s/:siteSlug/r/:roomSlug/thankyou" element={<ThankYouPage />} />

      {/* Legacy route — redirect to new flow */}
      <Route path="/s/:siteSlug/r/:roomSlug/mine" element={<CustomerRoomPage />} />

      {/* Phase 2 Staff flow */}
      <Route path="/staff/login" element={<StaffLoginPage />} />
      <Route path="/staff" element={<StaffDashboardPage />} />
      <Route path="/staff/rooms" element={<StaffRoomListPage />} />
      <Route path="/staff/tickets" element={<StaffCustomerListPage />} />
      <Route path="/staff/tickets/:roomSlug" element={<StaffCustomerListPage />} />

      {/* Phase 1 staff room (backward compatible) */}
      <Route path="/staff/s/:siteSlug/r/:roomSlug" element={<StaffRoomPage />} />

      <Route path="/tv/s/:siteSlug" element={<TvSitePage />} />

      <Route path="/qr" element={<QrCodesPage />} />

      <Route path="/feedback" element={<FeedbackPage />} />

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
