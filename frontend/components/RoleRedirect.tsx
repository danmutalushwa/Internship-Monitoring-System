"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "../context/userContext";

export default function RoleRedirect() {
  const { user } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const role = user.role.toLowerCase();
    router.push(`/${role}/dashboard`);
  }, [user, router]);

  return null;
}