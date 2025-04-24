import { zodResolver } from '@hookform/resolvers/zod';
import {
  DefaultValues,
  Path,
  UseFormProps,
  useForm,
  useWatch
} from 'react-hook-form';
import {
  ZodBoolean,
  ZodDiscriminatedUnion,
  ZodEffects,
  ZodEnum,
  ZodLiteral,
  ZodNumber,
  ZodObject,
  ZodString,
  ZodTypeAny,
  z
} from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useEffect, useMemo, useState } from 'react';
import { Airplane, PassengerSchema, PersonSchema, PilotSchema, TableName } from '@/app/crud/utils/types';
import { idsFor } from '@/app/crud/utils/ids';

export type AttributesFormProps<
  T extends ZodObject<any> | ZodEffects<ZodObject<any>> | ZodDiscriminatedUnion<any, any>
> = {
  schema: T;
  tableName: TableName;
  defaultValues?: Partial<z.infer<T>>;
  loading: boolean;
  onSubmit: (data: z.infer<T>) => void;
  buttonText: string;
};

function getCoreType(def: any): any {
  let curr = def;
  while (curr?._def?.innerType || curr instanceof ZodEffects) {
    if (curr instanceof ZodEffects) {
      curr = curr._def.schema;
    } else {
      curr = curr._def.innerType;
    }
  }
  return curr;
}

function isRequired(def: any): boolean {
  let curr = def;

  while (curr) {
    const typeName = curr?._def?.typeName;
    if (typeName === 'ZodOptional' || typeName === 'ZodNullable') {
      return false;
    }

    if (curr instanceof ZodEffects) {
      curr = curr._def.schema;
      continue;
    } else if (curr?._def?.innerType) {
      curr = curr._def.innerType;
    } else {
      break;
    }
  }
  return true;
}

function formatKey(key: string) {
  return key.includes('_')
    ? key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    : key.charAt(0).toUpperCase() + key.slice(1);
}

export default function AttributesForm<
  T extends ZodObject<any> | ZodEffects<ZodObject<any>> | ZodDiscriminatedUnion<any, any>
>({
  schema,
  tableName,
  defaultValues,
  loading,
  onSubmit,
  buttonText,
}: AttributesFormProps<T>) {
  const shape = useMemo(() => {
    const combinedShape: Record<string, ZodTypeAny> = {};

    let schemaToProcess: ZodObject<any> | ZodDiscriminatedUnion<any, any>;

    if (schema instanceof ZodEffects) {
      schemaToProcess = schema._def.schema;
    } else if (schema instanceof ZodObject || schema instanceof ZodDiscriminatedUnion) {
      schemaToProcess = schema;
    } else {
      console.error("AttributesForm: Unsupported schema type provided.", schema);
      return {};
    }

    if (schemaToProcess instanceof ZodDiscriminatedUnion) {
      schemaToProcess.options.forEach((optionSchema: any) => {
        let currentOption = optionSchema;

        if (currentOption instanceof ZodEffects) {
          currentOption = currentOption._def.schema;
        }

        if (currentOption instanceof ZodObject) {
          Object.assign(combinedShape, currentOption.shape);
        }
      });
    } else if (schemaToProcess instanceof ZodObject) {
      Object.assign(combinedShape, schemaToProcess.shape);
    }

    return combinedShape;
  }, [schema]);


  const [skipKeys, setSkipKeys] = useState<string[]>([]);
  const disabledKeys = useMemo(() => idsFor[tableName] || [], [tableName]);

  const finalDefaults = useMemo(() => {
    const defaults: DefaultValues<z.infer<T>> = {} as any;
    for (const [key, def] of Object.entries(shape)) {
      const inner = getCoreType(def);
      const userDefault = defaultValues?.[key as keyof typeof defaultValues];

      if (userDefault !== undefined) {
        defaults[key as keyof typeof defaults] = userDefault;
      } else if (inner instanceof ZodBoolean) {
        defaults[key as keyof typeof defaults] = false;
      } else if (inner instanceof ZodNumber) {
        defaults[key as keyof typeof defaults] = 0;
      } else if (inner instanceof ZodString) {
        if (!isRequired(def)) {
          defaults[key as keyof typeof defaults] = null;
        } else {
          defaults[key as keyof typeof defaults] = '';
        }
      } else if (inner instanceof ZodEnum) {
        const schemaDefault = (def as z.ZodDefault<any>)?._def?.defaultValue;
        if (schemaDefault !== undefined) {
          defaults[key as keyof typeof defaults] = schemaDefault;
        } else if (!isRequired(def)) {
          defaults[key as keyof typeof defaults] = null;
        } else {
          defaults[key as keyof typeof defaults] = undefined;
        }
      } else {
        defaults[key as keyof typeof defaults] = isRequired(def) ? '' : null;
      }
    }

    if (defaultValues) {
      Object.assign(defaults, defaultValues);
    }
    return defaults;
  }, [shape, defaultValues]);


  const formConfig: UseFormProps<z.infer<T>> = {
    resolver: zodResolver(schema),
    defaultValues: finalDefaults
  };
  const form = useForm<z.infer<T>>(formConfig);
  const { control, handleSubmit, setValue, formState: { errors } } = form;

  const planeType = useWatch({ control, name: 'plane_type' as Path<z.infer<T>> });
  const personType = useWatch({ control, name: 'person_type' as Path<z.infer<T>> });

  useEffect(() => {
    if (tableName !== 'airplane') return;

    const modelKey = 'model' as Path<z.infer<T>>;
    const maintainedKey = 'maintenanced' as Path<z.infer<T>>;
    const neoKey = 'neo' as Path<z.infer<T>>;

    if (!(modelKey in shape) || !(maintainedKey in shape) || !(neoKey in shape)) {
      return;
    }

    if (planeType === 'Boeing') {
      if (neoKey in shape) setValue(neoKey, null as any);
    } else if (planeType === 'Airbus') {
      if (modelKey in shape) setValue(modelKey, null as any);
      if (maintainedKey in shape) setValue(maintainedKey, false as any);
    } else {
      if (modelKey in shape) setValue(modelKey, null as any);
      if (maintainedKey in shape) setValue(maintainedKey, false as any);
      if (neoKey in shape) setValue(neoKey, null as any);
    }
  }, [planeType, setValue, tableName, shape]);

  useEffect(() => {
    if (!('person_type' in shape)) return;

    const skippedKeys: string[] = [];

    const pilotKeys = Object.keys(PilotSchema?.shape || {});
    const passengerKeys = Object.keys(PassengerSchema?.shape || {});
    const personKeys = Object.keys(PersonSchema?.shape || {});

    if (personType === 'Pilot') {
      // skip passenger fields
      for (const key of passengerKeys) {
        if (!personKeys.includes(key) && !pilotKeys.includes(key)) {
          skippedKeys.push(key);
        }
      }
    } else if (personType === 'Passenger') {
      // skip pilot fields
      for (const key of pilotKeys) {
        if (!personKeys.includes(key) && !passengerKeys.includes(key)) {
          skippedKeys.push(key);
        }
      }
    } else {
      // skip all pilot and passenger fields
      for (const key of pilotKeys) {
        if (!personKeys.includes(key)) {
          skippedKeys.push(key);
        }
      }
      for (const key of passengerKeys) {
        if (!personKeys.includes(key)) {
          skippedKeys.push(key);
        }
      }
    }

    setSkipKeys(skippedKeys);
  }, [personType, shape]);

  const injectAndSubmit = (data: z.infer<T>) => {
    if (tableName === 'airplane' && 'plane_type' in data) {
      const airplaneData = data as unknown as Airplane; 
      const currentPlaneType = airplaneData.plane_type;
      if (currentPlaneType === 'Boeing') {
        if ('neo' in airplaneData) airplaneData.neo = null;
      } else if (currentPlaneType === 'Airbus') {
        if ('model' in airplaneData) airplaneData.model = null;
        if ('maintenanced' in airplaneData) airplaneData.maintenanced = null;
      } else {
        if ('model' in airplaneData) airplaneData.model = null;
        if ('maintenanced' in airplaneData) airplaneData.maintenanced = null;
        if ('neo' in airplaneData) airplaneData.neo = null;
      }
    }
    console.log("submitting data:", data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(injectAndSubmit)} className="space-y-6">
        
        {Object.entries(shape).map(([key, def]) => {
          if (skipKeys.includes(key)) {
            return null;
          }
          const core = getCoreType(def as ZodTypeAny);

          const fieldRequired = isRequired(def);
          const isDisabled = defaultValues ? disabledKeys.includes(key) : false;


          const isBoeing = planeType === 'Boeing';
          const isAirbus = planeType === 'Airbus';

          const requireModel = isBoeing;
          const requireMaint = isBoeing;
          const requireNeo = isAirbus;

          const disableModel = key === 'model' && !isBoeing;
          const disableMaint = key === 'maintenanced' && !isBoeing;
          const disableNeo = key === 'neo' && !isAirbus;

          const finalIsDisabled = isDisabled || disableModel || disableMaint || disableNeo;

          let finalIsRequired = fieldRequired;
          if (tableName === 'airplane') {
            if (key === 'model') finalIsRequired = requireModel;
            else if (key === 'maintenanced') finalIsRequired = requireMaint;
            else if (key === 'neo') finalIsRequired = requireNeo;
          }
          if (tableName === 'airplane' && (disableModel || disableMaint || disableNeo)) {
            finalIsRequired = false;
          }
          if (key === 'person_type' && schema instanceof ZodDiscriminatedUnion) {
            finalIsRequired = true;
          }

          // ENUM
          if (core instanceof ZodEnum || core instanceof ZodLiteral) {
            const options = core instanceof ZodEnum ? core.options : core instanceof ZodLiteral ? ['Pilot', 'Passenger'] : [];
            if (core instanceof ZodLiteral && key !== 'person_type') return null;

            return (
              <FormField
                key={key}
                control={control}
                name={key as Path<z.infer<T>>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {formatKey(key)}
                      {finalIsRequired && <span className="text-red-400 ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ''}
                        onValueChange={(v) => field.onChange(v === '' ? null : v)}
                        disabled={finalIsDisabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${formatKey(key)}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((opt: string) => (
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
            );
          }

          // BOOLEAN
          if (core instanceof ZodBoolean) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as Path<z.infer<T>>}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={finalIsDisabled}
                      />
                    </FormControl>
                    <FormLabel className="flex-1 pt-1">
                      {formatKey(key)}
                      {finalIsRequired && <span className="text-red-400 ml-1">*</span>}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }

          // NUMBER
          if (core instanceof ZodNumber) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as Path<z.infer<T>>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {formatKey(key)}
                      {finalIsRequired && <span className="text-red-400 ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const numValue = e.target.value === '' ? undefined : Number(e.target.value);
                          field.onChange(isNaN(numValue as number) ? field.value : numValue);
                        }}
                        disabled={finalIsDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }

          // STRING
          if (core instanceof ZodString) {
            return (
              <FormField
                key={key}
                control={control}
                name={key as Path<z.infer<T>>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {formatKey(key)}
                      {finalIsRequired && <span className="text-red-400 ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        disabled={finalIsDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }
          return null;
        })}

        <Button type="submit" disabled={loading} className="w-full" onClick={() => console.log("form errors:", errors)}>
          {loading ? <Spinner className="h-4 w-4 animate-spin" /> : buttonText}
        </Button>
      </form>
    </Form>
  );
}