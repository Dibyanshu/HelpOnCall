import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AdminAuthProvider } from './admin/auth/AdminAuthContext.jsx'
import { ToastProvider } from './components/common/Toast.jsx'
import { ConfirmProvider } from './components/common/ConfirmDialog.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminAuthProvider>
      <ConfirmProvider>
        <ToastProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </ConfirmProvider>
    </AdminAuthProvider>
  </StrictMode>,
)
