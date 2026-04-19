import { Navigate } from 'react-router-dom'
import { storage } from '../lib/storage'
import type { PropsWithChildren } from 'react'

export default function StaffGuard({ children }: PropsWithChildren) {
  if (!storage.getStaffToken()) {
    return <Navigate to="/staff/login" replace />
  }
  return <>{children}</>
}
