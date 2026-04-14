'use client'

import { useEffect, useState } from 'react'
import { checkSupabaseConnection } from '@/src/lib/supabase/client'

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      const result = await checkSupabaseConnection()
      setConnectionStatus(result)
    }

    testConnection()
  }, [])

  if (!connectionStatus) {
    return <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <p className="text-blue-800">Testing Supabase connection...</p>
    </div>
  }

  return (
    <div className={`p-4 border rounded ${
      connectionStatus.success
        ? 'bg-green-50 border-green-200'
        : 'bg-red-50 border-red-200'
    }`}>
      <h3 className={`font-semibold ${
        connectionStatus.success ? 'text-green-800' : 'text-red-800'
      }`}>
        Supabase Connection: {connectionStatus.success ? '✅ Connected' : '❌ Failed'}
      </h3>
      <p className={`text-sm mt-1 ${
        connectionStatus.success ? 'text-green-700' : 'text-red-700'
      }`}>
        {connectionStatus.message}
      </p>
      {!connectionStatus.success && (
        <p className="text-xs text-gray-600 mt-2">
          Make sure your Supabase environment variables are configured correctly.
        </p>
      )}
    </div>
  )
}