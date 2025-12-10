import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Dashboard } from '@/components/Dashboard'
import { isAuthenticated } from '@/lib/utils/oauth'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Check authentication before showing dashboard
    if (!isAuthenticated()) {
      router.push('/')
    }
  }, [router])

  return <Dashboard />
}
