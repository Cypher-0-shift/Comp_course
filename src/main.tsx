import React from 'react'
import ReactDOM from 'react-dom/client'
import { RootLayout } from './app/layouts/RootLayout'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootLayout />
  </React.StrictMode>
)