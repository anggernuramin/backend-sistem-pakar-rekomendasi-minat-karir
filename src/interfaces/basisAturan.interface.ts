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
