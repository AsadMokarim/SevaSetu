import App from './App.jsx'


import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { NotificationProvider } from './contexts/ErrorContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </BrowserRouter>
)