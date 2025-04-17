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
import DataTable from '../../components/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import TableSkeleton from '../../components/data-table-skeleton'
import { toast } from "sonner"
import { getViewData, getViewNames } from './actions'
import { ViewName, ViewSchemaFor } from './types'

export default function Page() {
  const [tableNames, setTableNames] = useState<string[] | null>(null)
  const [activeTab, setActiveTab] = useState<ViewName | null>(null)
  const [tableDataMap, setTableDataMap] = useState<
    Partial<Record<ViewName, ViewSchemaFor<ViewName>[]>>
  >({})
  const [tabLoading, setTabLoading] = useState(false)
  const [error, setError] = useState('')

  // 1) Fetch table names
  useEffect(() => {
    const fetchNames = async () => {
      setTabLoading(true)
      try {
        const names = (await getViewNames())
        setTableNames(names)
        if (names.length > 0) {
          setActiveTab(names[0] as ViewName)
        }
      } catch (err) {
        console.error(err)
        setError('Failed to fetch view names')
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
        const data = await getViewData(activeTab);
        const normalizedData = (data as any[]).map(normalizeKeysToLowercase);

        setTableDataMap(prev => ({
          ...prev,
          [activeTab]: normalizedData as ViewSchemaFor<typeof activeTab>[],
        }));
      } catch (err) {
        console.error(`Failed to fetch data for ${activeTab}`, err);
      } finally {
        setTabLoading(false);
      }
    };

    fetchData();
  }, [activeTab, tableDataMap]);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className='w-full flex justify-between items-center'>
            <div className='space-y-1'>
              <CardTitle>View Dashboard</CardTitle>
              <CardDescription>View specialized data from your database</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab ?? undefined} onValueChange={tab => setActiveTab(tab as ViewName)}>
            <TabsList className="w-full h-max">
              <div className='w-full h-max py-1 flex gap-2 overflow-x-auto'>
                {tabLoading || !tableNames
                  ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-32 rounded-md" />
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
                      activeTab={name}
                      data={tableDataMap[name as ViewName] ?? []}
                      actionsEnabled={false}
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
