import {SignJWT,jwtVerify} from "jose"
import { cookies } from "next/headers"


const COOKIE_NAME = "session"
const secret = ()=> new TextEncoder().encode(process.env.AUTH_SECRET)

export async function createSession(userId:string,role:string) {
    const token = await new SignJWT({role})
    .setProtectedHeader({alg:"HS256"})
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret())

    const store = await cookies();
    store.set(COOKIE_NAME,token,{
        httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    })
}

export async function getSession () {
    const store = await cookies()
    const token = store.get(COOKIE_NAME)?.value
    if(!token) return null 
    try {
        const {payload} = await jwtVerify(token,secret())
        return {userId:payload.sub as string,role:payload.role as string}
    } catch (error) {
        return null
    }
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}