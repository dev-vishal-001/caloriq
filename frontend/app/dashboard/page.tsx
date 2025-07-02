"use client";

import React from "react";

import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useGetCaloriesMutation } from "@/features/user/userApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import {
  Loader2,
  Utensils,
  Hash,
  Zap,
  Calculator,
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
} from "lucide-react";

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
];

const foodIcons = [
  Apple,
  Coffee,
  Pizza,
  Salad,
  Cookie,
  IceCream,
  Sandwich,
  Cake,
];

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
];

export default function Dashboard(): ReactElement {
  const user = useAuthStore((state) => state.user);

  // --- local UI state ---
  const [dishName, setDishName] = useState("");
  const [servings, setServings] = useState<number>(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showError, setShowError] = useState(false);

  const logout = useAuthStore((state) => state.signOut);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Quote rotation state
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // RTK‑Query mutation
  const [getCalories, { data, error, isLoading, reset }] =
    useGetCaloriesMutation();

  // Hydration guard (for SSR)
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(savedTheme === "dark" || (!savedTheme && prefersDark));
  }, []);

  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace("/");
    }
  }, [hasHydrated, user, router]);

  useEffect(() => {
    if (hasHydrated) {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  }, [isDarkMode, hasHydrated]);

  // Quote rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % foodQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fact rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prevIndex) => (prevIndex + 1) % quickFacts.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle data changes for animations
  useEffect(() => {
    if (data) {
      setShowResults(true);
      setShowError(false);
    } else {
      setShowResults(false);
    }
  }, [data]);

  // Handle error changes for animations
  useEffect(() => {
    if (error) {
      setShowError(true);
      setShowResults(false);
    } else {
      setShowError(false);
    }
  }, [error]);

  if (!hasHydrated) return <p>Loading...</p>;

  // --- event handlers ---
  const handleFetch = () => {
    if (!dishName.trim()) return;
    setShowResults(false);
    setShowError(false);
    getCalories({ dish_name: dishName.trim(), servings });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFetch();
    }
  };

  const handleClear = () => {
    setShowResults(false);
    setTimeout(() => {
      reset();
    }, 300);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-900 transition-all duration-500">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-900 dark:to-red-900 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-r from-green-200 to-blue-200 dark:from-green-900 dark:to-blue-900 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute bottom-32 right-10 w-18 h-18 bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-900 dark:to-orange-900 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "6s" }}
        ></div>
      </div>

      {/* Floating Food Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {foodIcons.map((Icon, index) => (
          <div
            key={index}
            className="absolute opacity-10 dark:opacity-5 animate-float"
            style={{
              left: `${10 + index * 12}%`,
              top: `${20 + index * 8}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${4 + index * 0.5}s`,
            }}
          >
            <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-600" />
          </div>
        ))}
      </div>

      <div className="relative z-10 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-2 sm:space-y-3">
          {/* Theme Toggle - Fixed position on mobile */}
          <Toaster />
          <div className="flex justify-end gap-3 pr-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="text-lg font-semibold text-black dark:text-white">
                ⎋
              </span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-black dark:text-white" />
              ) : (
                <Moon className="h-5 w-5 text-black" />
              )}
            </Button>
          </div>

          {/* Rotating Quote Section */}
          <div className="text-center px-4 sm:px-6 lg:px-8 -mt-2 sm:-mt-3">
            <div className="relative overflow-hidden h-16 sm:h-20 flex items-center justify-center">
              <div
                className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out transform"
                key={currentQuoteIndex}
                style={{
                  animation: "fadeInUp 1s ease-in-out",
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3 max-w-4xl">
                  <Quote className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 rotate-180" />
                  <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 dark:text-gray-400 italic text-center leading-relaxed">
                    {foodQuotes[currentQuoteIndex]}
                  </p>
                  <Quote className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Header with enhanced styling */}
          <div className="text-center space-y-1 px-2 mt-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-black to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Welcome {user?.name || "User"} to CALORIQ
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg px-4">
              Discover the nutritional value of your favorite dishes
            </p>
          </div>

          {/* Enhanced Input Section */}
          <div className="flex flex-col items-center space-y-3 sm:space-y-4 max-w-sm sm:max-w-md mx-auto px-4">
            <div className="w-full space-y-3">
              <div className="relative">
                <Input
                  placeholder="Enter dish name (e.g. chicken biryani)"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-11 sm:h-12 text-center text-base sm:text-lg border-2 border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-lg focus:shadow-xl transition-all duration-200"
                />
                <Utensils className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  placeholder="Number of servings"
                  value={servings}
                  onChange={(e) =>
                    setServings(Number.parseInt(e.target.value) || 1)
                  }
                  onKeyPress={handleKeyPress}
                  className="h-11 sm:h-12 text-center text-base sm:text-lg border-2 border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-lg focus:shadow-xl transition-all duration-200"
                />
                <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            {/* Enhanced Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={handleFetch}
                disabled={isLoading || !dishName.trim()}
                className="h-11 sm:h-12 px-6 sm:px-8 bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 hover:from-gray-800 hover:to-black dark:hover:from-gray-200 dark:hover:to-white text-white dark:text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Get Calories
                  </>
                )}
              </Button>
              {data && (
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="h-11 sm:h-12 px-6 border-2 border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl bg-transparent backdrop-blur-sm transition-all duration-200 transform hover:scale-105 w-full sm:w-auto shadow-lg hover:shadow-xl"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Quick Facts Section - Only show when no results */}
          {!showResults && !showError && (
            <div className="max-w-md mx-auto px-4 mt-8">
              <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2">
                      Did You Know?
                    </h3>
                    <div
                      key={currentFactIndex}
                      className="transition-all duration-1000 ease-in-out"
                      style={{
                        animation: "fadeInUp 1s ease-in-out",
                      }}
                    >
                      <div className="flex items-center justify-center gap-3">
                        {React.createElement(
                          quickFacts[currentFactIndex].icon,
                          {
                            className: `h-6 w-6 ${quickFacts[currentFactIndex].color}`,
                          }
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          {quickFacts[currentFactIndex].text}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Popular Dishes Suggestion - Only show when no results */}
          {!showResults && !showError && (
            <div className="max-w-2xl mx-auto px-4 mt-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
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
                  ].map((dish) => (
                    <button
                      key={dish}
                      onClick={() => {
                        const dishNameWithoutEmoji = dish
                          .replace(
                            /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/g,
                            ""
                          )
                          .trim();
                        setDishName(dishNameWithoutEmoji);
                      }}
                      className="px-3 py-1.5 text-sm bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      {dish}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Display with Animation */}
          <div
            className={`max-w-sm sm:max-w-md mx-auto px-4 transition-all duration-500 ease-in-out transform ${
              showError
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
            }`}
          >
            {error && (
              <Card className="border-red-500 bg-red-50/80 dark:bg-red-950/50 backdrop-blur-sm animate-pulse shadow-xl">
                <CardContent className="p-3 sm:p-4">
                  <p className="text-red-600 dark:text-red-400 text-center text-sm sm:text-base">
                    ❌{" "}
                    {typeof error === "object"
                      ? JSON.stringify(error)
                      : String(error)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Display - Same as before but with enhanced backdrop */}
          <div
            className={`transition-all duration-700 ease-out transform px-2 sm:px-4 ${
              showResults
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95 pointer-events-none"
            }`}
          >
            {data && (
              <div className="w-full max-w-6xl mx-auto">
                {/* Mobile Layout - Enhanced with backdrop blur */}
                <div className="block lg:hidden space-y-4">
                  <Card
                    className={`w-full bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-black dark:border-white shadow-xl transition-all duration-600 transform ${
                      showResults
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-12 scale-90"
                    }`}
                    style={{
                      transitionDelay: showResults ? "100ms" : "0ms",
                    }}
                  >
                    <CardHeader className="text-center pb-3 sm:pb-4">
                      <CardTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white flex items-center justify-center gap-2">
                        <Utensils className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="truncate">{data.dish_name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center p-3 sm:p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                          <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white animate-pulse">
                            {data.servings}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Servings
                          </div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                          <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white animate-pulse">
                            {data.total_calories}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Total Calories
                          </div>
                        </div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                        <div className="text-3xl sm:text-4xl font-bold text-black dark:text-white animate-pulse">
                          {data.calories_per_serving}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Calories per Serving
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-black/80 backdrop-blur-sm inline-block px-3 sm:px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:shadow-sm transition-shadow duration-200">
                          📊 Source: {data.source}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional info cards with backdrop blur */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[
                      {
                        icon: Utensils,
                        title: "Dish",
                        value: data.dish_name,
                        delay: "200ms",
                      },
                      {
                        icon: Hash,
                        title: "Servings",
                        value: data.servings,
                        delay: "300ms",
                      },
                      {
                        icon: Zap,
                        title: "Per Serving",
                        value: `${data.calories_per_serving} calories`,
                        delay: "400ms",
                      },
                      {
                        icon: Calculator,
                        title: "Total",
                        value: `${data.total_calories} calories`,
                        delay: "500ms",
                      },
                    ].map((item, index) => (
                      <Card
                        key={item.title}
                        className={`group hover:shadow-lg transition-all duration-500 hover:-translate-y-1 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-700 transform ${
                          showResults
                            ? "opacity-100 translate-x-0 rotate-0"
                            : `opacity-0 ${
                                index % 2 === 0
                                  ? "-translate-x-8"
                                  : "translate-x-8"
                              } ${index % 2 === 0 ? "-rotate-3" : "rotate-3"}`
                        }`}
                        style={{
                          transitionDelay: showResults ? item.delay : "0ms",
                        }}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 text-black dark:text-white">
                            <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="font-semibold text-black dark:text-white text-xs sm:text-sm truncate">
                            {typeof item.value === "string" &&
                            item.value.includes("calories") ? (
                              <>
                                <span className="text-lg sm:text-2xl">
                                  {item.value.split(" ")[0]}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                                  {item.value.split(" ").slice(1).join(" ")}
                                </span>
                              </>
                            ) : (
                              <span
                                className={
                                  item.title === "Dish"
                                    ? "text-xs sm:text-sm"
                                    : "text-lg sm:text-2xl"
                                }
                              >
                                {item.value}
                              </span>
                            )}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Desktop Layout - Enhanced with backdrop blur */}
                <div className="hidden lg:flex items-center justify-center gap-6">
                  {/* Left Side Cards */}
                  <div className="flex flex-col gap-4">
                    <Card
                      className={`w-48 h-32 group hover:shadow-lg transition-all duration-500 hover:-translate-y-1 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-700 transform ${
                        showResults
                          ? "opacity-100 translate-x-0 rotate-0"
                          : "opacity-0 -translate-x-8 -rotate-3"
                      }`}
                      style={{
                        transitionDelay: showResults ? "200ms" : "0ms",
                      }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-black dark:text-white">
                          <Utensils className="h-4 w-4" />
                          Dish
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="font-semibold text-black dark:text-white text-sm truncate">
                          {data.dish_name}
                        </p>
                      </CardContent>
                    </Card>
                    <Card
                      className={`w-48 h-32 group hover:shadow-lg transition-all duration-500 hover:-translate-y-1 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-700 transform ${
                        showResults
                          ? "opacity-100 translate-x-0 rotate-0"
                          : "opacity-0 -translate-x-8 rotate-3"
                      }`}
                      style={{
                        transitionDelay: showResults ? "400ms" : "0ms",
                      }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-black dark:text-white">
                          <Hash className="h-4 w-4" />
                          Servings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="font-semibold text-black dark:text-white text-2xl">
                          {data.servings}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Result Card */}
                  <Card
                    className={`w-80 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-black dark:border-white shadow-xl transition-all duration-600 transform ${
                      showResults
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-12 scale-90"
                    }`}
                    style={{
                      transitionDelay: showResults ? "300ms" : "0ms",
                    }}
                  >
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold text-black dark:text-white flex items-center justify-center gap-2">
                        <Utensils className="h-6 w-6" />
                        {data.dish_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                          <div className="text-3xl font-bold text-black dark:text-white animate-pulse">
                            {data.servings}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Servings
                          </div>
                        </div>
                        <div className="text-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                          <div className="text-3xl font-bold text-black dark:text-white animate-pulse">
                            {data.total_calories}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Total Calories
                          </div>
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                        <div className="text-4xl font-bold text-black dark:text-white animate-pulse">
                          {data.calories_per_serving}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Calories per Serving
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-black/80 backdrop-blur-sm inline-block px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:shadow-sm transition-shadow duration-200">
                          📊 Source: {data.source}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right Side Cards */}
                  <div className="flex flex-col gap-4">
                    <Card
                      className={`w-48 h-32 group hover:shadow-lg transition-all duration-500 hover:-translate-y-1 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-700 transform ${
                        showResults
                          ? "opacity-100 translate-x-0 rotate-0"
                          : "opacity-0 translate-x-8 rotate-3"
                      }`}
                      style={{
                        transitionDelay: showResults ? "500ms" : "0ms",
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2 text-black dark:text-white">
                          <Zap className="h-4 w-4" />
                          Per Serving
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="-mt-4">
                        <p className="font-semibold text-black dark:text-white text-2xl">
                          {data.calories_per_serving}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          calories
                        </p>
                      </CardContent>
                    </Card>
                    <Card
                      className={`w-48 h-32 group hover:shadow-lg transition-all duration-500 hover:-translate-y-1 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-700 transform ${
                        showResults
                          ? "opacity-100 translate-x-0 rotate-0"
                          : "opacity-0 translate-x-8 -rotate-3"
                      }`}
                      style={{
                        transitionDelay: showResults ? "700ms" : "0ms",
                      }}
                    >
                      <CardHeader className="pb-30">
                        <CardTitle className="text-sm flex items-center gap-2 text-black dark:text-white">
                          <Calculator className="h-4 w-4" />
                          Total
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="-mt-4">
                        <p className="font-semibold text-black dark:text-white text-2xl">
                          {data.total_calories}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          calories
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
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

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
