"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useRegisterMutation,
  useSignInMutation,
} from "@/features/user/userApi";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export interface RegistrationRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  mobile: string;
}

const registrationSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters long")
      .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters long")
      .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    mobile: z
      .string()
      .min(1, "Mobile number is required")
      .regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid mobile number")
      .refine((val) => val.replace(/[\s\-()]/g, "").length >= 10, {
        message: "Mobile number must be at least 10 digits",
      }),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/(?=.*\d)/, "Password must contain at least one number")
      .regex(
        /(?=.*[@$!%*?&])/,
        "Password must contain at least one special character (@$!%*?&)"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignInFormData = z.infer<typeof signInSchema>;
type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn } = useAuthStore();
  const [triggerSignIn, { isLoading }] = useSignInMutation();
  const [triggerRegister] = useRegisterMutation();
  const [activeTab, setActiveTab] = useState("signin");

  const router = useRouter();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Registration Form
  const registrationForm = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = registrationForm.watch("password");

  const getPasswordStrength = (
    password: string
  ): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];

    return {
      strength: (strength / 5) * 100,
      label: labels[strength - 1] || "Very Weak",
      color: colors[strength - 1] || "bg-red-500",
    };
  };

  const handleSignIn = async (data: SignInFormData) => {
    try {
      const result = await triggerSignIn({
        ...data,
        rememberMe: data.rememberMe ?? false,
      }).unwrap();

      if (!result.exists) {
        signInForm.setError("root", { message: "Invalid email or password" });

        toast("❌ Invalid credentials", {
          description: "Please check your email and password.",
          className: "bg-red-500 text-white border border-red-600",
        });

        return;
      }

      // ✅ logged in
      signIn({ user: result.user, token: result.token });

      toast(`👋 Welcome back, ${result.user.name}!`, {
        description: "You’re now signed in.",
        duration: 3000,
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as Error;
    
      console.error("Login failed:", error);
    
      signInForm.setError("root", {
        message: "Something went wrong. Please try again.",
      });
    
      toast("⚠️ Unable to sign in", {
        description: error.message ?? "Unexpected error. Please try again.",
        className: "bg-red-500 text-white border border-red-600",
      });
    }
    
  };

  const handleRegister = async (data: RegistrationFormData) => {
    try {
      const result = await triggerRegister({
        ...data,
      }).unwrap();

      console.log("✅ Registration result:", result);

      if (result.exists) {
        // User already registered
        registrationForm.setError("root", {
          message: "User already registered.",
        });
        return;
      }

      if (result.user) {
        toast("🎉 Registration complete!", {
          description: "You can now log in to your account.",
        });
      
        registrationForm.reset();  // <-- Clear form inputs and errors
        setActiveTab("signin");    // <-- Switch tab to Sign In
      } else {
        // Unexpected structure
        registrationForm.setError("root", {
          message: "Unexpected response. Please try again.",
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
    
      console.error("❌ Registration failed:", error);
    
      registrationForm.setError("root", {
        message: error.message || "Registration failed. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster
        position="top-center"
        className="!top-6 max-w-md mx-auto"
        toastOptions={{
          classNames: {
            toast:
              "bg-white shadow-lg rounded-xl border border-gray-200 px-4 py-3 text-gray-900",
            title: "font-semibold text-base",
            description: "text-sm text-muted-foreground",
          },
        }}
      />
      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:flex items-center justify-center p-8">
          <div className="max-w-2xl text-center">
            <div className="mb-8">
              <img
                src="/food-nutrition-groups-set.png?height=400&width=600"
                alt="Caloriq Visual"
                className="w-full h-auto max-w-lg mx-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Your Health, Your Way
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              Track calories, monitor nutrition, and achieve your wellness goals
              with our comprehensive health platform.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Nutrition Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Fitness Goals</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Health Insights</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 lg:p-8">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                <span className="font-light">Welcome to </span>
                <span className="font-bold">CALORIQ</span>
              </CardTitle>
              <CardDescription className="text-slate-600">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="signin"
                    className="text-sm transition-colors duration-200 hover:bg-muted hover:text-primary rounded-md py-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="text-sm transition-colors duration-200 hover:bg-muted hover:text-primary rounded-md py-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form
                    onSubmit={signInForm.handleSubmit(handleSignIn)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="signin-email"
                        className="text-sm font-medium text-slate-700"
                      >
                        Email
                      </Label>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-3 h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          className={`pl-10 h-11 border-gray-400 ${
                            signInForm.formState.errors.email
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                          {...signInForm.register("email")}
                        />
                        {signInForm.formState.errors.email && (
                          <svg
                            className="absolute right-3 top-3 h-4 w-4 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        )}
                      </div>
                      {signInForm.formState.errors.email && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertDescription className="text-red-800 text-sm">
                            {signInForm.formState.errors.email.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="signin-password"
                        className="text-sm font-medium text-slate-700"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-3 h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className={`pl-10 pr-10 border-gray-400 h-11 ${
                            signInForm.formState.errors.password
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                          {...signInForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {signInForm.formState.errors.password && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertDescription className="text-red-800 text-sm">
                            {signInForm.formState.errors.password.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          {...signInForm.register("rememberMe")}
                        />
                        <Label
                          htmlFor="remember"
                          className="text-slate-600 cursor-pointer"
                        >
                          Remember me
                        </Label>
                      </div>
                      <a
                        href="#"
                        className="text-slate-600 hover:text-slate-900 hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>

                    {signInForm.formState.errors.root && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800 text-sm">
                          {signInForm.formState.errors.root.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      disabled={signInForm.formState.isSubmitting || isLoading}
                      className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50"
                    >
                      {signInForm.formState.isSubmitting || isLoading
                        ? "Signing In..."
                        : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form
                    onSubmit={registrationForm.handleSubmit(handleRegister)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="first-name"
                          className="text-sm font-medium text-slate-700"
                        >
                          First Name
                        </Label>
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-3 h-4 w-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <Input
                            id="first-name"
                            type="text"
                            placeholder="First name"
                            className={`pl-10 h-11 border-gray-400 ${
                              registrationForm.formState.errors.firstName
                                ? "border-red-500 focus-visible:ring-red-500"
                                : ""
                            }`}
                            {...registrationForm.register("firstName")}
                          />
                        </div>
                        {registrationForm.formState.errors.firstName && (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertDescription className="text-red-800 text-xs">
                              {
                                registrationForm.formState.errors.firstName
                                  .message
                              }
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="last-name"
                          className="text-sm font-medium text-slate-700"
                        >
                          Last Name
                        </Label>
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-3 h-4 w-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <Input
                            id="last-name"
                            type="text"
                            placeholder="Last name"
                            className={`pl-10 h-11 border-gray-400 ${
                              registrationForm.formState.errors.lastName
                                ? "border-red-500 focus-visible:ring-red-500"
                                : ""
                            }`}
                            {...registrationForm.register("lastName")}
                          />
                        </div>
                        {registrationForm.formState.errors.lastName && (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertDescription className="text-red-800 text-xs">
                              {
                                registrationForm.formState.errors.lastName
                                  .message
                              }
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="register-email"
                        className="text-sm font-medium text-slate-700"
                      >
                        Email
                      </Label>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-3 h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="Enter your email"
                          className={`pl-10 h-11 border-gray-400 ${
                            registrationForm.formState.errors.email
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                          {...registrationForm.register("email")}
                        />
                        {registrationForm.formState.errors.email && (
                          <svg
                            className="absolute right-3 top-3 h-4 w-4 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        )}
                      </div>
                      {registrationForm.formState.errors.email && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertDescription className="text-red-800 text-sm">
                            {registrationForm.formState.errors.email.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="mobile"
                        className="text-sm font-medium text-slate-700"
                      >
                        Mobile Number
                      </Label>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-3 h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder="Enter your mobile number"
                          className={`pl-10 h-11 border-gray-400 ${
                            registrationForm.formState.errors.mobile
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                          {...registrationForm.register("mobile")}
                        />
                        {registrationForm.formState.errors.mobile && (
                          <svg
                            className="absolute right-3 top-3 h-4 w-4 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        )}
                      </div>
                      {registrationForm.formState.errors.mobile && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertDescription className="text-red-800 text-sm">
                            {registrationForm.formState.errors.mobile.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="register-password"
                        className="text-sm font-medium text-slate-700"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-3 h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          className={`pl-10 pr-10 h-11 border-gray-400 ${
                            registrationForm.formState.errors.password
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                          {...registrationForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {passwordValue && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">
                              Password strength:
                            </span>
                            <span
                              className={`font-medium ${
                                getPasswordStrength(passwordValue).strength >=
                                80
                                  ? "text-green-600"
                                  : getPasswordStrength(passwordValue)
                                      .strength >= 60
                                  ? "text-blue-600"
                                  : getPasswordStrength(passwordValue)
                                      .strength >= 40
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {getPasswordStrength(passwordValue).label}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                getPasswordStrength(passwordValue).color
                              }`}
                              style={{
                                width: `${
                                  getPasswordStrength(passwordValue).strength
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {registrationForm.formState.errors.password && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertDescription className="text-red-800 text-sm">
                            {registrationForm.formState.errors.password.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirm-password"
                        className="text-sm font-medium text-slate-700"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-3 h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className={`pl-10 pr-10 h-11 border-gray-400 ${
                            registrationForm.formState.errors.confirmPassword
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                          {...registrationForm.register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {registrationForm.formState.errors.confirmPassword && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertDescription className="text-red-800 text-sm">
                            {
                              registrationForm.formState.errors.confirmPassword
                                .message
                            }
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {registrationForm.formState.errors.root && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800 text-sm">
                          {registrationForm.formState.errors.root.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      disabled={registrationForm.formState.isSubmitting}
                      className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50"
                    >
                      {registrationForm.formState.isSubmitting
                        ? "Creating Account..."
                        : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
