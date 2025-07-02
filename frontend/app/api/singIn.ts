
export interface SignInRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignInResponse {
  exists: boolean;
  token: string;
  user: {
    name: string;
    email: string;
  };
}

export async function signInRequest(body: SignInRequest): Promise<SignInResponse> {


  const res = await fetch("https://caloriq-back.onrender.com/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...body,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("❌ Backend error response:", err);
    throw new Error(err.message || "Sign in failed");
  }

  const data = await res.json();
  console.log("✅ Received response:", data);
  return data;
}
