import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UnAuthenticated from './layouts/unauthenticated.tsx'
import Authenticated from './layouts/authenticated.tsx'


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
          <Route path='/' element={<UnAuthenticated/>}/>
          <Route path ='/dashboard' element={<Authenticated />}/>
        </Routes>
      </BrowserRouter>
     
    </ClerkProvider>
  </StrictMode>,
)
