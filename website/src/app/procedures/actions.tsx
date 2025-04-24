import { ProcedureName, ProcedureSchemaFor } from "./types";

export async function getProcedureNames() {
  try {
    const response = await fetch('http://127.0.0.1:5000/procedures');

    if (!response.ok) {
      throw new Error(`Failed to fetch procedures: ${response.status} ${response.statusText}`);
    }

    const data: string[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching procedures names:', error);
    throw error;
  }
}

export async function runProcedure(procedureName: ProcedureName, params: ProcedureSchemaFor<ProcedureName>) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/procedures/${procedureName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error(result.error);
      throw new Error(result.error);
    }
    
    return result;
  } catch (error: any) {
    console.error('Error running procedures:', error?.message || error);
    throw error;
  }
}