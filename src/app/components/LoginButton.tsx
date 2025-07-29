"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import Link from "next/link";


export default function LoginButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <div className="bg-gray-800 text-white shadow-lg rounded-xl p-6 max-w-md mx-auto mt-8 border text-center">
        <p className="text-lg">Signed in as</p>
        <p className="text-xl font-semibold mb-6">
          {session?.user?.email}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="outline"
            className="border-gray-300 hover:bg-gray-500"
            size="lg"
            onClick={() => signOut()}
          >
            Logout
          </Button>

          <Link href="/large-files" passHref>
            <Button
              variant="default"
              className="bg-blue-600 text-white hover:bg-blue-700"
              size="lg"
            >
              Publish Your Video
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <Button
      variant="outline"
      className="flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-white text-black rounded-lg shadow-md hover:bg-gray-100 transition-all"
      onClick={() => signIn("google", { callbackUrl: "/large-files" })}
    >
      <IconBrandGoogleFilled size={48} /> Sign in with Google
    </Button>
  );
}
