import { config } from '../config'
import { fetchJson } from './http'
import type { SiteStatusDto } from './types'

export const tvApi = {
  async getSiteStatus(siteSlug: string): Promise<SiteStatusDto> {
    return fetchJson(`${config.apiBaseUrl}/api/tv/sites/${siteSlug}/status`)
  },
}
