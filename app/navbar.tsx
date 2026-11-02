"use client"

import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { Link } from "lucide-react";
import { useRouter } from "next/navigation";
import LogoutButton from "./logoutButton";
import { prisma } from "@/lib/prisma";

const Navbar = async () => {
     const router = useRouter()
     const session = await getSession();
     const user = session ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, role: true },
     }) : null

     const role = user?.role === "DOCTOR" ? "/doctor" : "/dashboard"

    return(
      <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">CareSlot</Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href={role} className="underline">{user.name ?? "My account"}</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
    )
}

export default Navbar;