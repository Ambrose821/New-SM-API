import axios from "axios"
import { getSecretValue, upsertSecret } from "../../../config/secrets-manager"
import type { InstagramUserInfo, InstagramLongTokenResult, InstagramAuthTokenExchangeResult, InstagramAuthData } from "../../../types"
const base_graph_url = `https://graph.facebook.com/v23.0/`

export const getMetaErrorDetails = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return {
      status: undefined,
      method: undefined,
      url: undefined,
      message: error instanceof Error ? error.message : String(error),
      type: undefined,
      code: undefined,
      subcode: undefined,
      userTitle: undefined,
      userMessage: undefined,
      details: undefined,
      fbtraceId: undefined,
      requestId: undefined,
      appUsage: undefined,
      raw: error,
    }
  }

  const metaError = error.response?.data?.error

  return {
    status: error.response?.status,
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url,
    message: metaError?.message ?? error.message,
    type: metaError?.type,
    code: metaError?.code,
    subcode: metaError?.error_subcode,
    userTitle: metaError?.error_user_title,
    userMessage: metaError?.error_user_msg,
    details: metaError?.error_data?.details,
    fbtraceId: metaError?.fbtrace_id,
    requestId: error.response?.headers?.["x-fb-request-id"],
    appUsage: error.response?.headers?.["x-app-usage"],
    raw: error.response?.data,
  }
}

const createMetaRequestError = (
  operation: string,
  details: ReturnType<typeof getMetaErrorDetails>
) => {
  const error = new Error(`${operation}: ${details.message}`)
  return Object.assign(error, { meta: details })
}



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

export const get_meta_current_token:any = async () => {
  const secret = await getSecretValue("GRAPH_ACCESS_TOKEN")

  if (typeof secret === "string") {
    return secret.trim()
  }

  return secret?.GRAPH_ACCESS_TOKEN?.trim()
}

const set_meta_current_token:any = async (token:string) => {
  await upsertSecret("GRAPH_ACCESS_TOKEN", { GRAPH_ACCESS_TOKEN: token.trim() })
}

export const get_graph_long_token = async (short_token: string = '') => {

  const {app_id,app_secret} = await get_meta_app_secrets()
  const token = short_token;

  const url =
    base_graph_url +
    `oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(app_id)}&client_secret=${encodeURIComponent(app_secret)}&fb_exchange_token=${encodeURIComponent(token)}`

  try {
    const response = await axios.get(url)

    return {
      token: response.data.access_token,
      timer: response.data.expires_in,
    }
  } catch (err) {
    const details = getMetaErrorDetails(err)
    console.error('Meta graph long token exchange failed:', details);
    return null;
  }
}


const exchange_auth_code_for_token = async (code:string, app_id: string, app_secret :string): Promise<InstagramAuthTokenExchangeResult> =>{
  try{
    console.log(process.env.INSTAGRAM_REDIRECT_URI!)
    const body = new URLSearchParams({
      client_id: app_id,
      client_secret: app_secret,
      grant_type: "authorization_code",
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
      code
    })
    const response = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    )
    const data = response.data
    return{
      access_token:data.access_token,
      user_id:data.user_id.toString()
    }
  } catch (error){
    const details = getMetaErrorDetails(error)
    console.error("Meta short-lived token exchange failed:", details)
    throw createMetaRequestError("Error Getting short lived auth token", details)
  }
 
} 

const get_long_lived_token = async (short_token: string, app_secret: string): Promise<InstagramLongTokenResult> =>{
  try{
     const response = await axios.get(
    'https://graph.instagram.com/access_token',
        {
          params: {
            grant_type: 'ig_exchange_token',
            client_secret: app_secret,
            access_token: short_token,
          },
        },
    )   
    const data = response.data
    console.log("********** Success **************")
    return {
      token: data.access_token,
      expires_in:data.expires_in
    }

  }catch(error){
    const details = getMetaErrorDetails(error)
    console.error("Meta long-lived token exchange failed:", details)
    throw createMetaRequestError("Error Getting long lived access token", details)
  }
 
}

const get_user_info = async (long_token: string): Promise<InstagramUserInfo> => {
  try {
    const response = await axios.get(
      "https://graph.instagram.com/me",
      {
        params: {
          fields: "user_id,username",
          access_token: long_token,
        },
      }
    )
    const data = response.data

    return {
      user_id: data.user_id,
      user_name: data.username,
    }
  } catch (error) {
    const details = getMetaErrorDetails(error)
    console.error("Meta Instagram user info request failed:", details)
    throw createMetaRequestError("Error Getting Instagram user info", details)
  }
}

export const get_instagram_auth_data = async (code:string): Promise<InstagramAuthData> =>{
  const instagram_app_id = process.env.INSTAGRAM_APP_ID //Different than meta app
  const instagram_app_secret = process.env.INSTAGRAM_APP_SECRET 
  const {access_token,} = await exchange_auth_code_for_token(code, instagram_app_id!, instagram_app_secret!)
  const {token, expires_in} = await get_long_lived_token(access_token,instagram_app_secret!);
  const {user_id, user_name} = await get_user_info( token )

  const expirey_date = new Date(Date.now() + (expires_in * 1000));
  
  return {
    user_name,
    instagram_id: user_id,
    long_access_token: token,
    expirey_date
  }
}
