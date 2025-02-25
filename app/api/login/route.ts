import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import db from "@/app/lib/db"

export async function POST(request: Request) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  try {
    const [rows] = await db.execute("SELECT * FROM admins WHERE username = ?", [username])

    if ((rows as any[]).length === 0) {
      return NextResponse.json({ message: "Invalid credentials or email not verified" }, { status: 401 })
    }

    const user = (rows as any[])[0]
    const isPasswordMatch = await bcrypt.compare(password, user.PasswordHash)

    if (!isPasswordMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = jwt.sign({ AdminID: user.id, UserName: user.username }, "peponi", { expiresIn: "2h" })

    return NextResponse.json(
      {
        token,
        message: "Login successful",
        email: user.email,
        username: user.username,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 })
  }
}

