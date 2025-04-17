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
import { DataType } from '../utils/types'
import DeleteDialog from "../components/delete-dialog"


type DataTableProps = {
  caption: string;
  data: DataType[];
  onDelete?: (id: string) => void;
}

export default function DataTable({ caption, data, onDelete }: DataTableProps) {
  return (
    <Table>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        {data.length > 0 && (
          <TableRow>
            {Object.keys(data[0]).map((key) => (
              <TableHead key={key}>
                {key.includes('_')
                  ? key
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
                  : key.charAt(0).toUpperCase() + key.slice(1)}
              </TableHead>
            ))}
            <TableHead>Actions</TableHead>
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
              {Object.keys(row).map((key) => (
                <TableCell key={key}>
                  {(() => {
                    const value = row[key as keyof typeof row];
                    return typeof value === 'object' && value !== null
                      ? JSON.stringify(value)
                      : String(value);
                  })()}
                </TableCell>
              ))}
              <TableCell>
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
                      <DeleteDialog onConfirm={() => console.log("confim")}/>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
