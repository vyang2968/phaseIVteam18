const tableNameToRoute: Record<string, string> = {
  airplane: "/airplanes",
}

export async function getTableNames(): Promise<string[]> {
  try {
    // Make a GET request to the API endpoint
    const response = await fetch('http://127.0.0.1:5000/tables');

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response
    const data: { tablename: string }[] = await response.json();

    return data.map(({ tablename }) => (tablename));
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
    const route = tableNameToRoute[tableName]

    if (!route) {
      throw new Error(`No route defined for table: ${tableName}`)
    }

    let endpoint: string;
    // If identifier has 1 key, use basic endpoint.
    if (Object.keys(identifier).length === 1) {
      const key = Object.keys(identifier)[0];
      const value = identifier[key];
      endpoint = `${route}/${value}`;
    }
    // If identifier has multiple keys, use composite key endpoint.
    else if (Object.keys(identifier).length > 1) {
      const values = Object.values(identifier);
      endpoint = `${route}/${values.join('/')}`;
    } else {
      throw new Error('Invalid identifier');
    }
    
    const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete the row');
    }

    return response.json(); // Return the response data if needed

  } catch (error) {
    console.error('Error deleting row:', error);
    throw error; // Re-throw to allow the caller to handle the error
  }
}
