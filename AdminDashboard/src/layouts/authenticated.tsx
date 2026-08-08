import { Outlet } from "react-router-dom";
import { SidebarProvider,SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TargetSocialProvider } from "@/providers/TargetSocialProvider";
import { MediaApiStateProvider } from "@/providers/MediaApiStateProvider";

export default function Authenticated(){
    return(
        <div className="min-h-dvh bg-white flex" >
            <SidebarProvider>
            <AppSidebar />
            <MediaApiStateProvider>
                <TargetSocialProvider>
                
                <main className="flex-1 min-h-dvh overlow-hidden">
                    <div className="p-4">
                    <SidebarTrigger className="text-foreground"/>
                    </div>
                    <div className="h-[calc(100dvh-4rem)] overflow-hidden">
                    <Outlet />
                    </div>
                </main>
                </TargetSocialProvider>
            </MediaApiStateProvider>
            </SidebarProvider>
            
        </div>
       
    )
}
