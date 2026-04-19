/** Maps room slug to display concept name (from Figma design) */
const ROOM_DISPLAY_NAMES: Record<string, string> = {
  'room-1': 'HOLOGRAM',
  'room-2': 'SEPIA ROOM',
  'room-3': 'BATH ROOM',
  'room-4': 'RED LIGHT ROOM',
  'room-5': 'GREEN RETRO ROOM',
}

const ROOM_VIET_NAMES: Record<string, string> = {
  'room-1': 'Phòng 1',
  'room-2': 'Phòng 2',
  'room-3': 'Phòng 3',
  'room-4': 'Phòng 4',
  'room-5': 'Phòng 5',
}

export function getRoomDisplayName(roomSlug: string, fallbackName: string): string {
  return ROOM_DISPLAY_NAMES[roomSlug] ?? fallbackName
}

export function getRoomVietName(roomSlug: string, fallbackName: string): string {
  return ROOM_VIET_NAMES[roomSlug] ?? fallbackName
}
