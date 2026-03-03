import axios from "axios"
import { getSecretValue, upsertSecret } from "../../../config/secrets-manager"
import cron from "node-cron";
const base_graph_url = `https://graph.facebook.com/v19.0/`



/*
 Takes a short term facebook graph api token (1-hour), a facebook developers app id, and app secret.
 Exhanges short term token for long term token(60-days).

 returns new token and time until token expirey
*/


const get_meta_app_secrets:any = async () => {
  let app_id = await getSecretValue("FACEBOOK_APP_ID")
  app_id= app_id.FACEBOOK_APP_ID
  let app_secret = await getSecretValue("FACEBOOK_APP_SECRET")
  app_secret = app_secret.FACEBOOK_APP_SECRET
  return {app_id, app_secret}
}

const get_meta_current_token:any = async () => {
  const token = await getSecretValue("GRAPH_ACCESS_TOKEN")
  return token.GRAPH_ACCESS_TOKEN
}

const set_meta_current_token:any = async (token:string) => {
  await upsertSecret("GRAPH_ACCESS_TOKEN", token)
}

export const get_graph_long_token = async () => {

  const {app_id,app_secret} = await get_meta_app_secrets()
  const token = await get_meta_current_token()

 
  const url =
    base_graph_url +
    `oauth/access_token?grant_type=fb_exchange_token&client_id=${app_id}&client_secret=${app_secret}&fb_exchange_token=${token}`
    console.log(url)
  try {
    const response = await axios.get(url)

    return {
      token: response.data.access_token,
      timer: response.data.expires_in,
    }
  } catch (err: Error | any) {
    if (err.response) {
      console.error('Response error:', err.response.status, err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
    return null;
  }
}

//Takes a facebook page id which can be obtained manually from any business facebook page, or through OAuth services.
//If an instagram account is associated to that page, the function will return that accounts instagram id which will allow graph api calls for that account
export const get_instagram_id = async (facebook_page_id:string, access_token:string) => {
  const url =
    base_graph_url +
    `${facebook_page_id}?fields=instagram_business_account&access_token=${access_token}`
  try {
    const response = await axios.get(url)

    const instagram_id = response.data.instagram_business_account.id

    return instagram_id
  } catch (err: Error | any) {
    if (err.response) {
      console.error('Response error:', err.response.status, err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
    return null;
  }
}

export const scheduleMetaTokenRefresh = () => {
  //Runs every 59 days
  cron.schedule('0 0 */20 * *', async () => {
    console.log('Refreshing Meta Graph API token...');
    const result = await get_graph_long_token();
    if(result && result.token){
      await set_meta_current_token(result.token)
      console.log("Meta token refreshed successfully")
    }else{
      console.error("Failed to refresh Meta token")
    }
  });
}
