'use server';

import { tableNameToRoute } from "@/lib/routes";
import { idsFor } from "../utils/ids";
import { SchemaFor, TableName } from "../utils/types";

export async function getTableNames(): Promise<string[]> {
  try {
    // Make a GET request to the API endpoint
    const response = await fetch('http://127.0.0.1:5000/tables');

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response
    const data: string[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching table names:', error);
    throw error; // Re-throw to allow the caller to handle the error
  }
}

export async function getTableData(tableName: string): Promise<any[]> {
  try {
    const route = tableNameToRoute[tableName]

    if (!route) {
      throw new Error(`No route defined for table: ${tableName}`)
    }

    const res = await fetch(`http://127.0.0.1:5000${route}`, { cache: 'no-store' }) // Or 'force-cache' if you want caching
    if (!res.ok) {
      throw new Error(`Failed to fetch data for ${tableName}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Re-throw to allow the caller to handle the error
  }
}

export async function deleteTableRow(tableName: string, identifier: Record<string, string>) {
  try {
    const route = tableNameToRoute[tableName];

    if (!route) {
      throw new Error(`No route defined for table: ${tableName}`);
    }

    let endpoint: string;
    if (Object.keys(identifier).length === 1) {
      const key = Object.keys(identifier)[0];
      endpoint = `${route}/${identifier[key]}`;
    } else if (Object.keys(identifier).length > 1) {
      const values = Object.values(identifier);
      endpoint = `${route}/${values.join('/')}`;
    } else {
      throw new Error('Invalid identifier');
    }

    const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      console.log(result.error)
      throw new Error(result.error);
    }

    return result;
  } catch (error: any) {
    console.error('Error deleting row:', error?.message || error);
    throw error;
  }
}

export async function createTableRow(tableName: string, data: SchemaFor<TableName>) {
  try {
    const route = tableNameToRoute[tableName];

    if (!route) {
      throw new Error(`No route defined for table: ${tableName}`);
    }

    const idKeys = idsFor[tableName as keyof typeof idsFor];
    const identifier = idKeys?.reduce((acc, key) => {
      acc[key] = (data as any)[key];
      return acc;
    }, {} as Record<string, string>);

    let endpoint = route;
    if (identifier && Object.keys(identifier).length > 0) {
      const values = Object.values(identifier);
      endpoint = `${route}/${values.join('/')}`;
    }

    const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(result.error);
      throw new Error(result.error);
    }

    return result;
  } catch (error: any) {
    console.error('Error creating row:', error?.message || error);
    throw error;
  }
}
