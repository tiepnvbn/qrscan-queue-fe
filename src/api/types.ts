export type TicketStatus = 'Waiting' | 'Serving' | 'Completed' | 'Skipped'

export type CustomerTier = 'Normal' | 'VIP'

export type ServiceDate = string // YYYY-MM-DD

export interface CustomerLoginRequest {
  phone: string
  dateOfBirth: string // YYYY-MM-DD
}

export interface CustomerLoginResponse {
  customerId: string
  points: number
  freeCredits: number
  tier: CustomerTier
}

export interface RoomStatusDto {
  roomId: string
  roomSlug: string
  roomName: string
  serviceDate: ServiceDate
  serviceMinutes: number
  currentNumber: number | null
  currentDisplayNumber: string | null
  nextNumber: number | null
  nextDisplayNumber: string | null
  nextToTakeNumber: number
  nextToTakeDisplayNumber: string
  waitingCount: number
  now: string // ISO
}

export interface MyTicketDto {
  ticketId: string
  number: number
  displayNumber: string
  status: TicketStatus
  aheadCount: number
  estimatedWaitMinutes: number
  estimatedServeTime: string // ISO
}

export interface RoomStatusResponse {
  siteSlug: string
  roomSlug: string
  status: RoomStatusDto
  myTicket: MyTicketDto | null
}

export interface TakeTicketRequest {
  customerId?: string | null
}

export interface TakeTicketResponse {
  ticketId: string
  number: number
  status: RoomStatusDto
  myTicket: MyTicketDto | null
}

export interface FeedbackRequest {
  stars: number
  comment?: string | null
}

export interface FeedbackResponse {
  feedbackId: string
  ticketId: string
}

export interface SiteRoomStatusDto {
  roomId: string
  roomSlug: string
  roomName: string
  serviceDate: ServiceDate
  serviceMinutes: number
  currentNumber: number | null
  currentDisplayNumber: string | null
  nextNumber: number | null
  nextDisplayNumber: string | null
  nextToTakeNumber: number
  nextToTakeDisplayNumber: string
  waitingCount: number
  now: string // ISO
}

export interface SiteStatusDto {
  siteSlug: string
  now: string // ISO
  rooms: SiteRoomStatusDto[]
}

export interface RoomCatalogDto {
  roomId: string
  roomSlug: string
  roomName: string
  serviceMinutes: number
}

export interface SiteCatalogDto {
  siteId: string
  siteSlug: string
  siteName: string
  rooms: RoomCatalogDto[]
}
