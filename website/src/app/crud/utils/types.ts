import { z } from "zod"

export const AirlineSchema = z.object({
  airlineid: z.string(),
  revenue: z.number()
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
    if (!data.maintenanced) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Maintenanced is required for Boeing',
        path: ['maintenanced'],
      })
    }

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

export type Airline = z.infer<typeof AirlineSchema>
export type Airplane = z.infer<typeof AirplaneSchema>

export const schemaMap = {
  airline: AirlineSchema,
  airplane: AirplaneSchema
} as const
export type SchemaFor<T extends TableName> = z.infer<(typeof schemaMap)[T]>

export type TableName = 'airline' | 'airplane'