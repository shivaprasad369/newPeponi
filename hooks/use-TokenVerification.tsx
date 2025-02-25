"use client"

import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { useEffect, useState } from "react"

const useTokenVerification = () => {
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000"

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem("AdminToken")

        if (!token) {
          setIsVerified(false)
          setIsLoading(false)
          router.push("/login")
          return
        }

        const response = await fetch(`${API_URL}/admin/verify`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const result = await response.json()

        if (response.ok) {
          setIsVerified(true)
          setUser(result.user)
          Cookies.set("Aid", result.user.AdminID)
        } else {
          setIsVerified(false)
          localStorage.removeItem("AdminToken")
          router.push("/login")
        }
      } catch (error) {
        console.error("Error verifying token:", error)
        setError("Failed to verify token")
        setIsVerified(false)
        localStorage.removeItem("AdminToken")
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [router, API_URL])

  return {
    isVerified,
    user,
    isLoading,
    error,
  }
}

export default useTokenVerification

