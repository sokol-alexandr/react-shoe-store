import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // Changed from BrowserRouter
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import { DatabaseProvider } from './context/DatabaseContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <DatabaseProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </DatabaseProvider>
    </AuthProvider>
  </React.StrictMode>,
  
)
