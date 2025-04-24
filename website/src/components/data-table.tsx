import { ViewName, ViewSchemaFor } from "@/app/views/types"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableName, TableSchemaFor } from "../app/crud/utils/types"
import ActionsDropdown from "./actions-dropdown"
import { z, ZodEffects, ZodObject } from "zod"

type ObjectSchema = ZodObject<any> | ZodEffects<ZodObject<any>>


type DataTableProps<T extends ObjectSchema> = {
  activeTab: TableName;
  data: TableSchemaFor<TableName>[] | ViewSchemaFor<ViewName>[];
  actionsEnabled: boolean
  onDelete?: (identifiers: Record<string, string>) => void;
  onEdit: (data: z.infer<T>) => void
}

export default function DataTable<T extends ObjectSchema>({ data, activeTab, onDelete, actionsEnabled, onEdit }: DataTableProps<T>) {
  return (
    <Table>
      <TableCaption>{`${(data ?? []).length} records`}</TableCaption>
      <TableHeader>
        {data.length > 0 && (
          <TableRow>
            {Object.keys(data[0]).map((key) => (
              <TableHead key={key.toLowerCase()}>
                {key.includes('_')
                  ? key
                    .toLowerCase()
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
                  : key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
              </TableHead>
            ))}
            {actionsEnabled && <TableHead>Actions</TableHead>}
          </TableRow>
        )}
      </TableHeader>

      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-6 text-gray-500">
              No data found
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {Object.entries(row).map(([key, value]) => {
                const lowerKey = key.toLowerCase();
                return (
                  <TableCell key={lowerKey}>
                    {typeof value === 'object' && value !== null
                      ? JSON.stringify(value)
                      : String(value)}
                  </TableCell>
                );
              })}
              {(actionsEnabled && onDelete) && <TableCell>
                  <ActionsDropdown 
                    row={row as TableSchemaFor<TableName>}
                    activeTab={activeTab}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
              </TableCell>}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
