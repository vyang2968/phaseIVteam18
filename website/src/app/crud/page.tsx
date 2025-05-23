'use client'

import { createContext, useEffect, useState } from 'react'
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
import { getTableNames, getTableData, deleteTableRow, createTableRow, updateTableRow } from './actions'
import DataTable from '../../components/data-table'
import { TableSchemaFor, tableSchemaMap, TableName } from './utils/types'
import { Skeleton } from '@/components/ui/skeleton'
import TableSkeleton from '../../components/data-table-skeleton'
import { toast } from "sonner"
import AttributesDialog from '../../components/attributes-dialog'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'


export const CreateEditContext =
  createContext<{
    schema: z.ZodObject<any> | z.ZodEffects<z.ZodObject<any>>
    loading: {
      action: 'delete' | 'create' | 'edit'
      loading: boolean
    } | null
  } | null>(null)

export default function Page() {
  const [tableNames, setTableNames] = useState<TableName[] | null>(null)
  const [activeTab, setActiveTab] = useState<TableName | null>(null)
  const [tableDataMap, setTableDataMap] = useState<
    Partial<Record<TableName, TableSchemaFor<TableName>[]>>
  >({})
  const [actionLoading, setActionLoading] = useState<{ action: 'delete' | 'create' | 'edit', loading: boolean } | null>(null)
  const [tabLoading, setTabLoading] = useState(false)
  const [error, setError] = useState('')

  const normalizeKeysToLowercase = (obj: Record<string, any>): Record<string, any> =>
    Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.toLowerCase(),
        value && typeof value === 'object' && !Array.isArray(value)
          ? normalizeKeysToLowercase(value)
          : value,
      ])
    );

  useEffect(() => {
    const fetchNames = async () => {
      setTabLoading(true)
      try {
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

  useEffect(() => {
    if (!activeTab) return;

    if (tableDataMap[activeTab]) return;

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


  const handleDelete = async (identifiers: Record<string, string>) => {
    if (!activeTab) return

    setActionLoading({ action: 'delete', loading: true })
    try {
      if (!activeTab) {
        throw new Error("No table present")
      }

      await deleteTableRow(activeTab, identifiers)
      const fresh = await getTableData(activeTab)
      const normalizedData = (fresh as any[]).map(normalizeKeysToLowercase);
      setTableDataMap(prev => ({ ...prev, [activeTab]: normalizedData as TableSchemaFor<typeof activeTab>[] }))
      toast.success(`Row deleted from ${activeTab}`)
    } catch (err: any) {
      toast.error(`Error deleting row`, {
        description: err.message ?? "Something went wrong",
      })
    } finally {
      setActionLoading({ action: 'delete', loading: false })
    }
  }

  const handleCreate = async (data: TableSchemaFor<TableName>) => {
    if (!activeTab) return

    setActionLoading({ action: "create", loading: true })

    try {
      if (!activeTab) {
        throw new Error("No table present")
      }

      await createTableRow(activeTab, data)
      const fresh = await getTableData(activeTab)
      const normalizedData = (fresh as any[]).map(normalizeKeysToLowercase);
      setTableDataMap(prev => ({ ...prev, [activeTab]: normalizedData as TableSchemaFor<typeof activeTab>[] }))
      toast.success(`Row created in ${activeTab}`)
    } catch (err: any) {
      toast.error(`Error creating row`, {
        description: err.message ?? "Something went wrong",
      })
    } finally {
      setActionLoading({ action: 'create', loading: false })
    }
  }

  const handleEdit = async (data: TableSchemaFor<TableName>) => {
    if (!activeTab) return

    setActionLoading({ action: "edit", loading: true })

    try {
      await updateTableRow(activeTab, data)
      const fresh = await getTableData(activeTab)
      const normalizedData = (fresh as any[]).map(normalizeKeysToLowercase);
      setTableDataMap(prev => ({ ...prev, [activeTab]: normalizedData as TableSchemaFor<typeof activeTab>[] }))
      toast.success(`Row edited in ${activeTab}`)
    } catch (err: any) {
      toast.error(`Error editing row`, {
        description: err.message ?? "Something went wrong",
      })
    } finally {
      setActionLoading({ action: 'edit', loading: false })
    }
  }

  return (
    <CreateEditContext.Provider
      value={activeTab ? {
        schema: tableSchemaMap[activeTab],
        loading: actionLoading
      } : null}
    >
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <div className='w-full flex justify-between items-center'>
              <div className='space-y-1'>
                <CardTitle>CRUD Dashboard</CardTitle>
                <CardDescription>Create, read, update, and delete data from your database</CardDescription>
              </div>

              {activeTab && (
                <AttributesDialog
                  loading={actionLoading?.action == 'create' ? actionLoading.loading : false}
                  tableName={activeTab}
                  schema={tableSchemaMap[activeTab]}
                  onSubmit={handleCreate}
                  trigger={
                    <Button>
                      <Plus className="mr-1 h-4 w-4" />
                      Create
                    </Button>
                  }
                  buttonText='Create'
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
                        onEdit={(data) => handleEdit(data as TableSchemaFor<TableName>)}
                      />
                    </TabsContent>
                  ))
                }
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </CreateEditContext.Provider>
  )
}
