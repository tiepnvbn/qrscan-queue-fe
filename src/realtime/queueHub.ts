import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import { config } from '../config'

export type QueueUpdatedPayload = {
  siteSlug: string
  roomSlug?: string
}

type QueueListener = (payload: QueueUpdatedPayload) => void

class QueueHubClient {
  private connection: HubConnection | null = null
  private joinedRooms = new Set<string>()
  private joinedSites = new Set<string>()
  private queueListeners = new Set<QueueListener>()

  private ensureConnection(): HubConnection {
    if (this.connection) return this.connection

    const conn = new HubConnectionBuilder()
      .withUrl(`${config.apiBaseUrl}/hubs/queue`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    // Backend broadcasts lightweight notifications; clients re-fetch state over HTTP.
    conn.on('QueueUpdated', (payload: QueueUpdatedPayload) => {
      this.queueListeners.forEach((fn) => fn(payload))
    })

    conn.onreconnected(async () => {
      // Resubscribe on reconnect
      for (const roomKey of this.joinedRooms) {
        const [siteSlug, roomSlug] = roomKey.split('|')
        if (siteSlug && roomSlug) {
          try {
            await conn.invoke('JoinRoom', siteSlug, roomSlug)
          } catch {
            // ignore; next status poll or reconnect will fix
          }
        }
      }

      for (const siteSlug of this.joinedSites) {
        try {
          await conn.invoke('JoinSite', siteSlug)
        } catch {
          // ignore
        }
      }
    })

    this.connection = conn
    return conn
  }

  async start(): Promise<void> {
    const conn = this.ensureConnection()
    if (conn.state === HubConnectionState.Connected) return
    if (conn.state === HubConnectionState.Connecting) return

    await conn.start()
  }

  onQueueUpdated(listener: QueueListener) {
    this.queueListeners.add(listener)
    return () => this.queueListeners.delete(listener)
  }

  async joinRoom(siteSlug: string, roomSlug: string): Promise<void> {
    await this.start()
    const conn = this.ensureConnection()
    await conn.invoke('JoinRoom', siteSlug, roomSlug)
    this.joinedRooms.add(`${siteSlug}|${roomSlug}`)
  }

  async joinSite(siteSlug: string): Promise<void> {
    await this.start()
    const conn = this.ensureConnection()
    await conn.invoke('JoinSite', siteSlug)
    this.joinedSites.add(siteSlug)
  }
}

let singleton: QueueHubClient | null = null

export function getQueueHub(): QueueHubClient {
  if (!singleton) singleton = new QueueHubClient()
  return singleton
}
