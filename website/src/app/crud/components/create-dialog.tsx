'use client'

import { z, ZodEffects, ZodObject, ZodRawShape } from 'zod'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateForm from './create-form'
import { useState } from 'react'

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
  const [isOpen, setIsOpen] = useState(false)

  const handleDialogClose = () => {
    setIsOpen(false)
  }

  const handleDialogOpen = () => {
    setIsOpen(true)
  }

  // Handle the onSubmit function to close the dialog once loading is done
  const handleSubmit = (data: z.infer<T>) => {
    onSubmit(data)
    if (!loading) {
      handleDialogClose()
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
