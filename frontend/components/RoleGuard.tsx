"use client";

import { useUserContext } from "../context/userContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
}) {
  const { user } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    if (!allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
    }
  }, [user, allowedRoles, router]);

  return <>{children}</>;
}