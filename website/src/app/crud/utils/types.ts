import { z } from "zod"

export const AirlineSchema = z.object({
  airlineid: z.string().min(1, { message: "Required" }),
  revenue: z.number().min(1)
})

export const AirplaneSchemaRaw = z.object({
  airlineid: z.string().min(1, { message: "Required" }),
  tail_num: z.string().min(1, { message: "Required" }),
  seat_capacity: z.number().min(1),
  speed: z.number().min(1),
  locationid: z.string().optional().nullable(),
  plane_type: z.enum(["Boeing", "Airbus", "None"], { message: "Required" }).optional(),
  model: z.enum(["717", "727", "737", "747", "757", "767", "777", "787"]).optional().nullable(),
  maintenanced: z.boolean().optional().nullable(),
  neo: z.boolean().optional().nullable(),
})

export const AirplaneSchema = AirplaneSchemaRaw.superRefine((data, ctx) => {
  switch (data.plane_type) {
    case 'Boeing':
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
      break;
    case 'Airbus':
      if (data.model !== undefined && data.model !== null && data.model) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Model must not be set for Airbus',
          path: ['model'],
        })
      }
      if (data.maintenanced !== undefined && data.maintenanced !== null && data.maintenanced) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Maintenanced must not be set for Airbus',
          path: ['maintenanced'],
        })
      }
      break;
    case 'None':

      break;
    default:
      break;
  }
})

export const AirportSchema = z.object({
  airportid: z.string().length(3, { message: "Must be 3 characters" }),
  airport_name: z.string().optional(),
  city: z.string().min(1, { message: "Required" }),
  state: z.string().min(1, { message: "Required" }),
  country: z.string().length(3, { message: "Must be 3 characters" }),
  locationid: z.string().optional().nullable()
});

export const FlightSchema = z.object({
  flightid: z.string().min(1, { message: "Required" }),
  routeid: z.string().min(1, { message: "Required" }),
  support_airline: z.string().optional().nullable(),
  support_tail: z.string().optional().nullable(),
  progress: z.number().optional().nullable().default(0),
  airplane_status: z.enum(['on_ground', 'in_flight']).optional().nullable(),
  next_time: z.string().time().optional().nullable(),
  cost: z.number().default(0)
});

export const LegSchema = z.object({
  legid: z.string().min(1, { message: "Required" }),
  departure: z.string().length(3, { message: "Must be 3 characters" }),
  arrival: z.string().length(3, { message: "Must be 3 characters" }),
  distance: z.number().min(1, { message: "Required" })
});

export const LocationSchema = z.object({
  locationid: z.string().min(1, { message: "Required" })
});

export const PassengerSchema = z.object({
  personid: z.string().min(1, { message: "Required" }),
  miles: z.number().default(0),
  funds: z.number().default(0)
});

export const PassengerVacationsSchema = z.object({
  personid: z.string().min(1, { message: "Required" }),
  airportid: z.string().length(3, { message: "Must be 3 characters" }),
  sequence: z.number().min(1)
});

export const PersonSchema = z.object({
  personid: z.string().min(1, { message: "Required" }),
  first_name: z.string().min(1, { message: "Required" }),
  last_name: z.string().optional().nullable(),
  locationid: z.string().min(1, { message: "Required" })
});

export const PilotSchema = z.object({
  personid: z.string().min(1, { message: "Required" }),
  taxid: z.string().regex(/\d{3}-\d{2}-\d{4}$/, { message: "Please follow the format XXX-XX-XXXX"}).min(1, { message: "Required" }),
  experience: z.number().default(0),
  commanding_flight: z.string().optional().nullable()
});

export const PilotLicensesSchema = z.object({
  personid: z.string().min(1, { message: "Required" }),
  license: z.enum(['Airbus', 'Boeing', 'general'])
});

export const RouteSchema = z.object({
  routeid: z.string().min(1, { message: "Required" })
});

export const RoutePathSchema = z.object({
  routeid: z.string().min(1, { message: "Required" }),
  legid: z.string().min(1, { message: "Required" }),
  sequence: z.number().min(1)
});

export type Airline = z.infer<typeof AirlineSchema>
export type Airplane = z.infer<typeof AirplaneSchema>
export type Airport = z.infer<typeof AirportSchema>
export type Flight = z.infer<typeof FlightSchema>
export type Leg = z.infer<typeof LegSchema>
export type Location = z.infer<typeof LocationSchema>
export type Passenger = z.infer<typeof PassengerSchema>
export type PassengerVacations = z.infer<typeof PassengerVacationsSchema>
export type Person = z.infer<typeof PersonSchema>
export type Pilot = z.infer<typeof PilotSchema>
export type PilotLicense = z.infer<typeof PilotLicensesSchema>
export type Route = z.infer<typeof RouteSchema>
export type RoutePath = z.infer<typeof RoutePathSchema>

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
  'airport' |
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