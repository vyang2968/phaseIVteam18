import { z } from "zod";

export const AlternativeAirportsSchema = z.object({
  airport_code_list: z.string(),
  airport_name_list: z.string(),
  city: z.string(),
  country: z.string(),
  num_airports: z.number(),
  state: z.string()
})

export const FlightsInTheAirSchema = z.object({
  airplane_list: z.string(),
  arriving_at: z.string(),
  departing_from: z.string(),
  earliest_arrival: z.string(),
  flight_list: z.string(),
  latest_arrival: z.string(),
  num_flights: z.number()
})

export const FlightsOnTheGroundSchema = z.object({
  airplane_list: z.string(),
  departing_from: z.string(),
  earliest_arrival: z.string(),
  flight_list: z.string(),
  latest_arrival: z.string(),
  num_flights: z.number()
})

export const PeopleInTheAirSchema = z.object({
  departing_from: z.string(),
  arriving_at: z.string(),
  num_airplanes: z.number().int().positive(),
  airplane_list: z.string(),
  flight_list: z.string(),
  earliest_arrival: z.string(),
  latest_arrival: z.string(),
  num_pilots: z.number().int().nonnegative(),
  num_passengers: z.number().int().nonnegative(),
  joint_pilots_passengers: z.number().int().nonnegative(),
  person_list: z.string()
})

export const PeopleOnTheGroundSchema = z.object({
  airport: z.string(),
  airport_name: z.string(),
  city: z.string(),
  country: z.string(),
  departing_from: z.string(),
  joint_pilots_passengers: z.number().int().nonnegative(),
  num_passengers: z.number().int().nonnegative(),
  num_pilots: z.number().int().nonnegative(),
  person_list: z.string(),
  state: z.string()
})

export const RouteSummarySchema = z.object({
  airport_sequence: z.string(),
  flight_list: z.string(),
  num_flights: z.number(),
  num_legs: z.number(),
  route: z.string(),
  route_length: z.number()
})

export const viewSchemaMap = {
  alternative_airports: AlternativeAirportsSchema,
  flights_in_the_air: FlightsInTheAirSchema,
  flights_on_the_ground: FlightsOnTheGroundSchema,
  people_in_the_air: PeopleInTheAirSchema,
  people_on_the_ground: PeopleOnTheGroundSchema,
  route_summary: RouteSummarySchema
} as const

export type ViewSchemaFor<T extends keyof typeof viewSchemaMap> = z.infer<(typeof viewSchemaMap)[T]>

export type ViewName = 'alternative_airports' | 'flights_in_the_air' | 'flights_on_the_ground' | 'people_in_the_air' | 'people_on_the_ground' | 'route_summary'