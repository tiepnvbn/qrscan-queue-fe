const CUSTOMER_ID_KEY = 'qrqueue:customerId'
const CUSTOMER_NAME_KEY = 'qrqueue:customerName'
const STAFF_TOKEN_KEY = 'qrqueue:staffToken'
const STAFF_NAME_KEY = 'qrqueue:staffName'
const STAFF_SITE_SLUG_KEY = 'qrqueue:staffSiteSlug'
const STAFF_SITE_NAME_KEY = 'qrqueue:staffSiteName'
const SESSION_TOKEN_KEY = 'qrqueue:sessionToken'
const SESSION_SITE_SLUG_KEY = 'qrqueue:sessionSiteSlug'

function ticketKey(siteSlug: string, roomSlug: string) {
  return `qrqueue:ticketId:${siteSlug}:${roomSlug}`
}

export const storage = {
  getCustomerId(): string | null {
    return localStorage.getItem(CUSTOMER_ID_KEY)
  },
  setCustomerId(customerId: string) {
    localStorage.setItem(CUSTOMER_ID_KEY, customerId)
  },
  clearCustomerId() {
    localStorage.removeItem(CUSTOMER_ID_KEY)
  },

  getCustomerName(): string | null {
    return localStorage.getItem(CUSTOMER_NAME_KEY)
  },
  setCustomerName(name: string) {
    localStorage.setItem(CUSTOMER_NAME_KEY, name)
  },
  clearCustomerName() {
    localStorage.removeItem(CUSTOMER_NAME_KEY)
  },

  getTicketId(siteSlug: string, roomSlug: string): string | null {
    return localStorage.getItem(ticketKey(siteSlug, roomSlug))
  },
  setTicketId(siteSlug: string, roomSlug: string, ticketId: string) {
    localStorage.setItem(ticketKey(siteSlug, roomSlug), ticketId)
  },
  clearTicketId(siteSlug: string, roomSlug: string) {
    localStorage.removeItem(ticketKey(siteSlug, roomSlug))
  },

  // ── Staff storage ──────────────────────────────────────────────

  getStaffToken(): string | null {
    return localStorage.getItem(STAFF_TOKEN_KEY)
  },
  setStaffToken(token: string) {
    localStorage.setItem(STAFF_TOKEN_KEY, token)
  },

  getStaffName(): string | null {
    return localStorage.getItem(STAFF_NAME_KEY)
  },
  setStaffName(name: string) {
    localStorage.setItem(STAFF_NAME_KEY, name)
  },

  getStaffSiteSlug(): string | null {
    return localStorage.getItem(STAFF_SITE_SLUG_KEY)
  },
  setStaffSiteSlug(slug: string) {
    localStorage.setItem(STAFF_SITE_SLUG_KEY, slug)
  },

  getStaffSiteName(): string | null {
    return localStorage.getItem(STAFF_SITE_NAME_KEY)
  },
  setStaffSiteName(name: string) {
    localStorage.setItem(STAFF_SITE_NAME_KEY, name)
  },

  clearStaff() {
    localStorage.removeItem(STAFF_TOKEN_KEY)
    localStorage.removeItem(STAFF_NAME_KEY)
    localStorage.removeItem(STAFF_SITE_SLUG_KEY)
    localStorage.removeItem(STAFF_SITE_NAME_KEY)
  },

  // ── Customer session (QR-verified) ────────────────────────────

  getSessionToken(): string | null {
    return sessionStorage.getItem(SESSION_TOKEN_KEY)
  },
  setSessionToken(token: string) {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token)
  },
  getSessionSiteSlug(): string | null {
    return sessionStorage.getItem(SESSION_SITE_SLUG_KEY)
  },
  setSessionSiteSlug(slug: string) {
    sessionStorage.setItem(SESSION_SITE_SLUG_KEY, slug)
  },
  clearSession() {
    sessionStorage.removeItem(SESSION_TOKEN_KEY)
    sessionStorage.removeItem(SESSION_SITE_SLUG_KEY)
  },
}
