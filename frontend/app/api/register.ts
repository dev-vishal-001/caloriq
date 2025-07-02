// lib/api/signIn.ts

// Keep this for login
export interface SignInRequest {
  email: string
  password: string
  rememberMe: boolean
}

// New interface for registration
export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  mobile: string
  password: string
  confirmPassword: string
}

// Reuse SignInResponse for register if response is same
export interface SignInResponse {
  exists: boolean
  token: string
  user: {
    name: string
    email: string
  }
}

export async function registerRequest(body: RegisterRequest): Promise<SignInResponse> {
  const res = await fetch("https://caloriq-pafp5gc8a-vishalvd05-gmailcoms-projects.vercel.app/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("❌ Backend error response:", err);
    throw new Error(err.message || "Registration failed");
  }

  const data = await res.json();
  console.log("✅ Received response:", data);
  return data;
}
