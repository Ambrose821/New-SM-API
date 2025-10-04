import { useNavigate } from 'react-router-dom';
import {useAuth,SignIn } from '@clerk/clerk-react';
import { useEffect } from 'react';


export default function UnAuthenticated(){
    const {isSignedIn,isLoaded} = useAuth()
    const navigate = useNavigate()


    useEffect(()=>{
        if(isSignedIn && isLoaded){
        navigate('/dashboard')
    }


    })
  
    return(
    <>
     
     <div className='w-screen h-screen items-center flex justify-center bg-gradient-to-br from-black-500 to-slate-800 overflow-hidden'>
            <SignIn/>
     </div>
        
       
    
    </>
    );

}