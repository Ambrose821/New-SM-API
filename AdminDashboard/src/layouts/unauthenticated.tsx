import { SignIn } from '@clerk/clerk-react';



export default function UnAuthenticated(){  
    return(
    <>
     <div className='w-screen h-screen items-center flex justify-center bg-linear-to-br from-black-500 to-slate-800 overflow-hidden'>
            <SignIn/>
     </div>
    </>
    );

}