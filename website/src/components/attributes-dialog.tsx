import { TableName } from '@/app/crud/utils/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cloneElement, useState } from 'react'
import { z, ZodEffects, ZodObject } from 'zod'
import AttributesForm from './attributes-form'

type ObjectSchema = ZodObject<any> | ZodEffects<ZodObject<any>>

type TriggerElement = React.ReactElement<{
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
}>

export interface AttributesDialogProps<T extends ObjectSchema> {
  tableName: TableName
  schema: T
  defaultValues?: Partial<z.infer<T>>
  loading: boolean
  onSubmit: (data: z.infer<T>) => void
  trigger: TriggerElement
  buttonText: string
}

export default function AttributesDialog<T extends ObjectSchema>({
  tableName,
  schema,
  defaultValues,
  loading,
  onSubmit,
  trigger,
  buttonText
}: AttributesDialogProps<T>) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (data: z.infer<T>) => {
    onSubmit(data)
    if (!loading) setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {cloneElement(trigger, {
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (trigger.props.onClick) {
              trigger.props.onClick(e);
            }
            setIsOpen(true);
          }
        })}
      </DialogTrigger>

      <DialogContent
        className="h-auto overflow-y-scroll"
        style={{ maxHeight: '90vh' }}
      >
        <DialogTitle>Create a new {tableName}</DialogTitle>
        <DialogDescription>
          Fill in the fields to make a new {tableName}. Leave blank for null.
        </DialogDescription>

        <AttributesForm
          schema={schema}
          loading={loading}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          buttonText={buttonText}
          tableName={tableName}
        />
      </DialogContent>
    </Dialog>
  )
}
