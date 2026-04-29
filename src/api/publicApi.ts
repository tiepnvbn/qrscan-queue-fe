import { config } from '../config'
import { fetchJson } from './http'
import type {
  CustomerLoginRequest,
  CustomerLoginResponse,
  FeedbackRequest,
  FeedbackResponse,
  RoomStatusResponse,
  SiteCatalogDto,
  TakeTicketRequest,
  TakeTicketResponse,
  RoomStatusDto,
  VerifySiteTokenRequest,
  VerifySiteTokenResponse,
  SiteQrTokenDto,
  SessionValidateResponse,
  TakeMultiRoomTicketRequest,
  TakeMultiRoomTicketResponse,
} from './types'

function sessionHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('qrqueue:sessionToken')
  return token ? { 'X-Session-Token': token } : {}
}

export const publicApi = {
  async listSites(): Promise<SiteCatalogDto[]> {
    return fetchJson(`${config.apiBaseUrl}/api/public/sites`)
  },

  async loginCustomer(body: CustomerLoginRequest): Promise<CustomerLoginResponse> {
    return fetchJson(`${config.apiBaseUrl}/api/public/customers/login`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  async getRoomStatus(args: {
    siteSlug: string
    roomSlug: string
    ticketId?: string | null
  }): Promise<RoomStatusResponse> {
    const url = new URL(`${config.apiBaseUrl}/api/public/sites/${args.siteSlug}/rooms/${args.roomSlug}/status`)
    if (args.ticketId) url.searchParams.set('ticketId', args.ticketId)
    return fetchJson(url)
  },

  async takeTicket(args: {
    siteSlug: string
    roomSlug: string
    body: TakeTicketRequest
  }): Promise<TakeTicketResponse> {
    return fetchJson(`${config.apiBaseUrl}/api/public/sites/${args.siteSlug}/rooms/${args.roomSlug}/tickets`, {
      method: 'POST',
      body: JSON.stringify(args.body),
      headers: { ...sessionHeaders() },
    })
  },

  async takeMultiRoomTickets(args: {
    siteSlug: string
    body: TakeMultiRoomTicketRequest
  }): Promise<TakeMultiRoomTicketResponse> {
    return fetchJson(`${config.apiBaseUrl}/api/public/sites/${args.siteSlug}/tickets`, {
      method: 'POST',
      body: JSON.stringify(args.body),
      headers: { ...sessionHeaders() },
    })
  },

  async completeTicket(ticketId: string): Promise<RoomStatusDto> {
    return fetchJson(`${config.apiBaseUrl}/api/public/tickets/${ticketId}/complete`, {
      method: 'POST',
    })
  },

  async submitFeedback(ticketId: string, body: FeedbackRequest): Promise<FeedbackResponse> {
    return fetchJson(`${config.apiBaseUrl}/api/public/tickets/${ticketId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  async cancelTicket(ticketId: string): Promise<RoomStatusDto> {
    return fetchJson(`${config.apiBaseUrl}/api/public/tickets/${ticketId}/cancel`, {
      method: 'POST',
    })
  },

  // ── Dynamic QR endpoints ──────────────────────────────────────

  async getQrToken(siteSlug: string): Promise<SiteQrTokenDto> {
    return fetchJson(`${config.apiBaseUrl}/api/public/sites/${siteSlug}/qr-token`)
  },

  async verifySiteToken(siteSlug: string, body: VerifySiteTokenRequest): Promise<VerifySiteTokenResponse> {
    return fetchJson(`${config.apiBaseUrl}/api/public/sites/${siteSlug}/verify-token`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  async validateSession(): Promise<SessionValidateResponse> {
    return fetchJson(`${config.apiBaseUrl}/api/public/session/validate`, {
      headers: { ...sessionHeaders() },
    })
  },
}
