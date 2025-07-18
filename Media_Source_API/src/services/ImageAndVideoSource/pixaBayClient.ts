//https://pixabay.com/api/videos/?key=51236781-3c0eafbf377319e6fd2341186&q=political+violence&pretty=true

import axios from "axios";
import { OpenverseTokenHandler } from "./openVerseAuth";

import { ImageData } from "../../types";

export default class PixabayClient{

   public constructor(){

    }

     public async getImagesFromKeyWord(quantity: number = 1,keyword: string ): Promise<ImageData | null> {
      
        keyword=encodeURI(keyword)
        const url = `https://pixabay.com/api/?key=${process.env.PIXPAY_API_KEY}&q=${keyword}&image_type=photo&order=latest`
        console.log(url)

      
        const response = await axios.get(url)

        const data = response.data;
        if(data.hits?.[0].largeImageURL){
          const img_data = {
             url: data.hits?.[0].largeImageURL,
            attribution:'',
            keyword:keyword
          } as ImageData
    
            console.log("====================================================== Large Image URL ===============================================================")
            console.log(img_data)
            return img_data
          
        
        }else{
            console.log("====================================================== NULL Image URL ================================================================")
            return null
        }
    }
}

// }
//   "total": 294689,
//   "totalHits": 500,
//   "hits": [
//     {
//       "id": 6999568,
//       "pageURL": "https://pixabay.com/photos/hibiscus-yellow-hibiscus-6999568/",
//       "type": "photo",
//       "tags": "hibiscus, yellow hibiscus, yellow flower, nature, macro, hibiscus, hibiscus, hibiscus, hibiscus, hibiscus",
//       "previewURL": "https://cdn.pixabay.com/photo/2022/02/07/14/58/hibiscus-6999568_150.jpg",
//       "previewWidth": 150,
//       "previewHeight": 100,
//       "webformatURL": "https://pixabay.com/get/ge269484eaef6a613018976959c4a40e3bf9f9364fdc81add38f5f70afb5cb31a11fa1e38ad95a4c6e49a53e0a13af8673f060b0ff8526a8cd527360869b1a229_640.jpg",
//       "webformatWidth": 640,
//       "webformatHeight": 427,
//       "largeImageURL": "https://pixabay.com/get/g5092928a056031055456d5b83dca4456f74aa3ac6e3a3cda7bdebd276c6e8af54fb419466ba9f6200e8b6b1a4fa2c93e46b2203f6acfde202dbca1ccb41d8829_1280.jpg",
//       "imageWidth": 6240,
//       "imageHeight": 4160,
//       "imageSize": 3493799,
//       "views": 4165,
//       "downloads": 2805,
//       "collections": 178,
//       "likes": 41,
//       "comments": 18,
//       "user_id": 21428489,
//       "user": "ignartonosbg",
//       "userImageURL": "https://cdn.pixabay.com/user/2024/01/14/15-44-01-243_250x250.jpg",
//       "noAiTraining": false,
//       "isAiGenerated": false,
//       "isGRated": true,
//       "isLowQuality": 0,
//       "userURL": "https://pixabay.com/users/21428489/"
//     },