import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import DeleteDialog from "@/app/crud/components/delete-dialog";
import { Airline, Airplane, TableName, TableSchemaFor, tableSchemaMap } from "@/app/crud/utils/types";
import { useState } from "react";
import EditDialog from "@/app/crud/components/edit-dialog";
import { idsFor } from "@/app/crud/utils/ids";

interface ActionDropdownProps {
  activeTab: TableName;
  row: TableSchemaFor<TableName>
  onDelete: (identifiers: Record<string, string>) => void;
}

export default function ActionsDropdown({ activeTab, row, onDelete }: ActionDropdownProps) {
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
        <EditDialog 
          row={row}
          tableName={activeTab}
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