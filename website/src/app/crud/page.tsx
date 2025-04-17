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
import { getTableNames, getTableData, deleteTableRow } from './_actions/actions' // Assume getTableData(tableName) is defined
import DataTable from './components/data-table'
import { DataType } from './utils/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import TableSkeleton from './components/data-table-skeleton'

export default function Page() {
  const [tableNames, setTableNames] = useState<string[] | null>(null)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [tableDataMap, setTableDataMap] = useState<Record<string, DataType[]>>({})
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [tabLoading, setTabLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTableNames() {
      setTabLoading(true)
      try {
        const names = await getTableNames()
        setTableNames(names)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch table names')
      }
    }

    fetchTableNames()
  }, [])

  useEffect(() => {
    if (tableNames && tableNames.length > 0) {
      setActiveTab(tableNames[1])
    }
  }, [tableNames])

  // Fetch data when active tab changes with simulated delay
  useEffect(() => {
    if (!activeTab || tableDataMap[activeTab]) return // Already fetched
    const fetchDataForTab = async () => {
      try {
        // Simulate network delay with setTimeout
        const data = await getTableData(activeTab) // Replace with actual API call
        setTableDataMap(prev => ({ ...prev, [activeTab]: data }))
      } catch (err) {
        console.error(`Failed to fetch data for ${activeTab}`, err)
      } finally {
        setTabLoading(false)
      }
    }
    fetchDataForTab()
  }, [activeTab, tableDataMap])

  const handleDelete = async () => {
    setDeleteLoading(true);

    try {
      const data = await deleteTableRow(activeTab ?? "", {});
    } catch (error) {

    }
    setDeleteLoading(false);
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className='w-full flex justify-between'>
            <div className='space-y-1'>
              <CardTitle>Data Dashboard</CardTitle>
              <CardDescription>View your data fetched from the database</CardDescription>
            </div>
            <Button>
              <Plus />
              Create
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab ?? undefined} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <div className='w-full h-full flex gap-2 overflow-x-auto no-scrollbar'>
                {/* Loading Skeleton for Tabs */}
                {tabLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-32 rounded-md" />
                  ))
                ) : (
                  tableNames?.map((value, index) => (
                    <TabsTrigger
                      key={`tab_trigger_${index}`}
                      value={value}
                      className="flex-shrink-0 px-8 py-2 whitespace-nowrap"
                    >
                      {value.includes('_')
                        ? value
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(' ')
                        : value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}
                    </TabsTrigger>
                  ))
                )}
              </div>
            </TabsList>

            <div className="mt-6">
              {tabLoading ? (
                <TableSkeleton />
              ) : (
                tableNames?.map((value, index) => (
                  <TabsContent
                    key={`tab_content_${index}`}
                    value={value}
                    className="flex-shrink-0 px-8 py-2 whitespace-nowrap"
                  >
                    <DataTable
                      caption={`${(tableDataMap[value] ?? []).length} records`}
                      data={tableDataMap[value] ?? []}
                      onDelete={() => console.log("delete")}
                    />
                  </TabsContent>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
