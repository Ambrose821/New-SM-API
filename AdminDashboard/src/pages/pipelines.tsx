import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"; 
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
// import { CreatePipelineDialog } from "@/components/Pipelines/CreatePipelineDialog";
import { PipelineCard } from "@/components/Pipelines/PipelineCard";
import type { Pipeline } from "@/types";
import { getPipelines, deletePipelines } from "@/util/api/pipeline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { CreatePipelineDialog } from "@/components/Pipelines/CreatePipelineDialog";

export default function Pipelines(){
    const [, setSearchTerm] = useState<string>('');
    const [pipelines, setPipelines] = useState<Pipeline[]>([])
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [selectedPipelineIds,setSelectedPipelineIds] = useState<Set<string>>(new Set())
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false)


    const fetchPipelines = async () => {
        try {
          const pipelines = await getPipelines()
          setPipelines(pipelines)
        }catch(error: any){
          console.error("Error fetching pipelines" + error)
        }
      }
    useEffect(() =>{
      fetchPipelines()
    }, [])

    const handlePipelineSelection = (pipelineId: string, checked: boolean) => {

     setSelectedPipelineIds((prevSelections) => {
      const nextSelection = new Set(prevSelections)
      if(checked){
        nextSelection.add(pipelineId)
      }else{
        nextSelection.delete(pipelineId)
      }
      return nextSelection
     })
    }


    const handleOpenDeleteDialog = () => {
      setIsConfirmingDelete(true)
    }

    const handleCloseDeleteConfirmDialog = (open: boolean) => {
      setIsConfirmingDelete(open)
    }

    const handleConfirmDeletePipelines = async () => {
      if (!isDeleting) {
        return
      }

      const result = await deletePipelines(Array.from(selectedPipelineIds))
      if(result){
        toast("Pipelines Deleted")
      }
      else{
        toast("Error Deleting Pipelines")
      }

      setSelectedPipelineIds(new Set())
      setIsDeleting(false)
      setIsConfirmingDelete(false)
      fetchPipelines()
    }


    return (
      <div className="h-full grid grid-rows-[auto_1fr_auto]">
      
      <div className="sticky top-0 bg-white/80 border-b">
        
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
  
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         
            <div className="relative w-full sm:max-w-xl">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </span>
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg py-2.5 pl-10 pr-3 outline-none "
                type="text"
                placeholder="Search Pipelines"
              />
            </div>
            <div className="flex sm:ml-auto gap-4">
            
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="inline-flex items-center gap-2 border border-gray-">
                    Social Account <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-72 overflow-auto">

                    <DropdownMenuCheckboxItem
                      key={null/* TODO Add Multiple account options*/}
                      className="capitalize"
                      checked={true /* TODO Add Multiple account options*/} 
                    >
                      All Accounts
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <CreatePipelineDialog/>
               <Button 
                  className="bg-red-100 text-red-500 hover:text-white hover:bg-red-500"
                  onClick={()=>{setIsDeleting(!isDeleting)}}
                >
                  { isDeleting ? <span>Cancel</span> : <Trash/> }
                </Button>
            </div>
          </div>
           {isDeleting && 
            <div className="relative mt-4 flex flex-col gap-3 rounded-lg border bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Selecting {selectedPipelineIds.size} posts for "Deletion"</p> 
              </div>

              <div className="flex flex-row gap-4 ">
              <Button
                onClick={handleOpenDeleteDialog}
                disabled={selectedPipelineIds.size === 0}
              >
               Delete
              </Button>
              </div>
            </div>
          
          }
        </div>
      </div>
      <div className="overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pipelines.map((pipeline, index) => (
              <PipelineCard
                key={`${pipeline.name}-${pipeline.source_url}-${index}`}
                pipeline={pipeline}
                showSelector={isDeleting}
                isSelected = {pipeline.id ? selectedPipelineIds.has(pipeline.id) : false}
                onSelectedChange={
                  (checked) =>{
                    if(!pipeline.id){
                      return
                    }
                    handlePipelineSelection(pipeline.id, checked)
                  }
                }

                
              />
            ))}
          </div>

          {pipelines.length === 0 && (
            <div className="flex min-h-60 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              No pipelines found.
            </div>
          )}

        </div>
      </div>
      <div className=" flex flex-row justify-center items-center border-t">
      </div>
     <Dialog open={isConfirmingDelete} onOpenChange={handleCloseDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-sm">
           <DialogHeader>
            <DialogTitle>Delete these pipelines</DialogTitle>
            <DialogDescription>
              Are you sure you would like to delete these posts?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleCloseDeleteConfirmDialog(false)
                  }}
                >
                  No
                </Button>
                <Button 
                  className="bg-red-500 text-white"
                  type="button"
                  onClick={handleConfirmDeletePipelines}
                >
                  Yes
                </Button>
              </>
          </DialogFooter>
        </DialogContent>

      </Dialog>

    </div>
    )
   
}
