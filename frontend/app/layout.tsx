import type { Metadata } from "next";
import "./global.css";
import Layout from "../components/Layout";
import { UserProvider } from "../context/userContext";


export const metadata: Metadata = {
  title: "Internship Monitoring System",
  description: "University of Kigali - Internship Monitoring Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <Layout>{children}</Layout>
        </UserProvider>
      </body>
    </html>
  );
}