'use client'

import {
  ZodObject,
  ZodEffects,
  ZodEnum,
  ZodNumber,
  ZodString,
  ZodBoolean,
  z,
} from 'zod'
import {
  useForm,
  DefaultValues,
  UseFormProps,
  useWatch,
  Path,
  PathValue,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { useEffect } from 'react'
import { AirplaneSchema } from '../utils/types'

type CreateFormProps<T extends ZodObject<any> | ZodEffects<ZodObject<any>>> = {
  schema: T
  defaultValues?: Partial<z.infer<T>>
  loading: boolean
  onSubmit: (data: z.infer<T>) => void
  buttonText: string
}

export default function CreateForm<T extends ZodObject<any> | ZodEffects<ZodObject<any>>>({
  schema,
  defaultValues,
  loading,
  onSubmit,
  buttonText
}: CreateFormProps<T>) {
  const coreSchema = schema instanceof ZodEffects ? schema._def.schema : schema
  const shape = (coreSchema as ZodObject<any>).shape

  const finalDefaults: DefaultValues<z.infer<T>> = {} as any
  for (const [key, def] of Object.entries(shape)) {
    const inner = (def as any)._def?.innerType ?? def
    const userDefault = defaultValues?.[key as keyof typeof defaultValues]
    if (inner instanceof ZodBoolean) finalDefaults[key] = userDefault ?? false
    else if (inner instanceof ZodNumber) finalDefaults[key] = userDefault ?? 0
    else finalDefaults[key] = userDefault ?? ''
  }

  const formConfig: UseFormProps<z.infer<T>> = {
    resolver: zodResolver(schema),
    defaultValues: finalDefaults,
  }
  const form = useForm<z.infer<T>>(formConfig)
  const { control, handleSubmit, setValue } = form

  const planeType = useWatch({ control, name: 'plane_type' as Path<z.infer<T>> })

  useEffect(() => {
    if (planeType === 'Boeing') {
      setValue('model' as Path<z.infer<T>>, null as unknown as PathValue<z.infer<T>, 'model'>)
    } else if (planeType === 'Airbus') {
      setValue('model' as Path<z.infer<T>>, null as unknown as PathValue<z.infer<T>, 'model'>)
      setValue('maintenanced' as Path<z.infer<T>>, false as unknown as PathValue<z.infer<T>, 'maintenanced'>)
    } else {
      setValue('model' as Path<z.infer<T>>, null as unknown as PathValue<z.infer<T>, 'model'>)
      setValue('maintenanced' as Path<z.infer<T>>, false as unknown as PathValue<z.infer<T>, 'maintenanced'>)
      setValue('neo' as Path<z.infer<T>>, false as unknown as PathValue<z.infer<T>, 'neo'>)      
    }
  }, [planeType, setValue])
  


  function isRequired(def: any): boolean {
    let curr = def
    while (curr?._def) {
      if (curr._def.typeName === 'ZodOptional' || curr._def.typeName === 'ZodNullable')
        return false
      curr = curr._def.innerType
    }
    return true
  }

  function getCoreType(def: any): any {
    let curr = def
    while (curr?._def?.innerType) curr = curr._def.innerType
    return curr
  }

  const injectAndSubmit = (data: z.infer<T>) => {
    if ('neo' in data && 'model' in data && 'maintenanced' in data) {
      if (planeType === 'Boeing') {
        data.neo = null;
      } else if (planeType === 'Airbus') {
        data.model = null;
        data.maintenanced = null;
      } else {
        data.model = null;
        data.maintenanced = null;
        data.neo = null;
      }
    }

    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(injectAndSubmit)} className="space-y-6">
        {Object.entries(shape).map(([key, def]) => {
          const core = getCoreType(def as any)

          const alwaysRequired = isRequired(def)
          const isBoeing = planeType === 'Boeing'
          const isAirbus = planeType === 'Airbus'

          const requireModel = isBoeing
          const requireMaint = isBoeing
          const requireNeo = isAirbus

          const disableModel = !isBoeing
          const disableMaint = !isBoeing
          const disableNeo = !isAirbus

          // ENUM fields (including plane_type & model)
          if (core instanceof ZodEnum) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {key.includes('_')
                        ? key
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                      {(alwaysRequired || (key === 'model' && requireModel)) && <span className="text-red-400 ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value === null ? '' : field.value ?? ''}
                        onValueChange={(v) => field.onChange(v === '' ? null : v)}
                        disabled={
                          key === 'model' ? disableModel :
                            key === 'neo' ? disableNeo :
                              false
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${key}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {core.options.map((opt: string) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }

          // BOOLEAN fields
          if (core instanceof ZodBoolean) {
            const isDisabled =
              key === 'maintenanced' ? disableMaint :
                key === 'neo' ? disableNeo :
                  false

            const showAsterisk =
              key === 'maintenanced' ? requireMaint :
                key === 'neo' ? requireNeo :
                  false

            return (
              <FormField
                key={key}
                control={control}
                name={key as any}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={isDisabled}
                      />
                    </FormControl>
                    <FormLabel className="flex-1">
                      {key.includes('_')
                        ? key
                          .split('_')
                          .map(w => w[0].toUpperCase() + w.slice(1))
                          .join(' ')
                        : key[0].toUpperCase() + key.slice(1)}
                      {showAsterisk && <span className="text-red-400 ml-1">*</span>}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }

          // NUMBER fields
          if (core instanceof ZodNumber) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {key.includes('_')
                        ? key
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                      {alwaysRequired && <span className="text-red-400 ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value

                          field.onChange(val === '' ? undefined : Number(val))
                        }}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }

          // STRING fields
          if (core instanceof ZodString) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {key.includes('_')
                        ? key
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                      {alwaysRequired && <span className="text-red-400 ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} disabled={false} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }

          return null
        })}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Spinner className="h-4 w-4 animate-spin" /> : buttonText}
        </Button>
      </form>
    </Form>
  )
}
