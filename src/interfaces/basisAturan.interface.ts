import { IKarir } from './karir.interface'
import { IKeahlian } from './keahlian.interface'
import { IMinat } from './minat.interface'

export interface IBasisAturan {
  id: string
  karirId: string
  minatId: string
  keahlianId: string
  karir: IKarir
  minat: IMinat
  keahlian: IKeahlian
}

export interface IBasisAturanResponse {
  id: string
  name: string
  description: string
  pengembangan_karir: string | null
  minat: { id: string; name: string }[]
  keahlian: { id: string; name: string; description: string }[]
}
