import { zodResolver } from '@hookform/resolvers/zod'
import {
  DefaultValues,
  Path,
  PathValue,
  UseFormProps,
  useForm,
  useWatch,
} from 'react-hook-form'
import {
  ZodBoolean,
  ZodEffects,
  ZodEnum,
  ZodNumber,
  ZodObject,
  ZodString,
  z,
} from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useEffect } from 'react'
import { Airplane, TableName } from '@/app/crud/utils/types'
import { idsFor } from '@/app/crud/utils/ids'

export type AttributesFormProps<
  T extends ZodObject<any> | ZodEffects<ZodObject<any>>
> = {
  schema: T
  tableName: TableName
  defaultValues?: Partial<z.infer<T>>
  loading: boolean
  onSubmit: (data: z.infer<T>) => void
  buttonText: string
}

export default function AttributesForm<
  T extends ZodObject<any> | ZodEffects<ZodObject<any>>
>({
  schema,
  tableName,
  defaultValues,
  loading,
  onSubmit,
  buttonText,
}: AttributesFormProps<T>) {
  const coreSchema = schema instanceof ZodEffects ? schema._def.schema : schema
  const shape = (coreSchema as ZodObject<any>).shape

  const disabledKeys = idsFor[tableName] || []

  function getCoreType(def: any): any {
    let curr = def
    while (curr?._def?.innerType) curr = curr._def.innerType
    return curr
  }

  const finalDefaults: DefaultValues<z.infer<T>> = {} as any
  for (const [key, def] of Object.entries(shape)) {
    const inner = getCoreType(def)
    const userDefault = defaultValues?.[key as keyof typeof defaultValues]
    if (inner instanceof ZodBoolean) finalDefaults[key] = userDefault ?? false
    else if (inner instanceof ZodNumber) finalDefaults[key] = userDefault ?? 0
    else if (inner instanceof ZodString) finalDefaults[key] = userDefault ?? null
    else finalDefaults[key] = userDefault ?? ''
  }

  console.log(finalDefaults)

  const formConfig: UseFormProps<z.infer<T>> = {
    resolver: zodResolver(schema),
    defaultValues: finalDefaults,
  }
  const form = useForm<z.infer<T>>(formConfig)
  const { control, handleSubmit, setValue } = form

  const planeType = useWatch({ control, name: 'plane_type' as Path<z.infer<T>> })

  useEffect(() => {
    const modelKey = 'model' as Path<z.infer<T>>;
    const maintainedKey = 'maintenanced' as Path<z.infer<T>>;
    const neoKey = 'neo' as Path<z.infer<T>>;

    if (planeType === 'Boeing') {
      setValue(modelKey, null as PathValue<z.infer<T>, typeof modelKey>);
    } else if (planeType === 'Airbus') {
      setValue(modelKey, null as PathValue<z.infer<T>, typeof modelKey>);
      setValue(maintainedKey, false as PathValue<z.infer<T>, typeof maintainedKey>);
    } else {
      setValue(modelKey, null as PathValue<z.infer<T>, typeof modelKey>);
      setValue(maintainedKey, false as PathValue<z.infer<T>, typeof maintainedKey>);
      setValue(neoKey, false as PathValue<z.infer<T>, typeof neoKey>);
    }
  }, [planeType, setValue])

  function isRequired(def: any): boolean {
    let curr = def
    while (curr?._def) {
      if (
        curr._def.typeName === 'ZodOptional' ||
        curr._def.typeName === 'ZodNullable'
      )
        return false
      curr = curr._def.innerType
    }
    return true
  }

  const injectAndSubmit = (data: z.infer<T>) => {
    if (tableName === 'airplane') {
      const airplaneData = data as unknown as Airplane
      if (planeType === 'Boeing') {
        airplaneData.neo = null;
      } else if (planeType === 'Airbus') {
        airplaneData.model = null;
        airplaneData.maintenanced = null;
      } else {
        airplaneData.model = null;
        airplaneData.maintenanced = null;
        airplaneData.neo = null;
      }
    }

    console.log(data)
    onSubmit(data)
  }

  function formatKey(key: string) {
    return key.includes('_')
      ? key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      : key.charAt(0).toUpperCase() + key.slice(1)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(injectAndSubmit)} className="space-y-6">
        {Object.entries(shape).map(([key, def]) => {
          const core = getCoreType(def as any)
          const required = isRequired(def)
          const isBoeing = planeType === 'Boeing'
          const isAirbus = planeType === 'Airbus'

          const requireModel = isBoeing
          const requireMaint = isBoeing
          const requireNeo = isAirbus

          const disableModel = !isBoeing
          const disableMaint = !isBoeing
          const disableNeo = !isAirbus

          const isDisabled = defaultValues ? disabledKeys.includes(key) : false

          // ENUM
          if (core instanceof ZodEnum) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {formatKey(key)}
                      {required && (!['model', 'maintenanced', 'neo'].includes(key)) && (
                        <span className="text-red-400 ml-1">*</span>
                      )}
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

          // BOOLEAN
          if (core instanceof ZodBoolean) {
            const isDisabled =
              key === 'maintenanced' ? disableMaint :
                key === 'neo' ? disableNeo :
                  false

            const required =
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
                        onCheckedChange={(v) => field.onChange(!!v)}
                        disabled={isDisabled}
                      />
                    </FormControl>
                    <FormLabel className="flex-1">
                      {formatKey(key)}
                      {required && <span className="text-red-400 ml-1">*</span>}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }

          // NUMBER
          if (core instanceof ZodNumber) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {formatKey(key)}
                      {required && <span className="text-red-400 ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                        onBlur={field.onBlur}
                        disabled={isDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }

          // STRING
          if (core instanceof ZodString) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {formatKey(key)}
                      {required && <span className="text-red-400 ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        value={field.value === null ? '' : field.value} 
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === '' ? null : val)
                        }}
                        onBlur={field.onBlur}
                        disabled={isDisabled}
                      />
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
