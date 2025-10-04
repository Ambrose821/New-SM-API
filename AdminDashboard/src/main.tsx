import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UnAuthenticated from './layouts/unauthenticated.tsx'
import Authenticated from './layouts/authenticated.tsx'
import RequireAuth from './layouts/require-auth.tsx'
import DashboardHome from './components/dashboard-home.tsx'

import Posts from './pages/posts.tsx'
// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<UnAuthenticated />} />
          <Route element={<RequireAuth />}>
            <Route path='/dashboard' element={<Authenticated />}>
              <Route index element={<DashboardHome />} />
              <Route path="posts" element={<Posts/>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
