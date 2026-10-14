"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    const res = await fetch("http://localhost:4000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 1500);
    } else {
      setMessage("Reset failed. Token may be invalid or expired.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/Background.jpg')" }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-90 p-6 rounded-md shadow-md space-y-4 w-full max-w-sm"
      >
        <h1 className="text-xl font-bold text-center">Reset Password</h1>
        <p className="text-sm text-gray-600 text-center">
          Enter your new password below.
        </p>

        {/* New password input */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            className="w-full border px-3 py-2 rounded pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-2"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-blue-600" />
            ) : (
              <EyeIcon className="h-5 w-5 text-blue-600" />
            )}
          </button>
        </div>

        {/* Confirm password input */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            className="w-full border px-3 py-2 rounded pr-10"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-2 top-2"
          >
            {showConfirm ? (
              <EyeSlashIcon className="h-5 w-5 text-blue-600" />
            ) : (
              <EyeIcon className="h-5 w-5 text-blue-600" />
            )}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Reset Password
        </button>

        {message && (
          <p className="mt-2 text-sm text-center text-gray-700">{message}</p>
        )}

        <p className="text-sm text-center mt-4">
          Back to{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}