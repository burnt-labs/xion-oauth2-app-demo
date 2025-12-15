import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Login } from '@/components/Login'
import { isAuthenticated } from '@/lib/utils/oauth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [router])

  return <Login />
}
