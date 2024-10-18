import { IKonsultasi } from './konsultasi.interface'

export interface IHistoriKonsultasi {
  id: string
  userId: string
  user?: {
    id: string
    email: string
    name: string
    image?: string
    role: string
  }
  konsultasi?: IKonsultasi
  minat?: {
    id: string
    name: string
  }
  keahlian?: {
    id: string
    name: string
    description: string
  }
  createdAt: Date
}
