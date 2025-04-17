'use client'

import {
  ZodObject,
  ZodRawShape,
  ZodEnum,
  ZodNumber,
  ZodString,
  ZodBoolean,
  z,
  ZodEffects,
} from 'zod'
import {
  useForm,
  FormProvider,
  Controller,
  DefaultValues,
  UseFormProps,
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
  FormDescription,
  Form,
} from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'

type CreateFormProps<T extends ZodObject<any> | ZodEffects<ZodObject<any>>> = {
  schema: T
  defaultValues?: Partial<z.infer<T>>
  loading: boolean
  onSubmit: (data: z.infer<T>) => void
}

export default function CreateForm<T extends ZodObject<any> | ZodEffects<ZodObject<any>>>({
  schema,
  defaultValues,
  loading,
  onSubmit,
}: CreateFormProps<T>) {
  const unwrappedSchema =
    schema instanceof z.ZodEffects ? schema._def.schema : schema;
  const shape = (unwrappedSchema as z.ZodObject<any>).shape;
  const finalDefaults: DefaultValues<z.infer<T>> = {} as any

  for (const [key, def] of Object.entries(shape)) {
    const defAny = def as any
    const coreDef = defAny._def?.innerType ?? def
    const userDefault = defaultValues?.[key as keyof typeof defaultValues]

    let fallback: any = ''
    if (coreDef instanceof ZodBoolean) fallback = false
    else if (coreDef instanceof ZodNumber) fallback = 0
    else if (coreDef instanceof ZodEnum) fallback = userDefault ?? ''
    else fallback = ''

    finalDefaults[key as keyof typeof finalDefaults] =
      userDefault !== undefined ? userDefault : fallback
  }

  const formConfig: UseFormProps<z.infer<T>> = {
    resolver: zodResolver(schema),
    defaultValues: finalDefaults,
  }

  const form = useForm<z.infer<T>>(formConfig)
  const { control, handleSubmit } = form

  function isRequired(def: any): boolean {
    const checks = [def._def?.innerType ?? def]
    let current = def
    while (current?._def) {
      if (current._def.typeName === 'ZodOptional' || current._def.typeName === 'ZodNullable') {
        return false
      }
      current = current._def.innerType
      checks.push(current)
    }
    return true
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {Object.entries(shape).map(([key, def]) => {
          const defAny = def as any
          const coreDef = defAny._def?.innerType ?? def

          // ENUM
          if (coreDef instanceof ZodEnum) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        {key.includes('_')
                          ? key
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                          : key.charAt(0).toUpperCase() + key.slice(1)}
                        {isRequired(def) && <span className="text-red-400 ml-1">*</span>}
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${key}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {coreDef.options.map((opt: string) => (
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
          if (coreDef instanceof ZodBoolean) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as any}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>
                      <div>
                        {key.includes('_')
                          ? key
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                          : key.charAt(0).toUpperCase() + key.slice(1)}
                        {isRequired(def) && <span className="text-red-400 ml-1">*</span>}
                      </div>
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }

          // NUMBER
          if (coreDef instanceof ZodNumber) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        {key.includes('_')
                          ? key
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                          : key.charAt(0).toUpperCase() + key.slice(1)}
                        {isRequired(def) && <span className="text-red-400 ml-1">*</span>}
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Enter a number"
                        value={field.value === undefined || field.value === null ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            field.onChange(undefined); // Allow clearing the value
                          } else {
                            const numberValue = isNaN(Number(value)) ? undefined : Number(value); // Only set a valid number
                            field.onChange(numberValue);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }

          // STRING (and fallback)
          if (coreDef instanceof ZodString) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        {key.includes('_')
                          ? key
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                          : key.charAt(0).toUpperCase() + key.slice(1)}
                        {isRequired(def) && <span className="text-red-400 ml-1">*</span>}
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }

          return null
        })}
        <Button type="submit">
          Create
          {loading && <Spinner className='animate-spin text-white' size="small"/>}
        </Button>
      </form>
    </Form>
  )
}
