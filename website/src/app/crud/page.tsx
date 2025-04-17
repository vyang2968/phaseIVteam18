'use client'

import { useEffect, useState } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getTableNames, getTableData, deleteTableRow, createTableRow } from './_actions/actions'
import DataTable from '../../components/data-table'
import { TableSchemaFor, tableSchemaMap, TableName } from './utils/types'
import { Skeleton } from '@/components/ui/skeleton'
import TableSkeleton from '../../components/data-table-skeleton'
import { toast } from "sonner"
import CreateDialog from './components/create-dialog'

export default function Page() {
  const [tableNames, setTableNames] = useState<TableName[] | null>(null)
  const [activeTab, setActiveTab] = useState<TableName | null>(null)
  const [tableDataMap, setTableDataMap] = useState<
    Partial<Record<TableName, TableSchemaFor<TableName>[]>>
  >({})
  const [actionLoading, setActionLoading] = useState<{ action: 'delete' | 'create' | 'edit', loading: boolean} | null>(null)
  const [tabLoading, setTabLoading] = useState(false)
  const [error, setError] = useState('')

  // 1) Fetch table names
  useEffect(() => {
    const fetchNames = async () => {
      setTabLoading(true)
      try {
        // getTableNames returns string[], but we know they line up with TableName
        const names = (await getTableNames()) as TableName[]
        setTableNames(names)
        if (names.length > 0) {
          setActiveTab(names[0])
        }
      } catch (err) {
        console.error(err)
        setError('Failed to fetch table names')
      } finally {
        setTabLoading(false)
      }
    }
    fetchNames()
  }, [])

  // 2) Fetch data when activeTab changes
  useEffect(() => {
    if (!activeTab) return;
  
    if (tableDataMap[activeTab]) return;
  
    const normalizeKeysToLowercase = (obj: Record<string, any>): Record<string, any> =>
      Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key.toLowerCase(),
          value && typeof value === 'object' && !Array.isArray(value)
            ? normalizeKeysToLowercase(value)
            : value,
        ])
      );
  
    const fetchData = async () => {
      setTabLoading(true);
      try {
        const data = await getTableData(activeTab);
        const normalizedData = (data as any[]).map(normalizeKeysToLowercase);
  
        setTableDataMap(prev => ({
          ...prev,
          [activeTab]: normalizedData as TableSchemaFor<typeof activeTab>[],
        }));
      } catch (err) {
        console.error(`Failed to fetch data for ${activeTab}`, err);
      } finally {
        setTabLoading(false);
      }
    };
  
    fetchData();
  }, [activeTab, tableDataMap]);  
  

  // 3) Deletion handler that re-fetches current tab
  const handleDelete = async (identifiers: Record<string, string>) => {
    if (!activeTab) return

    setActionLoading({ action: 'delete', loading: true })
    try {
      if (!activeTab) {
        throw new Error("No table present")
      }

      await deleteTableRow(activeTab, identifiers)
      const fresh = await getTableData(activeTab)
      setTableDataMap(prev => ({ ...prev, [activeTab]: fresh as TableSchemaFor<typeof activeTab>[] }))
      toast.success(`Row deleted from ${activeTab}`)
    } catch (err: any) {
      toast.error(`Error deleting row`, {
        description: err.message ?? "Something went wrong",
      })
    } finally {
      setActionLoading({ action: 'delete', loading: false })
    }
  }

  const onSubmit = async (data: TableSchemaFor<TableName>) => {
    if (!activeTab) return

    console.log(data)
    
    setActionLoading({ action: "create", loading: true })
    
    try {
      if (!activeTab) {
        throw new Error("No table present")
      }

      await createTableRow(activeTab, data)
      const fresh = await getTableData(activeTab)
      setTableDataMap(prev => ({ ...prev, [activeTab]: fresh as TableSchemaFor<typeof activeTab>[] }))
      toast.success(`Row created in ${activeTab}`)
    } catch (err: any) {
      toast.error(`Error creating row`, {
        description: err.message ?? "Something went wrong",
      })
    } finally {
      setActionLoading({ action: 'create', loading: false })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className='w-full flex justify-between items-center'>
            <div className='space-y-1'>
              <CardTitle>CRUD Dashboard</CardTitle>
              <CardDescription>Create, read, update, and delete data from your database</CardDescription>
            </div>

            {activeTab && (
              <CreateDialog
                loading={actionLoading?.action == 'create' ? actionLoading.loading : false}
                tableName={activeTab}
                schema={tableSchemaMap[activeTab]}
                defaultValues={{locationid: null}}
                onSubmit={onSubmit}
              />
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab ?? undefined} onValueChange={tab => setActiveTab(tab as TableName)}>
            <TabsList className="w-full h-max">
              <div className='w-full h-max py-1 flex gap-2 overflow-x-auto'>
                {tabLoading || !tableNames
                  ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-32 rounded-md" />
                  ))
                  : tableNames.map(name => (
                    <TabsTrigger key={name} value={name}>
                      {name.replace(/(^|_)(\w)/g, (_, __, c) => ' ' + c.toUpperCase()).trim()}
                    </TabsTrigger>
                  ))
                }
              </div>
            </TabsList>

            <div className="mt-6">
              {tabLoading
                ? <TableSkeleton />
                : tableNames?.map(name => (
                  <TabsContent key={name} value={name}>
                    <DataTable
                      actionsEnabled
                      activeTab={name}
                      data={tableDataMap[name] ?? []}
                      onDelete={handleDelete}
                    />
                  </TabsContent>
                ))
              }
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
