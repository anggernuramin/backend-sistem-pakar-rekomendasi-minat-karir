export interface IKarir {
  id: string
  name: string
  description: string
  pengembangan_karir?: string
}

export interface INameKarirResponse {
  nameKarir: string
  descriptionKarir: string
  pengembangan_karir?: string
}
