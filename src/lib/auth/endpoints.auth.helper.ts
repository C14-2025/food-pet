import { auth } from "@/lib/auth/auth"
import { NextResponse } from "next/server"

type Role = 'ADMIN' | 'CLIENT'

export async function checkAuth(allowedRoles?: Role[]) {
  const session = await auth()

  if (!session || !session.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        )
      }
    }
  }

  return {
    authorized: true,
    session,
    user: session.user
  }
}