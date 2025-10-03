import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from 'react';

import { useAuth,UserButton,SignOutButton } from "@clerk/clerk-react";

export default function SignedInLayout(){

    const {isLoaded,isSignedIn} = useAuth();
    const navigate = useNavigate();

    
    useEffect(()=>{
            if(!isSignedIn && isLoaded){
            navigate('/')
            }
    })
    
    return(<>
        <div>
            Dashboard
            
        </div>
        <UserButton/>
        <SignOutButton/>
        <Outlet/>
    </>)
}
