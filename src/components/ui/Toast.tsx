'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#1f2937',
          color: '#f3f4f6',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: '#f3f4f6' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#f3f4f6' },
        },
      }}
    />
  )
}
