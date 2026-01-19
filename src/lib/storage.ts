const CUSTOMER_ID_KEY = 'qrqueue:customerId'

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

  getTicketId(siteSlug: string, roomSlug: string): string | null {
    return localStorage.getItem(ticketKey(siteSlug, roomSlug))
  },
  setTicketId(siteSlug: string, roomSlug: string, ticketId: string) {
    localStorage.setItem(ticketKey(siteSlug, roomSlug), ticketId)
  },
  clearTicketId(siteSlug: string, roomSlug: string) {
    localStorage.removeItem(ticketKey(siteSlug, roomSlug))
  },
}
