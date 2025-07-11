"use client";

import type React from "react";

import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  useCreateHistoryMutation,
  useDeleteHistoryByIdMutation,
  useGetCaloriesMutation,
} from "@/features/user/userApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Search,
  LogOut,
  Sun,
  Moon,
  Utensils,
  Target,
  Plus,
  History,
  Clock,
  Trash2,
} from "lucide-react";
import { useGetHistoryByEmailQuery } from "@/features/user/userApi";
import { Modal } from "antd";

const POPULAR_FOODS = [
  "Grilled Chicken Breast",
  "Quinoa Bowl",
  "Greek Salad",
  "Salmon Fillet",
  "Avocado Toast",
  "Protein Smoothie",
];

interface HistoryEntry {
  id: string;
  dish_name: string;
  calories_per_serving: number;
  servings: number;
  total_calories: number;
  timestamp: string;
  time: string;
}

export default function Dashboard(): ReactElement {
  const user = useAuthStore((state) => state.user);
  const [dishName, setDishName] = useState("");
  const [servings, setServings] = useState<number>(1);
  const [servingsInput, setServingsInput] = useState("1");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [nameError, setNameError] = useState("");
  const [servingsError, setServingsError] = useState("");
  const [searchHistory, setSearchHistory] = useState<HistoryEntry[]>([]);
  const logout = useAuthStore((state) => state.signOut);
  const router = useRouter();
  const [getCalories, { data, error, isLoading, reset }] =
    useGetCaloriesMutation();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [createHistory] = useCreateHistoryMutation();
  const { data: historyData } = useGetHistoryByEmailQuery(
    { email: user?.email || "" },
    { skip: !user?.email }
  );
  const [deleteHistoryById] = useDeleteHistoryByIdMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<HistoryEntry | null>(null);

  const [dailyGoal] = useState(2000);
  const [dailyConsumed, setDailyConsumed] = useState(1247);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    setHasHydrated(true);
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(savedTheme === "dark" || (!savedTheme && prefersDark));
  }, []);

  useEffect(() => {
    if (historyData?.history) {
      setSearchHistory(historyData.history);
      const total = historyData.history.reduce(
        (sum, entry) => sum + entry.total_calories,
        0
      );
      setDailyConsumed(total);
    }
  }, [historyData]);

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

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const validateForm = () => {
    let isValid = true;
    if (!dishName.trim()) {
      setNameError("Please enter a food item");
      isValid = false;
    } else if (dishName.trim().length < 2) {
      setNameError("Food name must be at least 2 characters");
      isValid = false;
    } else {
      setNameError("");
    }

    const servingsNum = Number(servingsInput);
    if (!servingsInput || isNaN(servingsNum) || servingsNum < 1) {
      setServingsError("Servings must be at least 1");
      isValid = false;
    } else if (servingsNum > 20) {
      setServingsError("Maximum 20 servings allowed");
      isValid = false;
    } else {
      setServingsError("");
      setServings(servingsNum);
    }

    return isValid;
  };

  const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and empty string
    if (value === "" || /^\d+$/.test(value)) {
      setServingsInput(value);
      if (value !== "" && !isNaN(Number(value))) {
        setServings(Number(value));
      }
    }
  };

  const handleAnalyze = () => {
    if (!validateForm()) return;
    getCalories({ dish_name: dishName.trim(), servings });
  };

  const handleClear = () => {
    setDishName("");
    setServings(1);
    setServingsInput("1");
    setNameError("");
    setServingsError("");
    reset();
  };

  const addToDailyLog = async () => {
    if (!data || !user?.email) return;

    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      dish_name: data.dish_name,
      calories_per_serving: data.calories_per_serving,
      servings: data.servings,
      total_calories: data.total_calories,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };

    const newEntryWithEmail = {
      ...newEntry,
      email: user.email,
    };

    try {
      await createHistory(newEntryWithEmail).unwrap();
      const updatedHistory = [newEntry, ...searchHistory];
      setSearchHistory(updatedHistory);
      setDailyConsumed((prev) => prev + data.total_calories);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

      console.log(
        "✅ Added to daily log & saved to backend:",
        newEntryWithEmail
      );
    } catch (error) {
      console.error("❌ Failed to save to backend:", error);
    }
  };

  const removeFromHistory = async (id: string) => {
    const entryToRemove = searchHistory.find((entry) => entry.id === id);
    if (!entryToRemove) return;

    try {
      await deleteHistoryById({ id }).unwrap();
      const updatedHistory = searchHistory.filter((entry) => entry.id !== id);
      setSearchHistory(updatedHistory);
      setDailyConsumed((prev) => prev - entryToRemove.total_calories);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

      console.log("✅ Removed from daily log & server:", entryToRemove);
    } catch (error) {
      console.error("❌ Failed to delete from server:", error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const progressPercentage = Math.min((dailyConsumed / dailyGoal) * 100, 100);
  const remainingCalories = Math.max(dailyGoal - dailyConsumed, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <Toaster />
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Utensils className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    CaloriQ
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Smart Nutrition Tracker
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block font-medium">
                Welcome, {user?.name?.split(" ")[0] || "User"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-10 w-10 rounded-full dark:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-10 w-10 rounded-full text-red-500  hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Analyze Food</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3">
                    <Input
                      placeholder="Enter food name (e.g., grilled chicken breast)"
                      value={dishName}
                      onChange={(e) => setDishName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                      className="h-12 text-base border-gray-200 dark:text-white dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    {nameError && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {nameError}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      placeholder="Servings"
                      value={servingsInput}
                      onChange={handleServingsChange}
                      className="h-12 text-base border-gray-200 dark:border-gray-700 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    {servingsError && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {servingsError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading || !dishName.trim()}
                    className="flex-1 sm:flex-none h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Analyze
                      </>
                    )}
                  </Button>
                  {(data || error) && (
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      className="h-12 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Popular Foods */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                    Popular searches:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_FOODS.map((food) => (
                      <button
                        key={food}
                        onClick={() => setDishName(food)}
                        className="text-sm px-4 dark:text-white py-2 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-full transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm"
                      >
                        {food}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {data && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-300 flex items-center space-x-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span>Analysis Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                        {data.dish_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Source: {data.source}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-sm">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {data.servings}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Servings
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-sm">
                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                          {data.calories_per_serving}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Per Serving
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-sm">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {data.total_calories}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Total
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={addToDailyLog}
                      className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg"
                      size="lg"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Add to Daily Log
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error */}
            {error && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <Target className="h-5 w-5" />
                    </div>
                    <span className="font-medium">
                      Unable to analyze this food item. Please try a different
                      name.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Daily Overview */}
          <div className="space-y-6">
            {/* Daily Progress */}
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>Daily Goal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {dailyConsumed}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    of {dailyGoal} calories
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={progressPercentage} className="h-4" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {Math.round(progressPercentage)}% complete
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {remainingCalories} remaining
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search History */}
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <History className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span>Today&apos;s Log</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {searchHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No entries yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Start tracking your meals!
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {searchHistory.map((entry, index) => (
                        <div key={entry.id}>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                {entry.dish_name}
                              </h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {entry.time}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {entry.servings} serving
                                  {entry.servings > 1 ? "s" : ""}
                                </span>
                                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                                  {entry.total_calories} cal
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEntryToDelete(entry);
                                setShowDeleteModal(true);
                              }}
                              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Modal
                            title="Confirm Deletion"
                            open={showDeleteModal}
                            onOk={async () => {
                              if (!entryToDelete) return;
                              await removeFromHistory(entryToDelete.id);
                              setShowDeleteModal(false);
                              setEntryToDelete(null);
                            }}
                            onCancel={() => {
                              setShowDeleteModal(false);
                              setEntryToDelete(null);
                            }}
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            okButtonProps={{
                              style: {
                                backgroundColor: "#d93025",
                                borderColor: "#d93025",
                                color: "#fff",
                              },
                            }}
                          >
                             <p>
                              Are you sure you want to delete{" "}
                              {entryToDelete?.dish_name} from your daily log?
                            </p>
                          </Modal>

                          {index < searchHistory.length - 1 && (
                            <Separator className="my-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
