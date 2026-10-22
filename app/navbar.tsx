"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Navbar = () => {
     const router = useRouter()
    return(
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-white text-xl font-bold">My App</h1>
            <div>
            <Button className="bg-transparent text-white" onClick={() => router.push('./login')}>
                Login
            </Button>
               <Button className="bg-transparent text-white" onClick={() => router.push('./signup')}>
                Signup
            </Button>
            </div>
            
            </div>
        </nav>
    )
}

export default Navbar;