import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'
import { GOOGLE_CLIENT_ID, isGoogleAuthEnabled } from './config/auth'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isGoogleAuthEnabled ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
)
