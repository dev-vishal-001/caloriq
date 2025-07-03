"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useRegisterMutation, useSignInMutation } from "@/features/user/userApi"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

export interface RegistrationRequest {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  mobile: string
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
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
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
      .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
      .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
      .regex(/(?=.*\d)/, "Password must contain at least one number")
      .regex(/(?=.*[@$!%*?&])/, "Password must contain at least one special character (@$!%*?&)"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignInFormData = z.infer<typeof signInSchema>
type RegistrationFormData = z.infer<typeof registrationSchema>

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { signIn } = useAuthStore()
  const [triggerSignIn, { isLoading }] = useSignInMutation()
  const [triggerRegister] = useRegisterMutation()
  const [activeTab, setActiveTab] = useState("signin")
  const router = useRouter()

  // Animation states
  const [loginProgress, setLoginProgress] = useState(0)
  const [loginSuccess, setLoginSuccess] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

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
  })

  const passwordValue = registrationForm.watch("password")

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/(?=.*[a-z])/.test(password)) strength++
    if (/(?=.*[A-Z])/.test(password)) strength++
    if (/(?=.*\d)/.test(password)) strength++
    if (/(?=.*[@$!%*?&])/.test(password)) strength++

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

    return {
      strength: (strength / 5) * 100,
      label: labels[strength - 1] || "Very Weak",
      color: colors[strength - 1] || "bg-red-500",
    }
  }

  const simulateLoginProgress = () => {
    setLoginProgress(0)
    const interval = setInterval(() => {
      setLoginProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)
    return interval
  }

  const handleSignIn = async (data: SignInFormData) => {
    // Start animation
    setLoginSuccess(false)
    const progressInterval = simulateLoginProgress()

    try {
      const result = await triggerSignIn({
        ...data,
        rememberMe: data.rememberMe ?? false,
      }).unwrap()

      if (!result.exists) {
        // Clear animation on error
        clearInterval(progressInterval)
        setLoginProgress(0)
        signInForm.setError("root", { message: "Invalid email or password" })
        toast("❌ Invalid credentials", {
          description: "Please check your email and password.",
          className: "bg-red-500 text-white border border-red-600",
        })
        return
      }

      // Complete progress and show success
      clearInterval(progressInterval)
      setLoginProgress(100)
      setLoginSuccess(true)

      // Wait for success animation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      signIn({ user: result.user, token: result.token })
      toast(`👋 Welcome back, ${result.user.name}!`, {
        description: "You're now signed in.",
        duration: 3000,
      })
      router.push("/dashboard")
    } catch (err: unknown) {
      // Clear animation on error
      clearInterval(progressInterval)
      setLoginProgress(0)
      const error = err as Error
      console.error("Login failed:", error)
      signInForm.setError("root", {
        message: "Something went wrong. Please try again.",
      })
      toast("⚠️ Unable to sign in", {
        description: error.message ?? "Unexpected error. Please try again.",
        className: "bg-red-500 text-white border border-red-600",
      })
    } finally {
      // Reset animation states
      setLoginProgress(0)
      setLoginSuccess(false)
    }
  }

  const handleRegister = async (data: RegistrationFormData) => {
    try {
      const result = await triggerRegister({
        ...data,
      }).unwrap()

      console.log("✅ Registration result:", result)

      if (result.exists) {
        // User already registered
        registrationForm.setError("root", {
          message: "User already registered.",
        })
        return
      }

      if (result.user) {
        toast("🎉 Registration complete!", {
          description: "You can now log in to your account.",
        })
        registrationForm.reset() // <-- Clear form inputs and errors
        setActiveTab("signin") // <-- Switch tab to Sign In
      } else {
        // Unexpected structure
        registrationForm.setError("root", {
          message: "Unexpected response. Please try again.",
        })
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error("❌ Registration failed:", error)
      registrationForm.setError("root", {
        message: error.message || "Registration failed. Please try again.",
      })
    }
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden transition-colors duration-500">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 dark:from-blue-600/30 dark:to-purple-800/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-600/20 dark:from-pink-600/30 dark:to-orange-800/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 dark:from-cyan-600/20 dark:to-blue-800/20 rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        {/* Theme Toggle Button */}
        <div className="absolute top-6 right-6 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="group h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-yellow-50 dark:hover:bg-yellow-950/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 overflow-hidden relative"
          >
            <div className="relative">
              {isDarkMode ? (
                <svg
                  className="h-5 w-5 text-yellow-500 animate-spin-slow group-hover:animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-blue-600 group-hover:animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
          </Button>
        </div>

        <Toaster
          position="top-center"
          className="!top-6 max-w-md mx-auto"
          toastOptions={{
            classNames: {
              toast:
                "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 px-4 py-3 text-gray-900 dark:text-gray-100 animate-in slide-in-from-top-2 duration-300",
              title: "font-semibold text-base",
              description: "text-sm text-muted-foreground dark:text-gray-400",
            },
          }}
        />

        <div className="grid lg:grid-cols-2 min-h-screen relative z-10">
          {/* Left side - Hero section */}
          <div className="hidden lg:flex items-center justify-center p-8 relative">
            <div className="max-w-2xl text-center transform hover:scale-105 transition-transform duration-700 ease-out">
              <div className="mb-8 relative group">
                <img
                  src="/food-nutrition-groups-set.png"
                  alt="Caloriq Visual"
                  className="w-full h-auto max-w-md mx-auto relative z-10 transition-all duration-500"
                />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 dark:from-slate-200 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
                Your Health, Your Way
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000 delay-200">
                Track calories, monitor nutrition, and achieve your wellness goals with our comprehensive health
                platform.
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-slate-500 dark:text-slate-400 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000 delay-400">
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full group-hover:scale-125 transition-transform duration-300 shadow-lg"></div>
                  <span className="group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                    Nutrition Tracking
                  </span>
                </div>
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full group-hover:scale-125 transition-transform duration-300 shadow-lg"></div>
                  <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Fitness Goals
                  </span>
                </div>
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full group-hover:scale-125 transition-transform duration-300 shadow-lg"></div>
                  <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    Health Insights
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="flex items-center justify-center p-4 lg:p-8 relative">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl relative overflow-hidden animate-in fade-in-50 slide-in-from-right-4 duration-1000">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-pink-400/20 rounded-3xl blur-xl"></div>

              {/* Loading overlay with enhanced animations */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
                  <div className="text-center space-y-6">
                    {/* Animated logo/icon */}
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto">
                        {loginSuccess ? (
                          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
                            <svg
                              className="w-8 h-8 text-white animate-pulse"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-600 rounded-full"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-2 w-12 h-12 border-2 border-purple-400 border-b-transparent rounded-full animate-spin animate-reverse"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {!loginSuccess && (
                      <div className="w-64 mx-auto space-y-2">
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                          <span>Signing you in...</span>
                          <span>{Math.round(loginProgress)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out relative"
                            style={{ width: `${loginProgress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status messages */}
                    <div className="space-y-2">
                      {loginSuccess ? (
                        <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                          <p className="text-lg font-semibold text-green-600 animate-pulse">Welcome back!</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">Redirecting to your dashboard...</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                            {loginProgress < 30
                              ? "Verifying credentials..."
                              : loginProgress < 60
                                ? "Authenticating..."
                                : loginProgress < 90
                                  ? "Setting up your session..."
                                  : "Almost ready..."}
                          </p>
                          <div className="flex items-center justify-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <CardHeader className="space-y-1 text-center relative z-10">
                <CardTitle className="text-3xl bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent animate-in fade-in-50 slide-in-from-top-2 duration-1000">
                  <span className="font-light">Welcome to </span>
                  <span className="font-bold tracking-wider">CALORIQ</span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300 animate-in fade-in-50 slide-in-from-top-2 duration-1000 delay-200">
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-200/50 dark:border-slate-600/50">
                    <TabsTrigger
                      value="signin"
                      className="text-sm font-medium transition-all duration-300 rounded-xl py-3 px-6 relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-800 data-[state=active]:to-slate-900 dark:data-[state=active]:from-slate-200 dark:data-[state=active]:to-slate-100 data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-900/25 dark:data-[state=active]:shadow-slate-100/25 transform data-[state=active]:scale-105 hover:bg-white/60 dark:hover:bg-slate-600/60 text-slate-600 dark:text-slate-300 data-[state=active]:border-0"
                    >
                      <span className="relative z-10">Sign In</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="text-sm font-medium transition-all duration-300 rounded-xl py-3 px-6 relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-800 data-[state=active]:to-slate-900 dark:data-[state=active]:from-slate-200 dark:data-[state=active]:to-slate-100 data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-900/25 dark:data-[state=active]:shadow-slate-100/25 transform data-[state=active]:scale-105 hover:bg-white/60 dark:hover:bg-slate-600/60 text-slate-600 dark:text-slate-300 data-[state=active]:border-0"
                    >
                      <span className="relative z-10">Register</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="signin"
                    className="space-y-4 animate-in fade-in-50 slide-in-from-left-2 duration-500"
                  >
                    <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                      <div className="space-y-2 group">
                        <Label
                          htmlFor="signin-email"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-300"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-300"
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
                            className={`pl-10 h-12 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:scale-105 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                              signInForm.formState.errors.email
                                ? "border-red-500 focus-visible:ring-red-500/20 animate-shake"
                                : ""
                            }`}
                            {...signInForm.register("email")}
                          />
                          {signInForm.formState.errors.email && (
                            <svg
                              className="absolute right-3 top-3 h-4 w-4 text-red-500 animate-bounce"
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
                          <Alert className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm animate-in slide-in-from-top-1 duration-300">
                            <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                              {signInForm.formState.errors.email.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="space-y-2 group">
                        <Label
                          htmlFor="signin-password"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-300"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-300"
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
                            className={`pl-10 pr-10 h-12 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:scale-105 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                              signInForm.formState.errors.password
                                ? "border-red-500 focus-visible:ring-red-500/20 animate-shake"
                                : ""
                            }`}
                            {...signInForm.register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-300 hover:scale-110"
                          >
                            {showPassword ? (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <Alert className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm animate-in slide-in-from-top-1 duration-300">
                            <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                              {signInForm.formState.errors.password.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 group">
                          <Checkbox
                            id="remember"
                            className="transition-all duration-300 hover:scale-110 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-slate-800 dark:data-[state=checked]:bg-slate-200 data-[state=checked]:border-slate-800 dark:data-[state=checked]:border-slate-200"
                            {...signInForm.register("rememberMe")}
                          />
                          <Label
                            htmlFor="remember"
                            className="text-slate-600 dark:text-slate-300 cursor-pointer group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300"
                          >
                            Remember me
                          </Label>
                        </div>
                        <a
                          href="#"
                          className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-all duration-300 hover:scale-105"
                        >
                          Forgot password?
                        </a>
                      </div>

                      {signInForm.formState.errors.root && (
                        <Alert className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm animate-in slide-in-from-top-1 duration-300">
                          <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                            {signInForm.formState.errors.root.message}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        disabled={signInForm.formState.isSubmitting || isLoading}
                        className="w-full h-12 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black dark:from-slate-200 dark:to-slate-100 dark:hover:from-slate-100 dark:hover:to-white text-white dark:text-slate-900 disabled:opacity-50 transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden group"
                      >
                        <span className="relative z-10">
                          {signInForm.formState.isSubmitting || isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></div>
                              <span>Signing In...</span>
                            </div>
                          ) : (
                            "Sign In"
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent
                    value="register"
                    className="space-y-4 animate-in fade-in-50 slide-in-from-right-2 duration-500"
                  >
                    <form onSubmit={registrationForm.handleSubmit(handleRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 group">
                          <Label
                            htmlFor="first-name"
                            className="text-sm font-medium text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-300"
                          >
                            First Name
                          </Label>
                          <div className="relative">
                            <svg
                              className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-300"
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
                              className={`pl-10 h-11 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:scale-105 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                                registrationForm.formState.errors.firstName
                                  ? "border-red-500 focus-visible:ring-red-500/20 animate-shake"
                                  : ""
                              }`}
                              {...registrationForm.register("firstName")}
                            />
                          </div>
                          {registrationForm.formState.errors.firstName && (
                            <Alert className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm animate-in slide-in-from-top-1 duration-300">
                              <AlertDescription className="text-red-800 dark:text-red-200 text-xs">
                                {registrationForm.formState.errors.firstName.message}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <div className="space-y-2 group">
                          <Label
                            htmlFor="last-name"
                            className="text-sm font-medium text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-300"
                          >
                            Last Name
                          </Label>
                          <div className="relative">
                            <svg
                              className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-300"
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
                              className={`pl-10 h-11 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:scale-105 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                                registrationForm.formState.errors.lastName
                                  ? "border-red-500 focus-visible:ring-red-500/20 animate-shake"
                                  : ""
                              }`}
                              {...registrationForm.register("lastName")}
                            />
                          </div>
                          {registrationForm.formState.errors.lastName && (
                            <Alert className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm animate-in slide-in-from-top-1 duration-300">
                              <AlertDescription className="text-red-800 dark:text-red-200 text-xs">
                                {registrationForm.formState.errors.lastName.message}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 group">
                        <Label
                          htmlFor="register-email"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-300"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-300"
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
                            className={`pl-10 h-11 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:scale-105 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                              registrationForm.formState.errors.email
                                ? "border-red-500 focus-visible:ring-red-500/20 animate-shake"
                                : ""
                            }`}
                            {...registrationForm.register("email")}
                          />
                          {registrationForm.formState.errors.email && (
                            <svg
                              className="absolute right-3 top-3 h-4 w-4 text-red-500 animate-bounce"
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
                          <Alert className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm animate-in slide-in-from-top-1 duration-300">
                            <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                              {registrationForm.formState.errors.email.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="space-y-2 group">
                        <Label
                          htmlFor="mobile"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-300"
                        >
                          Mobile Number
                        </Label>
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-300"
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
                            className={`pl-10 h-11 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:scale-105 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                              registrationForm.formState.errors.mobile
                                ? "border-red-500 focus-visible:ring-red-500/20 animate-shake"
                                : ""
                            }`}
                            {...registrationForm.register("mobile")}
                          />
                          {registrationForm.formState.errors.mobile && (
                            <svg
                              className="absolute right-3 top-3 h-4 w-4 text-red-500 animate-bounce"
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
                          <Alert className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm animate-in slide-in-from-top-1 duration-300">
                            <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                              {registrationForm.formState.errors.mobile.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="space-y-2 group">
                        <Label
                          htmlFor="register-password"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-300"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-300"
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
                            className={`pl-10 pr-10 h-11 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:scale-105 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                              registrationForm.formState.errors.password
                                ? "border-red-500 focus-visible:ring-red-500/20 animate-shake"
                                : ""
                            }`}
                            {...registrationForm.register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-300 hover:scale-110"
                          >
                            {showPassword ? (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <div className="space-y-2 animate-in fade-in-50 slide-in-from-top-1 duration-500">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600 dark:text-slate-400">Password strength:</span>
                              <span
                                className={`font-medium transition-colors duration-300 ${
                                  getPasswordStrength(passwordValue).strength >= 80
                                    ? "text-green-600 dark:text-green-400"
                                    : getPasswordStrength(passwordValue).strength >= 60
                                      ? "text-blue-600 dark:text-blue-400"
                                      : getPasswordStrength(passwordValue).strength >= 40
                                        ? "text-yellow-600 dark:text-yellow-400"
                                        : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {getPasswordStrength(passwordValue).label}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                                  getPasswordStrength(passwordValue).color
                                } shadow-sm`}
                                style={{
                                  width: `${getPasswordStrength(passwordValue).strength}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {registrationForm.formState.errors.password && (
                          <Alert className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm animate-in slide-in-from-top-1 duration-300">
                            <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                              {registrationForm.formState.errors.password.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="space-y-2 group">
                        <Label
                          htmlFor="confirm-password"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-300"
                        >
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-300"
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
                            className={`pl-10 pr-10 h-11 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:scale-105 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                              registrationForm.formState.errors.confirmPassword
                                ? "border-red-500 focus-visible:ring-red-500/20 animate-shake"
                                : ""
                            }`}
                            {...registrationForm.register("confirmPassword")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-300 hover:scale-110"
                          >
                            {showConfirmPassword ? (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <Alert className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm animate-in slide-in-from-top-1 duration-300">
                            <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                              {registrationForm.formState.errors.confirmPassword.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {registrationForm.formState.errors.root && (
                        <Alert className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm animate-in slide-in-from-top-1 duration-300">
                          <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                            {registrationForm.formState.errors.root.message}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        disabled={registrationForm.formState.isSubmitting || isLoading}
                        className="w-full h-12 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black dark:from-slate-200 dark:to-slate-100 dark:hover:from-slate-100 dark:hover:to-white text-white dark:text-slate-900 disabled:opacity-50 transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden group"
                      >
                        <span className="relative z-10">
                          {registrationForm.formState.isSubmitting || isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></div>
                              <span>Creating Account...</span>
                            </div>
                          ) : (
                            "Create Account"
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
