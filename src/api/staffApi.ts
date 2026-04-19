import { config } from '../config'
import { fetchJson } from './http'
import type { RoomStatusDto, StaffLoginRequest, StaffLoginResponse, StaffTicketListResponse } from './types'

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('qrqueue:staffToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const staffApi = {
  async login(body: StaffLoginRequest): Promise<StaffLoginResponse> {
    return fetchJson(`${config.apiBaseUrl}/api/staff/login`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  async listTickets(siteSlug: string, params?: {
    roomSlug?: string
    search?: string
    status?: string[]
    page?: number
    pageSize?: number
  }): Promise<StaffTicketListResponse> {
    const url = new URL(`${config.apiBaseUrl}/api/staff/sites/${siteSlug}/tickets`)
    if (params?.roomSlug) url.searchParams.set('roomSlug', params.roomSlug)
    if (params?.search) url.searchParams.set('search', params.search)
    if (params?.status) params.status.forEach(s => url.searchParams.append('status', s))
    if (params?.page) url.searchParams.set('page', String(params.page))
    if (params?.pageSize) url.searchParams.set('pageSize', String(params.pageSize))
    return fetchJson(url, { headers: authHeaders() })
  },

  async completeTicket(ticketId: string): Promise<RoomStatusDto> {
    return fetchJson(`${config.apiBaseUrl}/api/staff/tickets/${ticketId}/complete`, {
      method: 'POST',
      headers: authHeaders(),
    })
  },

  async cancelTicket(ticketId: string): Promise<RoomStatusDto> {
    return fetchJson(`${config.apiBaseUrl}/api/staff/tickets/${ticketId}/cancel`, {
      method: 'POST',
      headers: authHeaders(),
    })
  },

  // Phase 1 room-level actions (kept for StaffRoomPage compatibility)
  async callNext(siteSlug: string, roomSlug: string): Promise<RoomStatusDto> {
    return fetchJson(`${config.apiBaseUrl}/api/staff/sites/${siteSlug}/rooms/${roomSlug}/call-next`, {
      method: 'POST',
    })
  },

  async completeCurrent(siteSlug: string, roomSlug: string): Promise<RoomStatusDto> {
    return fetchJson(`${config.apiBaseUrl}/api/staff/sites/${siteSlug}/rooms/${roomSlug}/complete-current`, {
      method: 'POST',
    })
  },

  async skipCurrent(siteSlug: string, roomSlug: string): Promise<RoomStatusDto> {
    return fetchJson(`${config.apiBaseUrl}/api/staff/sites/${siteSlug}/rooms/${roomSlug}/skip-current`, {
      method: 'POST',
    })
  },
}
