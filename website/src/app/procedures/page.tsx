'use client'
import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProcedureNames, runProcedure } from './actions';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProcedureName, ProcedureSchemaFor, procedureSchemaMap } from './types';
import AttributesForm from '../../components/attributes-form';

type Procedure = {
  id: string;
  name: string;
}

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureName | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [isFetchingProcedures, setIsFetchingProcedures] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProcedures = async () => {
      if (!isSelectOpen || procedures.length > 0) return;

      setIsFetchingProcedures(true);
      try {
        const response = await getProcedureNames();

        if (isMounted) {
          setProcedures(response.map((procedureName) => ({
            id: procedureName,
            name: procedureName,
          })));
        }
      } catch (error) {
        console.error('Error fetching procedures:', error);
        toast.error("Failed to load procedures");
      } finally {
        if (isMounted) {
          setIsFetchingProcedures(false);
        }
      }
    };

    fetchProcedures();

    return () => {
      isMounted = false;
    };
  }, [isSelectOpen]);

  const memoizedProcedures = useMemo(() => {
    return [...procedures].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }, [procedures]);

  const runOperation = async (data: ProcedureSchemaFor<ProcedureName>) => {
    if (!selectedProcedure) {
      toast.error("No Procedure Selected", {
        description: "Please select a procedure to run.",
      });
      return;
    }

    console.log(data)

    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await runProcedure(selectedProcedure, data);
      setStatus('success');
    } catch (error) {
      console.error('Error running procedure:', error);
      toast.error("Failed to run procedure");
      setStatus('error')
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false)
    }
  };


  return (
    <div className='w-full h-full flex items-center justify-center mt-[-30px]'>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Run Database Procedure</CardTitle>
          <CardDescription>
            Select and execute a stored procedure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Procedure</label>
            <Select
              value={selectedProcedure ?? undefined}
              onValueChange={e => setSelectedProcedure(e as ProcedureName)}
              disabled={isLoading}
              onOpenChange={setIsSelectOpen}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a procedure" />
              </SelectTrigger>
              <SelectContent side='bottom'>
                {isFetchingProcedures ? (
                  <div className="flex items-center justify-center py-2">
                    <Spinner className="h-4 w-4 animate-spin mr-2" />
                    Loading procedures...
                  </div>
                ) : memoizedProcedures.length > 0 ? (
                  memoizedProcedures.map((procedure) => (
                    <SelectItem key={procedure.id} value={procedure.id}>
                      {procedure.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    No procedures found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center pt-4">
            <Dialog 
              open={isDialogOpen} 
              onOpenChange={(open) => {
                if ((selectedProcedure && selectedProcedure !== 'simulation_cycle')) {
                  setIsDialogOpen(open)
                } else {
                  setIsDialogOpen(false)
                }
              }}
            >
              <DialogTrigger 
                className='w-full' 
                disabled={isLoading || !selectedProcedure} 
                onClick={() => {
                  if (!(selectedProcedure && selectedProcedure !== 'simulation_cycle')) {
                    runOperation({})
                  }
                }}
                asChild
              >
                <Button
                  size="lg"
                  disabled={isLoading || !selectedProcedure}
                  className="w-full"
                >
                  {(selectedProcedure && selectedProcedure !== 'simulation_cycle') ? 'Confirm Selection' : 'Run Procedure'}
                </Button>
              </DialogTrigger>
              <DialogContent className='h-auto overflow-y-scroll' style={{ maxHeight: '90vh', overflowY: 'scroll' }}>
                <DialogTitle>Enter procedure parameters</DialogTitle>
                <DialogDescription>{'Fill in the following field(s)'}</DialogDescription>
                {(selectedProcedure && selectedProcedure !== 'simulation_cycle') 
                  && <AttributesForm
                    schema={procedureSchemaMap[selectedProcedure]}
                    defaultValues={{}}
                    loading={isLoading}
                    onSubmit={runOperation}
                    buttonText='Run Procedure'
                />}
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === 'success' && (
            <div className="flex items-center text-green-500">
              <CheckCircle className="mr-2 h-5 w-5" />
              Procedure executed successfully
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center text-red-500">
              <AlertCircle className="mr-2 h-5 w-5" />
              Procedure execution failed
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}