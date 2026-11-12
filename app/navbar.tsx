import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import LogoutButton from "./logoutButton";

export default async function Navbar() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, role: true },
      })
    : null;

  const home = user?.role === "DOCTOR" ? "/doctor" : "/dashboard";

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">MyApp</Link>
       
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href={home} className="underline">{user.name ?? "My account"}</Link>
               {user.role === "ADMIN" && <Link href="/admin/approvals" className="underline">Approvals</Link>}
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
  );
}