"use client";

import LoginButton from "@/app/components/LoginButton";
import { TypeAnimation } from "react-type-animation";

export default function Home() {
  return (
    <main className="w-full max-w-xl text-center flex flex-col items-center gap-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight whitespace-nowrap overflow-x-auto">
        <TypeAnimation
          sequence={["Bunty's YouTube Publisher", 1000]}
          wrapper="span"
          speed={50}
          cursor={true}
          repeat={0}
        />
      </h1>

      <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
        Authenticate with Google and upload your videos directly from this app.
      </p>

      <div className="mt-4">
        <div className="inline-block">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
