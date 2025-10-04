import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import { useAuth,UserButton,SignOutButton } from "@clerk/clerk-react";

import { SidebarProvider,SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Authenticated(){

    const {isLoaded,isSignedIn} = useAuth();
    const navigate = useNavigate();

    
    useEffect(()=>{
            if(!isSignedIn && isLoaded){
            navigate('/')
            }
    })
    
    return(
        <div className="h-full bg-white" >
            <SidebarProvider>
            <AppSidebar />
            <main className="m-4">
                <SidebarTrigger className="text-foreground"/>
                <Outlet />
            </main>
            </SidebarProvider>
            
        </div>
       
    )
}
