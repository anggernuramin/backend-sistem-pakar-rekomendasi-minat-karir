import { JsonValue } from '@prisma/client/runtime/library'

export interface IKonsultasi {
  id: string
  userId: string
  hasil?: JsonValue
  createdAt: Date
  user?: {
    id: string
    email: string
    name: string
    image?: string
    role: string
  }
  karir?: {
    id: string
    name: string
    description: string
    pengembangan_karir?: string
  }
}
