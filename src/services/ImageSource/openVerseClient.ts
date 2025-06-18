import axios from "axios";
import { KeyObject } from "crypto";
import { todo } from "node:test";
import qs from "qs";
import { OpenverseTokenHandler } from "./openVerseAuth";


//For getting public Domain and creative commons images from the openverse API,
//See API spec here https://api.openverse.org/v1/#tag/images/operation/images_detail
export class OpenverseClient{

    public constructor(){

    }

    private generateQueryString(keywords: string[]){
        //Forcing a max of 3 search terms. Too many will likely end up in unfocused results. The AI Agent should only
        //Could a leet code problem and treat the array like a stack for any number of keywords. Would be a cool thing to code to show off but not practical lmao.

        const queryArr :string[] = []
        
        if(keywords.length ==0){
            throw new Error("\nOpenverseClient recieved no keywords\n")
        }
        if(keywords.length ==1){
            return keywords[0];
        }
        if(keywords.length>=3){
            //Triple And if we get 3
            //queryArr.push(`${keywords[0]}+${keywords[1]}+${keywords[2]}`)
            //double and combos
            queryArr.push(`${keywords[0]}+${keywords[1]}`)
            queryArr.push(`${keywords[0]}+${keywords[2]}`)
            queryArr.push(`${keywords[1]}+${keywords[2]}`)
          }
        if(keywords.length == 2){
            queryArr.push(`${keywords[0]}+${keywords[1]}`)
        }

        for(let i =0; i<keywords.length; i++){
            queryArr.push(keywords[i])
        }
        
        const queryStr = queryArr.join('|')
        return queryStr;
        

    }

    public async getImagesFromKeyWords(quantity: number = 1,keywords: string[] ){
   
        let queryStr = this.generateQueryString(keywords)
        queryStr=encodeURI(queryStr)
        const url = `https://api.openverse.org/v1/images/?q=${queryStr}&license=pdm,cc0,by,by-sa&categories=photograph&page_size=1&page=1`
        console.log(url)
        const currentAccessToken = await OpenverseTokenHandler.getInstance().getCurrentAccessToken()

        
 
        const response = await axios.get(url,{
            headers:{
                "Authorization" : `Bearer ${currentAccessToken}`
            }
            
        })
        console.log("=================================="+ keywords + "\n")
        console.log(response.data)
        console.log("==================================\n")
        

    }

    //TODO: OpenVerse has an API to get related images, use this to get images which are related to
    //eachother and put them side by side or one in a circle on one image, would be very good.

}