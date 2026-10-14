"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [faculty, setFaculty] = useState("");
  const [faculties, setFaculties] = useState<{ id: number; name: string }[]>([]); 
  const router = useRouter();

  // ✅ Load faculties on mount
  useEffect(() => {
    async function loadFaculties() {
      try {
        const res = await fetch("http://localhost:4000/api/admin/faculties");
        const data = await res.json();

        if (Array.isArray(data)) {
          setFaculties(data);
        } else {
          console.error("Invalid faculties response:", data);
          setFaculties([]);
        }
      } catch (err) {
        console.error("Failed to load faculties", err);
        setFaculties([]);
      }
    }

    loadFaculties();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, faculty }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Registration failed");
      }

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/Background.jpg')" }}
    >
      <form
        onSubmit={handleRegister}
        className="p-6 bg-white bg-opacity-90 border rounded-md shadow-md space-y-4 w-full max-w-sm"
      >
        <h1 className="text-xl font-bold text-center">Register</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded pr-10"
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

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded pr-10"
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

        {/* ✅ Faculty Dropdown */}
        <select
          value={faculty}
          onChange={(e) => setFaculty(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Select Faculty</option>
          {faculties.map((f: any) => (
            <option key={f.id} value={f.name}>
              {f.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>

        <p className="text-sm text-center mt-2">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
      </form>
    </div>
  );
}