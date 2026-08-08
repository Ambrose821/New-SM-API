import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UnAuthenticated from './layouts/unauthenticated.tsx'
import Authenticated from './layouts/authenticated.tsx'
import RequireAuth from './layouts/require-auth.tsx'
import DashboardHome from './components/dashboard-home.tsx'
import InstagramRedirect from './pages/instagramRedirect.tsx'

import Posts from './pages/posts.tsx'
import Socials from './pages/socials.tsx'
import { Toaster } from '@/components/ui/sonner'
import Pipelines from './pages/pipelines.tsx'
// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl={"/dashboard"}
    >
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<UnAuthenticated />} />
          <Route element={<RequireAuth />}>
            <Route path='/dashboard' element={<Authenticated />}>
              <Route index element={<DashboardHome />} />
              <Route path="posts" element={<Posts/>} />
              <Route path ="socials" element={<Socials/>}/>
              <Route path="pipeline" element={<Pipelines/>}/>
              <Route path ='instagram/redirect' element={<InstagramRedirect/>}/> {/* TODO, Make a platform agnostic stateful rediret page*/}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
