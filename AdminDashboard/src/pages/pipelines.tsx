import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"; 
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { CreatePipelineDialog } from "@/components/Pipelines/CreatePipelineDialog";



export default function Pipelines(){
    const [, setSearchTerm] = useState<string>('');
    
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
            <div className="flex flex-n sm:ml-auto gap-4">
              <CreatePipelineDialog/>
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
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

        </div>
      </div>
      <div className=" flex flex-row justify-center items-center border-t">
      </div>
    </div>
    )
   
}
