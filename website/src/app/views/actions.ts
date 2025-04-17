import { tableNameToRoute } from "@/lib/routes";

export async function getViewNames(): Promise<string[]> {
  try {
    // Make a GET request to the API endpoint
    const response = await fetch('http://127.0.0.1:5000/views');

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

export async function getViewData(viewName: string): Promise<any[]> {
  try {
    const route = tableNameToRoute[viewName]

    if (!route) {
      throw new Error(`No route defined for view: ${viewName}`)
    }

    const res = await fetch(`http://127.0.0.1:5000/views/${route}`, { cache: 'no-store' }) // Or 'force-cache' if you want caching
    if (!res.ok) {
      throw new Error(`Failed to fetch data for ${viewName}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Re-throw to allow the caller to handle the error
  }
}