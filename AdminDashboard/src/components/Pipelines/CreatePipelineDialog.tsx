import type { FormEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

import PipelineForm from "./Forms/PipelineForm"

export function CreatePipelineDialog() {



  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Pipeline</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-4xl">
        <form onSubmit={handleSubmit}>
            <PipelineForm/>
        </form>
      </DialogContent>
    </Dialog>
  )
}
