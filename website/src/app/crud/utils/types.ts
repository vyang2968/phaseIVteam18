export interface Airplane {
  airlineid: string,
  tail_num: string,
  seat_capacity: number
  speed: number
  locationid?: string
  plane_type?: "Boeing" | "Airbus"
  maintenanced?: boolean
  neo?: boolean
}

export type DataType = Airplane