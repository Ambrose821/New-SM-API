import { useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router"
import { connectInstagramAccount } from "@/util/api/socials"
// import { connectInstagramAccount } from "@/util/api/socials"

export default function InstagramRedirect(){
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const isExchanging = useRef<boolean>(false);

    useEffect(()=>{
        const connectInstagram = async () => {
               
            //TODO Use searchParams.get('state') -> {'state': value, 'env': value}
            // use the action to decide different behaviour. Normally this is always signin and we dont have a signup action or reason for it
            // but there may be some day
            if(isExchanging.current) return; // block duplicate calls
            isExchanging.current = true;

            const code = searchParams.get('code')
            if(!code){
                //TODO Navigate to socials page with error = true and a toast or something. will mess around
                navigate('/dashboard')
            }

           try{
             await connectInstagramAccount(code!)
             navigate('/dashboard/socials')
           } catch (error){
            console.log(error)
            navigate('/dashboard')
           }
        }
        connectInstagram()
    },[])
    return(
            <div className=" relative h-full flex justify-center items-center">
                <div>Connecting your Instagram Account</div>
                <div className=" absolute bg-transparent w-10 h-10 border-4 mb-40 border-t-black animate-spin rounded-full">
                </div>
            </div>

    )
}