import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "@/components/ui/sonner"
import './index.css'
import App from './App.tsx'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ThemeProvider } from './contexts/ThemeProvider.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster
        icons={{
          error: <FaTimesCircle className="text-red-600" />,
          success: <FaCheckCircle className='text-green-600 w-4 h-4' />
        }}
      />
    </ThemeProvider>
  </StrictMode>,
)
