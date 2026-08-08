import React from 'react'
import ReactDOM from 'react-dom/client'
import { RootLayout } from './app/layouts/RootLayout'
import './index.css'

// Security Console Banner (Self-XSS protection warning)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log(
      '%cWARNING / STOP!',
      'color: #ef4444; font-size: 28px; font-weight: bold; -webkit-text-stroke: 1px black;'
    )
    console.log(
      '%cThis browser feature is intended for developers. If someone told you to copy-paste something here, it is a scam and will give them access to your account and credentials.',
      'font-size: 14px; color: #f59e0b; font-weight: 600;'
    )
  }, 1000)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootLayout />
  </React.StrictMode>
)