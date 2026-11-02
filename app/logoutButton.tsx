"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
const router = useRouter()
     async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
}
return (
    <Button onClick={logout} className="underline">
        Log out
    </Button>
)
}

