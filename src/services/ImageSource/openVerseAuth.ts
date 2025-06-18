import axios from "axios";
import qs from "qs"
import cron from "node-cron";



/*
*This class acts as a singleton which is in charge of fetching and refreshing the openverse API token
* The following environment variables are required: 
*OPENVERSE_ID
*OPENVERSE_SECRET
*  For more details see the Openverse API spec https://api.openverse.org/v1/#tag/images/operation/images_search
*/

export class OpenverseTokenHandler{

    private currentAccessToken :string ="";
    private static instance: OpenverseTokenHandler | null = null;
    private constructor(){
    }
    
    public static getInstance(){
        if(this.instance === null){
            return new OpenverseTokenHandler();
        }else{
            return this.instance
        }
    }

    public setCurrentAccessToken(newToken: string){
        this.currentAccessToken = newToken
    }

    public async getCurrentAccessToken(){
        if(!this.currentAccessToken){
           const token= await this.requestAndSetToken()
           return token

        }
        return this.currentAccessToken;
    }

    public async requestNewToken(){

        try{
            const response = await axios.post("https://api.openverse.org/v1/auth_tokens/token/",qs.stringify({
                grant_type:'client_credentials',
                client_id:process.env.OPENVERSE_ID,
                client_secret: process.env.OPENVERSE_SECRET
            }),{
                headers:{
                    'Content-Type':"application/x-www-form-urlencoded"
                }
            })

            const token = response.data.access_token;
            return token;
            
        }catch(error:any){
             throw new Error("Error in requestNewToken() : " + error +"\n")

        }
    }

    public async requestAndSetToken(){
        try{
            const token = await this.requestNewToken();
            this.setCurrentAccessToken(token);
            return token;
        }catch(error){
            throw new Error("Error in request and setToken")
            
        }
    }
    public scheduleTokenRefresh(){
        //Runs every 11hours
        cron.schedule('0 */11 * * *', async () => {
        console.log('Refreshing Openverse token...');
         await this.requestAndSetToken()
        });
    }

}