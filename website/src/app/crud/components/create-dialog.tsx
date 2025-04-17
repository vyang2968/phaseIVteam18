'use client'

import { z, ZodEffects, ZodObject, ZodRawShape } from 'zod'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateForm from './create-form'

interface CreateDialogProps<T extends ZodObject<any> | ZodEffects<ZodObject<any>>> {
  tableName: string
  schema: T
  defaultValues?: Partial<z.infer<T>>
  loading: boolean
  onSubmit: (data: z.infer<T>) => void
}

export default function CreateDialog<T extends ZodObject<any> | ZodEffects<ZodObject<any>>>({
  tableName,
  schema,
  loading,
  defaultValues,
  onSubmit,
}: CreateDialogProps<T>) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create
        </Button>
      </DialogTrigger>

      <DialogContent className='h-auto overflow-y-scroll'  style={{ maxHeight: '90vh', overflowY: 'scroll' }}>
        <DialogTitle>Create a new {tableName}</DialogTitle>
        <DialogDescription>
          Fill in the fields to make a new {tableName}
        </DialogDescription>

        <CreateForm
          schema={schema}
          loading={loading}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
