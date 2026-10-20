"use client";

import { Button } from "@/components/ui/button";


const HomePage = () => {
    return (
        <header>
            <h1>Welcome to My App</h1>
            <Button className="bg-white hover:bg-gray-200 text-black">
                Login
            </Button>
        </header>
    )
}

export default HomePage;