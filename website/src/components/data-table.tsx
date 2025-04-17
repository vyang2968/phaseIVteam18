import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import DeleteDialog from "../app/crud/components/delete-dialog"
import { Airline, Airplane, TableSchemaFor, TableName } from "../app/crud/utils/types"
import { ViewName, ViewSchemaFor } from "@/app/views/types"


type DataTableProps = {
  activeTab: string;
  data: TableSchemaFor<TableName>[] | ViewSchemaFor<ViewName>[];
  actionsEnabled: boolean
  onDelete?: (identifiers: Record<string, string>) => void;
}

export default function DataTable({ data, activeTab, onDelete, actionsEnabled }: DataTableProps) {

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
                <DropdownMenu>
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
                    <DropdownMenuItem

                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DeleteDialog
                      onConfirm={() => {
                        let identifiers: Record<string, string>
                        switch (activeTab) {
                          case 'airline':
                            identifiers = {
                              airlineid: (row as Airline).airlineid
                            }
                            console.log(identifiers)
                            break;
                          case 'airplane':
                            identifiers = {
                              airlineid: (row as Airplane).airlineid,
                              tail_num: (row as Airplane).tail_num
                            }
                            break;
                          default:
                            identifiers = {}
                            break;
                        }
                        onDelete(identifiers)
                      }}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
