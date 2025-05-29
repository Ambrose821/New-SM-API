import {Media} from "../../types";
import RawMedia from '../../models/rawMedia'
import { raw } from "express";


//COMMENTED OUT THIS FUNCTION BECAUSE SAVING THE RAW MEDIA COULD LEAD TO COPYRIGHT ISSUES
// export async function saveRawMedia(rawMedia: Media): Promise<Media| Error> {
//     try{
//         //console.log("Raw Media ", rawMedia)
//         const rawMediaDoc = new RawMedia(rawMedia);
//         await rawMediaDoc.save()

//         return rawMediaDoc

//     }catch(err){
//        // console.error("Error saving Raw Media to mongodb: ",err)
//         throw new Error("Error Saving Raw Media to mongodb: " + err)
//     }
// }