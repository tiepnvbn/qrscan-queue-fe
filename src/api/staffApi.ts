import { config } from '../config'
import { fetchJson } from './http'
import type { RoomStatusDto } from './types'

export const staffApi = {
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
