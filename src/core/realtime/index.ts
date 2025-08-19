// Realtime communication abstraction
// Supports WebRTC, Colyseus, Socket.io

export interface RealtimeConnection {
  connect(roomId: string): Promise<void>
  disconnect(): void
  send(event: string, data: any): void
  on(event: string, handler: (data: any) => void): void
  off(event: string, handler: (data: any) => void): void
}

export interface RealtimeProvider {
  createConnection(): RealtimeConnection
}

// Placeholder for Colyseus implementation
export class ColyseusProvider implements RealtimeProvider {
  createConnection(): RealtimeConnection {
    return {
      async connect(roomId: string) {
        console.log('Connecting to room:', roomId)
        // TODO: Implement Colyseus connection
      },
      disconnect() {
        console.log('Disconnecting from room')
        // TODO: Implement disconnect
      },
      send(event: string, data: any) {
        console.log('Sending:', event, data)
        // TODO: Implement send
      },
      on(event: string, handler: (data: any) => void) {
        console.log('Listening to:', event)
        // TODO: Implement event listener
      },
      off(event: string, handler: (data: any) => void) {
        console.log('Removing listener:', event)
        // TODO: Implement remove listener
      },
    }
  }
}

// Export singleton instance
export const realtime = new ColyseusProvider()