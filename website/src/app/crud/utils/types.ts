import { z } from "zod"

export const AirlineSchema = z.object({
  airlineid: z.string().min(1, { message: "Required" }),
  revenue: z.number().min(1)
})

export const AirplaneSchema = z.object({
  airlineid: z.string().min(1, { message: "Required" }),
  tail_num: z.string().min(1, { message: "Required" }),
  seat_capacity: z.number().min(1),
  speed: z.number().min(1),
  locationid: z.string().optional().nullable(),
  plane_type: z.enum(["Boeing", "Airbus", "None"], { message: "Required" }).optional(),
  model: z.enum(["717", "727", "737", "747", "757", "767", "777", "787"]).optional(),
  maintenanced: z.boolean().optional(),
  neo: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.plane_type === 'Boeing') {
    if (!data.model) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Model is required for Boeing',
        path: ['model'],
      })
    }

    if (data.neo !== undefined && data.neo !== null && data.neo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Neo must not be set for Boeing',
        path: ['neo'],
      })
    }
  }
})

export const AirportSchema = z.object({

})
 
export const FlightSchema = z.object({

})
 
export const LegSchema = z.object({

})
 
export const LocationSchema = z.object({

})
 
export const PassengerSchema = z.object({

})
 
export const PassengerVacationsSchema = z.object({

})
 
export const PersonSchema = z.object({

})
 
export const PilotSchema = z.object({

})
 
export const PilotLicensesSchema = z.object({

})
 
export const RouteSchema = z.object({

})

export const RoutePathSchema = z.object({

})
 
export type Airline = z.infer<typeof AirlineSchema>
export type Airplane = z.infer<typeof AirplaneSchema>

export const tableSchemaMap = {
  airline: AirlineSchema,
  airplane: AirplaneSchema,
  airport: AirportSchema,
  flight: FlightSchema,
  leg: LegSchema,
  location: LocationSchema,
  passenger: PassengerSchema,
  passenger_vacations: PassengerVacationsSchema,
  person: PersonSchema,
  pilot: PilotSchema, 
  pilot_licenses: PilotLicensesSchema,
  route: RouteSchema,
  route_path: RoutePathSchema
} as const
export type TableSchemaFor<T extends TableName> = z.infer<(typeof tableSchemaMap)[T]>

export type TableName = 
  'airline' | 
  'airplane' | 
  'flight' |
  'leg' |
  'location' |
  'passenger' |
  'passenger_vacations' |
  'person' |
  'pilot' |
  'pilot_licenses' |
  'route' |
  'route_path'