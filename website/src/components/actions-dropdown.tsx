import DeleteDialog from "@/app/crud/components/delete-dialog";
import { idsFor } from "@/app/crud/utils/ids";
import { TableName, TableSchemaFor, tableSchemaMap } from "@/app/crud/utils/types";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import AttributesDialog from "./attributes-dialog";
import { z, ZodEffects, ZodObject } from "zod";

type ObjectSchema = ZodObject<any> | ZodEffects<ZodObject<any>>

interface ActionDropdownProps<T extends ObjectSchema> {
  activeTab: TableName;
  row: TableSchemaFor<TableName>
  onDelete: (identifiers: Record<string, string>) => void;
  onEdit: (data: z.infer<T>) => void
}

export default function ActionsDropdown<T extends ObjectSchema>({ activeTab, row, onDelete, onEdit }: ActionDropdownProps<T>) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() =>
            navigator.clipboard.writeText(Object.values(row).join(', '))
          }
        >
          Copy
        </DropdownMenuItem>
        <AttributesDialog
          defaultValues={row}
          schema={tableSchemaMap[activeTab] as unknown as T}
          tableName={activeTab}
          loading={false}
          onSubmit={onEdit}
          trigger={<DropdownMenuItem >Edit</DropdownMenuItem>}
          buttonText="Save"
        />
        <DropdownMenuSeparator />
        <DeleteDialog
          onConfirm={() => {
            const identifiers = 
              Object.fromEntries(
                idsFor[activeTab]
                  .map(identif => [identif, row[identif as keyof typeof row]])
              )
            onDelete(identifiers)
            setDropdownOpen(false)
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}