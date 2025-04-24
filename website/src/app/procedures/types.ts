import { z } from "zod"
import { AirplaneSchema, AirplaneSchemaRaw, AirportSchema, FlightSchema, PassengerSchema, PersonSchema, PilotSchema } from "../crud/utils/types"

export const AddAirplaneSchema = AirplaneSchemaRaw.extend({
  locationid: z.string()
})

export const AddAirportSchema = AirportSchema.extend({
  airport_name: z.string(),
  locationid: z.string()
})

export const AddPersonSchema =
  z.discriminatedUnion('person_type', [
    PersonSchema
      .merge(
        PilotSchema
          .extend({
            person_type: z.literal('Pilot')
          })
          .omit({commanding_flight: true})
      ),
    PersonSchema
      .merge(PassengerSchema.extend({
        person_type: z.literal('Passenger')
      }))
  ])

export const GrantOrRevokePilotLicenseSchema = z.object({
  personid: z.string().min(1, { message: "Required" }),
  license: z.string().min(1, { message: "Required" })
})

export const OfferFlightSchema = FlightSchema.extend({
  support_airline: z.string(),
  support_tail: z.string(),
  progress: z.number(),
  next_time: z.string().time(),
  cost: z.number()
})

export const FlightLandingSchema = z.object({
  flightid: z.string().min(1, { message: "Required" })
})

export const FlightTakeoffSchema = z.object({
  flightid: z.string().min(1, { message: "Required" })
})

export const PassengersBoardSchema = z.object({
  flightid: z.string().min(1, { message: "Required" })
})

export const PassengersDisembarkSchema = z.object({
  flightid: z.string().min(1, { message: "Required" })
})

export const AssignPilotSchema = z.object({
  flightid: z.string().min(1, { message: "Required" }),
  personid: z.string().min(1, { message: "Required" })
})

export const RecycleCrewSchema = z.object({
  flightid: z.string().min(1, { message: "Required" })
})

export const RetireFlightSchema = z.object({
  flightid: z.string().min(1, { message: "Required" }),
})

export const SimulationCycleSchema = z.object({})

export type AddAirplaneType = z.infer<typeof AddAirplaneSchema>
export type AddAirportType = z.infer<typeof AddAirportSchema>
export type AddPersonType = z.infer<typeof AddPersonSchema>
export type GrantOrRevokePilotLicenseType = z.infer<typeof GrantOrRevokePilotLicenseSchema>
export type OfferFlightType = z.infer<typeof OfferFlightSchema>
export type FlightLandingType = z.infer<typeof FlightLandingSchema>
export type FlightTakeoffType = z.infer<typeof FlightTakeoffSchema>
export type PassengersBoardType = z.infer<typeof PassengersBoardSchema>
export type PassengersDisembarkType = z.infer<typeof PassengersDisembarkSchema>
export type AssignPilotType = z.infer<typeof AssignPilotSchema>
export type RecycleCrewType = z.infer<typeof RecycleCrewSchema>
export type RetireFlightType = z.infer<typeof RetireFlightSchema>

export const procedureSchemaMap = {
  add_airplane: AddAirplaneSchema,
  add_airport: AddAirportSchema,
  add_person: AddPersonSchema,
  grant_or_revoke_pilot_license: GrantOrRevokePilotLicenseSchema,
  offer_flight: OfferFlightSchema,
  flight_landing: FlightLandingSchema,
  flight_takeoff: FlightTakeoffSchema,
  passengers_board: PassengersBoardSchema,
  passengers_disembark: PassengersDisembarkSchema,
  assign_pilot: AssignPilotSchema,
  recycle_crew: RecycleCrewSchema,
  retire_flight: RetireFlightSchema,
  simulation_cycle: SimulationCycleSchema
}

export type ProcedureSchemaFor<T extends ProcedureName> = z.infer<(typeof procedureSchemaMap)[T]>

export type ProcedureName =
  'add_airplane' |
  'add_airport' |
  'add_person' |
  'grant_or_revoke_pilot_license' |
  'offer_flight' |
  'flight_landing' |
  'flight_takeoff' |
  'passengers_board' |
  'passengers_disembark' |
  'assign_pilot' |
  'recycle_crew' |
  'retire_flight' |
  'simulation_cycle'