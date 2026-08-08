
const BASE_EMBED_URL = 'https://www.instagram.com/oauth/authorize'

const BASE_EMBED_URL_PARAMS = new URLSearchParams({
  force_reauth: 'true',
  client_id: import.meta.env.VITE_INSTAGRAM_APP_ID,
  // Meta doesn't seem to allow localhost redirect URIs for Instagram OAuth
  redirect_uri: import.meta.env.VITE_INSTAGRAM_LOGIN_REDIRECT_URI,
  response_type: 'code',
  scope:
    'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights',
})

export interface IEmbedUrlState {
  action: 'signup' | 'signin'
  env: 'development' | 'production'
}

const createEmbedUrl = (action: 'signup' | 'signin'): string => {
  const params = new URLSearchParams(BASE_EMBED_URL_PARAMS)
  console.log(import.meta.env.VITE_INSTAGRAM_LOGIN_REDIRECT_URI)
  const state: IEmbedUrlState = {
    action,
    env: import.meta.env.PROD ? 'production' : 'development',
  }
  params.set('state', JSON.stringify(state))
  return `${BASE_EMBED_URL}?${params.toString()}`
}

const SIGNUP_EMBED_URL = createEmbedUrl('signup')
const SIGNIN_EMBED_URL = createEmbedUrl('signin')

export default {
  SIGNUP_EMBED_URL,
  SIGNIN_EMBED_URL,
} as const
