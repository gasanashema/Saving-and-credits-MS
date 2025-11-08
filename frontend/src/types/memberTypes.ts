export interface Member {
  id: number
  nid: string
  firstName: string
  lastName: string
  telephone: string
  email: string
  balance: number
  status: string
}


export interface MemberSavings {
  sav_id: number
  date: string 
  shareValue: number
  numberOfShares: number
}
