import { z, ZodEffects, ZodObject, ZodRawShape } from 'zod'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateForm from './create-form'
import { useState } from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TableName, TableSchemaFor } from '../utils/types'
import EditForm from './edit-form'

interface EditDialogProps {
  tableName: string,
  row: TableSchemaFor<TableName>
}

export default function EditDialog({ tableName, row }: EditDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (

    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => {
          e.preventDefault() // prevent menu from closing
          setIsOpen(true)
        }}>
          Edit
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className='h-auto overflow-y-scroll' style={{ maxHeight: '90vh', overflowY: 'scroll' }}>
        <DialogTitle>Edit {tableName}</DialogTitle>
        <DialogDescription>
          Edit any of the fields of this {tableName}
        </DialogDescription>

        <EditForm 
          onSubmit={() => console.log()}
          values={row}
        />
      </DialogContent>
    </Dialog>
  )
}