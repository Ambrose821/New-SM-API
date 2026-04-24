import type { FormEvent } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

import PipelineForm from "./Forms/PipelineForm"
import type { Pipeline } from "@/types"

import { toast } from "sonner"
import { createPipeline } from "@/util/api/pipeline"

const defaultPipelineForm = {
    name: "",
    description: "",
    source: "",
    source_url: "",
    genre: [""],
    frequency: "",
    backgroundImageSource: "",
    foregroundImageSource: "",
    llm: "",
    isActive: null,
  
} as Pipeline
export function CreatePipelineDialog() {

  const [pipelineFormData, setPipelinFormData] = useState<Pipeline>(defaultPipelineForm)
  const [open, setOpen] = useState<boolean>(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try{
      await createPipeline(pipelineFormData)
      toast("Successfully created pipeline")
      setOpen(false)
      setPipelinFormData(defaultPipelineForm)
    }catch(error){
      toast("Error creating pipeline")
    }
  }
   
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Pipeline</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-4xl">
        <form onSubmit={handleSubmit}>
            <PipelineForm pipelineData={pipelineFormData} onChange={setPipelinFormData}/>
            <Button type="submit">Create Pipeline</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
