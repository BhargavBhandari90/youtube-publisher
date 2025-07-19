"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { IconBrandGoogleFilled } from "@tabler/icons-react";

export default function LoginButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <div className="center-wrapper">
        <div className="box">
          Signed in as {session.user.email}
          <br />
          <Button
            variant="outline"
            className="google-btn"
            size="sm"
            onClick={() => signOut()}
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }
  return (
    <Button
      variant="outline"
      className="flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-white text-black rounded-lg shadow-md hover:bg-gray-100 transition-all"
      onClick={() => signIn("google", { callbackUrl: "/prompt" })}
    >
      <IconBrandGoogleFilled size={48} /> Sign in with Google
    </Button>
  );
}
