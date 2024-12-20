export interface Room {
  index: number
  roomID: string
  name: string
  avatar: string
  updatedAt: number
  message: string
  tag: number
}

export type RoomSimple = Pick<Room, 'roomID' | 'updatedAt' | 'tag'>
