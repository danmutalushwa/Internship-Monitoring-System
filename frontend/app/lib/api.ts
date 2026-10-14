export async function fetchProfile() {
  const res = await fetch("http://localhost:4000/api/auth/profile", {
    credentials: "include", // VERY important → sends cookies
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}
