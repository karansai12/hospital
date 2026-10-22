import Image from "next/image";
import HomePage from "./home";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <HomePage />
    </div>
  );
}