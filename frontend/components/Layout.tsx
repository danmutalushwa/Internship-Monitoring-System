"use client";
import React, { useEffect, useState } from "react"; 
import { useRouter, usePathname } from "next/navigation"; 
import Navbar from "./Navbar"; import Sidebar from "./Sidebar"; 
import BottomNav from "./BottomNav"; 
import MobileHeader from "./MobileHeader";
interface UserData { 
    name: string; 
    email: string; 
    avatarUrl?: string; 
    role?: string; 
}
export default function Layout({ children, }: { children: React.ReactNode }) { 
        const [user, setUser] = useState<UserData | null>(null); 
        const [loading, setLoading] = useState(true); 
        const router = useRouter(); 
        const pathname = usePathname();
        const isPublicRoute = pathname.startsWith("/auth");
    useEffect(() => { 
        if (isPublicRoute) { 
            setLoading(false); 
            return; 
        }

        async function fetchUser() {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setLoading(false);
            router.push("/auth/login");
            return;
        }

        try {
            const res = await fetch("http://localhost:4000/api/auth/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            if (res.ok) {
            const data = await res.json();
            setUser(data);

        
            if (data.role === "ADMIN" && !pathname.startsWith("/admin")) {
                router.push("/admin");
            }
            } else {
            localStorage.removeItem("accessToken");
            router.push("/auth/login");
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            localStorage.removeItem("accessToken");
            router.push("/auth/login");
        } finally {
            setLoading(false);
        } 
        }

        fetchUser();
    }, [router, pathname]);

    if (loading) return <div>Loading user info...</div>; 
    if (isPublicRoute) return <>{children}</>;

    return ( 
        <div className="flex"> 
            <Sidebar /> 
            <div className="flex flex-col flex-1 min-h-screen"> 
                <Navbar /> 
                <MobileHeader /> 
                <main className="pt-14 lg:pt-14 px-4">{children}</main> 
                <footer className="bg-gray-100 text-center py-6 border-t border-gray-300 mt-auto"> 
                    &copy; {new Date().getFullYear()} UoK Internship Monitoring System. All rights reserved. 
                </footer> 
                <BottomNav />
            </div> 
        </div>    
    ); 
} 