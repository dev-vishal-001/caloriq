"use client"

import React from "react"
import type { ReactElement } from "react"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useGetCaloriesMutation } from "@/features/user/userApi"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"
import {
  Loader2,
  Utensils,
  Hash,
  Sun,
  Moon,
  Quote,
  Apple,
  Coffee,
  Pizza,
  Salad,
  Cookie,
  IceCream,
  Sandwich,
  Cake,
  ChefHat,
  Heart,
  Star,
  Sparkles,
  LogOut,
  Search,
  TrendingUp,
  Award,
  Target,
  Clock,
  History,
  Lightbulb,
  BarChart3,
  Flame,
  Trophy,
  BookOpen,
  Activity,
} from "lucide-react"

const foodQuotes = [
  "Food is our common ground, a universal experience.",
  "Life is too short for bad food.",
  "Cooking is love made visible.",
  "Good food is the foundation of genuine happiness.",
  "The secret of cooking is to have a love of it.",
  "Food brings people together on many different levels.",
  "A recipe has no soul. You, as the cook, must bring soul to the recipe.",
  "Food is not just eating energy. It's an experience.",
  "The only thing I like better than talking about food is eating.",
  "Food is symbolic of love when words are inadequate.",
  "Eating good food is my favorite thing in the whole world.",
  "Food is the thread that weaves through our lives.",
  "Cooking is not about convenience. It's about love.",
  "Food is medicine and medicine is food.",
  "A balanced diet is a cookie in each hand.",
  "Food tastes better when you eat it with your family.",
]

const foodIcons = [Apple, Coffee, Pizza, Salad, Cookie, IceCream, Sandwich, Cake]

const quickFacts = [
  {
    icon: Heart,
    text: "Your body burns calories even while sleeping!",
    color: "text-red-500",
  },
  {
    icon: Star,
    text: "Spicy foods can boost your metabolism by up to 8%",
    color: "text-yellow-500",
  },
  {
    icon: Sparkles,
    text: "Drinking water before meals can help with portion control",
    color: "text-blue-500",
  },
  {
    icon: ChefHat,
    text: "Cooking at home saves an average of 200 calories per meal",
    color: "text-green-500",
  },
]

const nutritionTips = [
  {
    icon: Lightbulb,
    text: "Eat protein with every meal to stay fuller longer",
    color: "text-amber-500",
  },
  {
    icon: Activity,
    text: "Green tea can boost metabolism by 4-5%",
    color: "text-green-500",
  },
  {
    icon: BookOpen,
    text: "Fiber-rich foods help regulate blood sugar levels",
    color: "text-blue-500",
  },
  {
    icon: Trophy,
    text: "Small frequent meals can help maintain energy levels",
    color: "text-purple-500",
  },
]

export default function Dashboard(): ReactElement {
  const user = useAuthStore((state) => state.user)
  const [dishName, setDishName] = useState("")
  const [servings, setServings] = useState<number>(1)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showError, setShowError] = useState(false)
  const [buttonClicked, setButtonClicked] = useState(false)
  const [rippleEffect, setRippleEffect] = useState(false)
  const logout = useAuthStore((state) => state.signOut)
  const router = useRouter()
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [getCalories, { data, error, isLoading, reset }] = useGetCaloriesMutation()
  const [hasHydrated, setHasHydrated] = useState(false)
  const [dailyGoal] = useState(2000)
  const [dailyConsumed, setDailyConsumed] = useState(850)
  const [recentSearches] = useState(["Chicken Biryani", "Caesar Salad", "Green Smoothie"])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  useEffect(() => {
    setHasHydrated(true)
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(savedTheme === "dark" || (!savedTheme && prefersDark))
  }, [])

  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace("/")
    }
  }, [hasHydrated, user, router])

  useEffect(() => {
    if (hasHydrated) {
      if (isDarkMode) {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("theme", "light")
      }
    }
  }, [isDarkMode, hasHydrated])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % foodQuotes.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prevIndex) => (prevIndex + 1) % quickFacts.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % nutritionTips.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (data) {
      setShowResults(true)
      setShowError(false)
      setDailyConsumed((prev) => prev + data.calories_per_serving * data.servings)
    } else {
      setShowResults(false)
    }
  }, [data])

  useEffect(() => {
    if (error) {
      setShowError(true)
      setShowResults(false)
    } else {
      setShowError(false)
    }
  }, [error])

  if (!hasHydrated) return <p>Loading...</p>

  const handleFetch = () => {
    if (!dishName.trim()) return
    setButtonClicked(true)
    setRippleEffect(true)
    setShowResults(false)
    setShowError(false)
    getCalories({ dish_name: dishName.trim(), servings })
    setTimeout(() => {
      setButtonClicked(false)
      setRippleEffect(false)
    }, 600)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFetch()
    }
  }

  const handleClear = () => {
    setShowResults(false)
    setTimeout(() => {
      reset()
    }, 300)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const progressPercentage = Math.min((dailyConsumed / dailyGoal) * 100, 100)

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-900 transition-all duration-500">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-900 dark:to-red-900 rounded-full blur-xl animate-pulse-slow"></div>
        <div
          className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-r from-green-200 to-blue-200 dark:from-green-900 dark:to-blue-900 rounded-full blur-xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 rounded-full blur-xl animate-pulse-slow"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute bottom-32 right-10 w-18 h-18 bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-900 dark:to-orange-900 rounded-full blur-xl animate-pulse-slow"
          style={{ animationDelay: "6s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-r from-cyan-200 to-blue-200 dark:from-cyan-900 dark:to-blue-900 rounded-full blur-lg animate-bounce-slow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-14 h-14 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900 rounded-full blur-lg animate-bounce-slow"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      {/* Floating Food Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {foodIcons.map((Icon, index) => (
          <div
            key={index}
            className="absolute opacity-10 dark:opacity-5 animate-float-enhanced"
            style={{
              left: `${10 + index * 12}%`,
              top: `${20 + index * 8}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${4 + index * 0.5}s`,
            }}
          >
            <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-600 animate-spin-slow" />
          </div>
        ))}
      </div>

      <div className="relative z-10 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <Toaster />

          {/* Header with Welcome and Controls */}
          <div className="flex justify-between items-start mb-6">
            {/* Welcome Text - Left Top */}
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-black to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent animate-gradient-x">
                Welcome{" "}
                {user?.name
                  ? user.name.split(" ")[0].charAt(0).toUpperCase() + user.name.split(" ")[0].slice(1).toLowerCase()
                  : "User"}{" "}
                to
                <span className="block sm:inline sm:ml-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-extrabold animate-pulse">
                  CALORIQ
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1 animate-fade-in-up">
                Discover the nutritional value of your favorite dishes
              </p>
            </div>

            {/* Theme Toggle and Logout */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="group h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 hover:rotate-12 active:scale-95"
              >
                <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="group h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-yellow-50 dark:hover:bg-yellow-950/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 overflow-hidden relative"
              >
                <div className="relative">
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500 animate-spin-slow group-hover:animate-pulse" />
                  ) : (
                    <Moon className="h-5 w-5 text-blue-600 group-hover:animate-bounce" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              </Button>
            </div>
          </div>

          {/* Main Layout with Sidebar Features */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar Features */}
            <div className="lg:col-span-3 space-y-4">
              {/* Daily Goal Tracker */}
              <Card className="group bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-rotate-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500 animate-pulse" />
                    Daily Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {dailyConsumed}/{dailyGoal} cal
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000 ease-out animate-shimmer"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {dailyGoal - dailyConsumed > 0
                        ? `${dailyGoal - dailyConsumed} cal remaining`
                        : "Goal achieved! 🎉"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Searches */}
              <Card className="group bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:rotate-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-500 animate-bounce" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={search}
                      onClick={() => setDishName(search)}
                      className="w-full text-left p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-all duration-300 text-sm text-gray-700 dark:text-gray-300 hover:scale-105 active:scale-95 group/item"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animation: "fadeInUp 0.5s ease-out forwards",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-400 group-hover/item:text-blue-500 transition-colors" />
                        <span className="group-hover/item:animate-pulse">{search}</span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Center Content */}
            <div className="lg:col-span-6 space-y-6">
              {/* Quote Section */}
              <div className="text-center px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden h-16 sm:h-20 flex items-center justify-center">
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out transform"
                    key={currentQuoteIndex}
                    style={{
                      animation: "slideInFromRight 1s ease-in-out",
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 max-w-4xl">
                      <Quote className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 rotate-180 animate-pulse" />
                      <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 dark:text-gray-400 italic text-center leading-relaxed animate-fade-in">
                        {foodQuotes[currentQuoteIndex]}
                      </p>
                      <Quote className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Form */}
              <div className="flex flex-col items-center space-y-3 sm:space-y-4 max-w-sm sm:max-w-md mx-auto px-4">
                <div className="w-full space-y-3">
                  <div className="relative group">
                    <Input
                      placeholder="Enter dish name (e.g. chicken biryani)"
                      value={dishName}
                      onChange={(e) => setDishName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="h-11 sm:h-12 text-center text-base sm:text-lg border-2 border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-lg focus:shadow-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] focus:scale-[1.02] group-hover:border-gray-400 dark:group-hover:border-gray-500"
                    />
                    <Utensils className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 group-hover:animate-bounce" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>

                  <div className="relative group">
                    <Input
                      type="number"
                      min={1}
                      placeholder="Number of servings"
                      value={servings}
                      onChange={(e) => setServings(Number.parseInt(e.target.value) || 1)}
                      onKeyPress={handleKeyPress}
                      className="h-11 sm:h-12 text-center text-base sm:text-lg border-2 border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-lg focus:shadow-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] focus:scale-[1.02] group-hover:border-gray-400 dark:group-hover:border-gray-500"
                    />
                    <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 group-hover:animate-bounce" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button
                    onClick={handleFetch}
                    disabled={isLoading || !dishName.trim()}
                    className={`group relative h-11 sm:h-12 px-6 sm:px-8 bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 hover:from-gray-800 hover:to-black dark:hover:from-gray-200 dark:hover:to-white text-white dark:text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 w-full sm:w-auto overflow-hidden ${
                      buttonClicked ? "animate-button-click" : ""
                    } ${isLoading ? "animate-pulse-fast" : ""}`}
                  >
                    <div
                      className={`absolute inset-0 bg-white/20 rounded-xl transform scale-0 ${rippleEffect ? "animate-ripple" : ""}`}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          <span className="animate-pulse">Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-bounce" />
                          Get Calories
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  </Button>

                  {data && (
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      className="group relative h-11 sm:h-12 px-6 border-2 border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl bg-transparent backdrop-blur-sm transition-all duration-300 transform hover:scale-105 active:scale-95 w-full sm:w-auto shadow-lg hover:shadow-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex items-center justify-center">
                        <span className="group-hover:animate-pulse">Clear</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </Button>
                  )}
                </div>
              </div>

              {/* Results Section */}
              <div
                className={`transition-all duration-700 ease-out transform px-2 sm:px-4 ${
                  showResults
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-8 scale-95 pointer-events-none"
                }`}
              >
                {data && (
                  <Card
                    className={`w-full max-w-2xl mx-auto bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-black dark:border-white shadow-xl transition-all duration-600 transform hover:shadow-2xl hover:scale-[1.02] ${
                      showResults
                        ? "opacity-100 translate-y-0 scale-100 animate-card-appear"
                        : "opacity-0 translate-y-12 scale-90"
                    }`}
                  >
                    <CardHeader className="text-center pb-3 sm:pb-4">
                      <CardTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white flex items-center justify-center gap-2">
                        <Utensils className="h-5 w-5 sm:h-6 sm:w-6 animate-bounce" />
                        <span className="truncate animate-fade-in">{data.dish_name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center p-3 sm:p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:scale-105 group">
                          <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white animate-count-up group-hover:animate-pulse">
                            {data.servings}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Servings
                          </div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:scale-105 group">
                          <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white animate-count-up group-hover:animate-pulse">
                            {data.total_calories}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Total Calories
                          </div>
                        </div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:scale-105 group">
                        <div className="text-3xl sm:text-4xl font-bold text-black dark:text-white animate-count-up group-hover:animate-pulse">
                          {data.calories_per_serving}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Calories per Serving
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-black/80 backdrop-blur-sm inline-block px-3 sm:px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:shadow-sm transition-all duration-300 hover:scale-105 animate-fade-in">
                          📊 Source: {data.source}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Error Section */}
              <div
                className={`max-w-sm sm:max-w-md mx-auto px-4 transition-all duration-500 ease-in-out transform ${
                  showError
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                }`}
              >
                {error && (
                  <Card className="border-red-500 bg-red-50/80 dark:bg-red-950/50 backdrop-blur-sm animate-shake shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <CardContent className="p-3 sm:p-4">
                      <p className="text-red-600 dark:text-red-400 text-center text-sm sm:text-base flex items-center justify-center gap-2">
                        <Target className="h-5 w-5 animate-spin" />
                        {typeof error === "object" ? JSON.stringify(error) : String(error)}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Default Content */}
              {!showResults && !showError && (
                <>
                  <div className="max-w-md mx-auto px-4">
                    <Card className="group bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:rotate-1">
                      <CardContent className="p-4">
                        <div className="text-center space-y-3">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2 group-hover:animate-bounce">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Did You Know?
                          </h3>
                          <div
                            key={currentFactIndex}
                            className="transition-all duration-1000 ease-in-out"
                            style={{
                              animation: "slideInFromLeft 1s ease-in-out",
                            }}
                          >
                            <div className="flex items-center justify-center gap-3">
                              {React.createElement(quickFacts[currentFactIndex].icon, {
                                className: `h-6 w-6 ${quickFacts[currentFactIndex].color} animate-pulse`,
                              })}
                              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                {quickFacts[currentFactIndex].text}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="max-w-2xl mx-auto px-4">
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500 animate-bounce" />
                        Popular Searches
                      </h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          "🍛 Chicken Biryani",
                          "🥗 Caesar Salad",
                          "🍕 Margherita Pizza",
                          "🐟 Grilled Salmon",
                          "🍰 Chocolate Cake",
                          "🥤 Green Smoothie",
                        ].map((dish, index) => (
                          <button
                            key={dish}
                            onClick={() => {
                              const dishNameWithoutEmoji = dish
                                .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/gu, "")
                                .trim()
                              setDishName(dishNameWithoutEmoji)
                            }}
                            className="group px-3 py-1.5 text-sm bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 text-gray-700 dark:text-gray-300 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md relative overflow-hidden"
                            style={{
                              animationDelay: `${index * 0.1}s`,
                              animation: "fadeInUp 0.5s ease-out forwards",
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                            <span className="relative z-10 group-hover:animate-pulse">{dish}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Sidebar Features */}
            <div className="lg:col-span-3 space-y-4">
              {/* Nutrition Tips */}
              <Card className="group bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:rotate-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500 animate-pulse" />
                    Nutrition Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    key={currentTipIndex}
                    className="transition-all duration-1000 ease-in-out"
                    style={{
                      animation: "slideInFromRight 1s ease-in-out",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {React.createElement(nutritionTips[currentTipIndex].icon, {
                        className: `h-6 w-6 ${nutritionTips[currentTipIndex].color} animate-bounce flex-shrink-0 mt-0.5`,
                      })}
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {nutritionTips[currentTipIndex].text}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="group bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-rotate-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500 animate-bounce" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-all duration-300 group/stat">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500 group-hover/stat:animate-bounce" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Daily</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover/stat:animate-pulse">
                      1,850 cal
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-all duration-300 group/stat">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500 group-hover/stat:animate-bounce" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Streak</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover/stat:animate-pulse">
                      7 days
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-all duration-300 group/stat">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-500 group-hover/stat:animate-bounce" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Searches</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover/stat:animate-pulse">
                      42 total
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromRight {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInFromLeft {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float-enhanced {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          33% {
            transform: translateY(-15px) rotate(3deg) scale(1.1);
          }
          66% {
            transform: translateY(-25px) rotate(-3deg) scale(0.9);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes pulse-fast {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes button-click {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes count-up {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes card-appear {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          50% {
            opacity: 0.5;
            transform: translateY(15px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-float-enhanced {
          animation: float-enhanced 6s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-fast {
          animation: pulse-fast 0.5s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-in;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-button-click {
          animation: button-click 0.2s ease-in-out;
        }

        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-count-up {
          animation: count-up 0.8s ease-out;
        }

        .animate-card-appear {
          animation: card-appear 0.8s ease-out;
        }

        .animate-shimmer {
          background: linear-gradient(90deg, #10b981, #3b82f6, #10b981);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
