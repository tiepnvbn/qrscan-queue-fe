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
      console.log('[QueueHub] Received QueueUpdated:', payload)
      this.queueListeners.forEach((fn) => fn(payload))
    })

    conn.onreconnected(async () => {
      console.log('[QueueHub] Reconnected, rejoining groups')
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
    
    // Wait for connection if it's in progress
    if (conn.state === HubConnectionState.Connecting) {
      console.log('[QueueHub] Connection in progress, waiting...')
      // Wait for state change
      await new Promise<void>((resolve, reject) => {
        const checkState = setInterval(() => {
          if (conn.state === HubConnectionState.Connected) {
            clearInterval(checkState)
            resolve()
          } else if (conn.state === HubConnectionState.Disconnected) {
            clearInterval(checkState)
            reject(new Error('Connection failed'))
          }
        }, 100)
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkState)
          reject(new Error('Connection timeout'))
        }, 10000)
      })
      return
    }

    console.log('[QueueHub] Starting connection...')
    await conn.start()
    console.log('[QueueHub] Connected successfully')
  }

  onQueueUpdated(listener: QueueListener) {
    this.queueListeners.add(listener)
    return () => this.queueListeners.delete(listener)
  }

  async joinRoom(siteSlug: string, roomSlug: string): Promise<void> {
    await this.start()
    const conn = this.ensureConnection()
    console.log('[QueueHub] Invoking JoinRoom:', siteSlug, roomSlug)
    await conn.invoke('JoinRoom', siteSlug, roomSlug)
    this.joinedRooms.add(`${siteSlug}|${roomSlug}`)
    console.log('[QueueHub] Joined room successfully')
  }

  async joinSite(siteSlug: string): Promise<void> {
    await this.start()
    const conn = this.ensureConnection()
    console.log('[QueueHub] Invoking JoinSite:', siteSlug)
    await conn.invoke('JoinSite', siteSlug)
    this.joinedSites.add(siteSlug)
    console.log('[QueueHub] Joined site successfully')
  }
}

let singleton: QueueHubClient | null = null

export function getQueueHub(): QueueHubClient {
  if (!singleton) singleton = new QueueHubClient()
  return singleton
}
