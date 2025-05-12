import Media from "../../types";
import RawMedia from '../../models/rawMedia'
import { raw } from "express";

export async function saveRawMedia(rawMedia: Media): Promise<Media| Error> {
    try{
        const rawMediaDoc = new RawMedia(rawMedia);
        await rawMediaDoc.save()

        return rawMediaDoc

    }catch(err){
        console.error("Error saving Raw Media to mongodb: ",err)
        throw new Error("Error Saving Raw Media to mongodb: " + err)
    }
}