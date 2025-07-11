"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterMutation, useSignInMutation } from "@/features/user/userApi";
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { Check, X, AlertCircle, Info, Phone } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";


type SignInFormData = z.infer<typeof signInSchema>;
type RegistrationFormData = z.infer<ReturnType<typeof createRegistrationSchema>>;
interface PhoneValidationPopupProps {
  phoneNumber: string;
  countryCode: string;
  selectedCountryData: (typeof countries)[0];
  children: React.ReactNode;
}

const countries = [
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    dialCode: "+91",
    minLength: 10,
    maxLength: 10,
    example: "9876543210",
    description: "Must be 10 digits, starts with 6-9",
    formatExample: "98765 43210",
    startDigits: [6, 7, 8, 9],
    invalidStartMessage: "Indian mobile numbers must start with 6, 7, 8, or 9",
  },
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    dialCode: "+1",
    minLength: 10,
    maxLength: 10,
    example: "2025550136",
    description: "10 digits, area code can't start with 0 or 1",
    formatExample: "(202) 555-0136",
    startDigits: [2, 3, 4, 5, 6, 7, 8, 9],
    invalidStartMessage: "US numbers cannot start with 0 or 1",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    dialCode: "+1",
    minLength: 10,
    maxLength: 10,
    example: "4165551234",
    description: "10 digits, area code can't start with 0 or 1",
    formatExample: "(416) 555-1234",
    startDigits: [2, 3, 4, 5, 6, 7, 8, 9],
    invalidStartMessage: "Canadian numbers cannot start with 0 or 1",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    dialCode: "+44",
    minLength: 10,
    maxLength: 10,
    example: "7123456789",
    description: "Starts with 7, total 10 digits",
    formatExample: "7123 456789",
    startDigits: [7],
    invalidStartMessage: "UK mobile numbers must start with 7",
  },
  {
    code: "AE",
    name: "UAE",
    flag: "🇦🇪",
    dialCode: "+971",
    minLength: 9,
    maxLength: 9,
    example: "501234567",
    description: "Starts with 50-58, 9 digits total",
    formatExample: "50 123 4567",
    startDigits: [5],
    invalidStartMessage: "UAE mobile numbers must start with 50-58",
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    dialCode: "+61",
    minLength: 9,
    maxLength: 9,
    example: "412345678",
    description: "Starts with 4, 9 digits total",
    formatExample: "412 345 678",
    startDigits: [4],
    invalidStartMessage: "Australian mobile numbers must start with 4",
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    dialCode: "+49",
    minLength: 10,
    maxLength: 11,
    example: "15123456789",
    description: "Starts with 15, 16, or 17, 10-11 digits",
    formatExample: "1512 3456789",
    startDigits: [1],
    invalidStartMessage: "German mobile numbers must start with 15, 16, or 17",
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    dialCode: "+33",
    minLength: 9,
    maxLength: 9,
    example: "612345678",
    description: "Starts with 6 or 7, 9 digits total",
    formatExample: "6 12 34 56 78",
    startDigits: [6, 7],
    invalidStartMessage: "French mobile numbers must start with 6 or 7",
  },
  {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    dialCode: "+55",
    minLength: 11,
    maxLength: 11,
    example: "11912345678",
    description: "11 digits, 3rd digit must be 9 for mobile",
    formatExample: "11 91234-5678",
    startDigits: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    invalidStartMessage: "Brazilian mobile numbers: 3rd digit must be 9",
  },
  {
    code: "PK",
    name: "Pakistan",
    flag: "🇵🇰",
    dialCode: "+92",
    minLength: 10,
    maxLength: 10,
    example: "3001234567",
    description: "10 digits, starts with 3",
    formatExample: "300 1234567",
    startDigits: [3],
    invalidStartMessage: "Pakistani mobile numbers must start with 3",
  },
  {
    code: "BD",
    name: "Bangladesh",
    flag: "🇧🇩",
    dialCode: "+880",
    minLength: 10,
    maxLength: 10,
    example: "1712345678",
    description: "10 digits, starts with 13-19",
    formatExample: "17 1234 5678",
    startDigits: [1],
    invalidStartMessage: "Bangladeshi mobile numbers must start with 13-19",
  },
];

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});


const getContextualValidationMessage = (
  phoneNumber: string,
  countryData: (typeof countries)[0]
) => {
  const cleanNumber = phoneNumber.replace(/[\s\-()]/g, "");
  if (cleanNumber.length === 0) return null;

  const firstDigit = Number.parseInt(cleanNumber[0]);
  if (!countryData.startDigits.includes(firstDigit)) {
    return {
      type: "error",
      message: countryData.invalidStartMessage,
      icon: AlertCircle,
    };
  }

  switch (countryData.code) {
    case "AE":
      if (cleanNumber.length >= 2 && !/^5[0-8]/.test(cleanNumber)) {
        return {
          type: "error",
          message: "Second digit must be 0-8 (50, 51, 52... 58)",
          icon: AlertCircle,
        };
      }
      break;
    case "DE":
      if (cleanNumber.length >= 2 && !/^1[5-7]/.test(cleanNumber)) {
        return {
          type: "error",
          message: "Must start with 15, 16, or 17",
          icon: AlertCircle,
        };
      }
      break;
    case "BR":
      if (cleanNumber.length >= 3 && cleanNumber[2] !== "9") {
        return {
          type: "error",
          message: "Third digit must be 9 for mobile numbers",
          icon: AlertCircle,
        };
      }
      break;
    case "BD":
      if (cleanNumber.length >= 2 && !/^1[3-9]/.test(cleanNumber)) {
        return {
          type: "error",
          message: "Must start with 13, 14, 15, 16, 17, 18, or 19",
          icon: AlertCircle,
        };
      }
      break;
  }

  if (cleanNumber.length < countryData.minLength) {
    return {
      type: "warning",
      message: `Need ${countryData.minLength - cleanNumber.length} more digit${
        countryData.minLength - cleanNumber.length > 1 ? "s" : ""
      }`,
      icon: Info,
    };
  }

  if (cleanNumber.length > countryData.maxLength) {
    return {
      type: "error",
      message: `Too long! Maximum ${countryData.maxLength} digits`,
      icon: AlertCircle,
    };
  }

  return null;
};

const createMobileValidation = (selectedCountry: string) => {
  const country =
    countries.find((c) => c.code === selectedCountry) || countries[0];

  return z
    .string()
    .min(1, "Mobile number is required")
    .transform((val) => val.replace(/[\s\-()]/g, ""))
    .refine(
      (cleanNumber) => {
        const fullNumber = `${country.dialCode}${cleanNumber}`;
        const phoneNumber = parsePhoneNumberFromString(fullNumber, country.code as CountryCode);
        return phoneNumber && phoneNumber.isValid();
      },
      {
        message: `Please enter a valid ${country.name} mobile number`,
      }
    )
    .refine(
      (cleanNumber) => {
        // Check for obvious fake numbers
        const fakePatterns = [
          /^1{8,}$/, // All 1s
          /^0{8,}$/, // All 0s
          /^1234567890$/, // Sequential
          /^0987654321$/, // Reverse sequential
          /^(\d)\1{7,}$/, // Repeated digits
        ];
        return !fakePatterns.some((pattern) => pattern.test(cleanNumber));
      },
      {
        message: "Please enter a genuine mobile number",
      }
    );
};

const PhoneValidationPopup = ({
  phoneNumber,
  selectedCountryData,
  children,
}: PhoneValidationPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const cleanNumber = phoneNumber.replace(/[\s\-()]/g, "");
  const fullNumber = `${selectedCountryData.dialCode}${cleanNumber}`;

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        inputContainerRef.current &&
        !inputContainerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show popup when phone number has input and input is focused
  useEffect(() => {
    if (cleanNumber.length > 0) {
      const inputElement = inputContainerRef.current?.querySelector("input");
      if (inputElement === document.activeElement) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [phoneNumber, cleanNumber]);

  // Get contextual message
  const contextualMessage = getContextualValidationMessage(
    phoneNumber,
    selectedCountryData
  );

  // Validation checks
  const checks = [
    {
      id: "length",
      label: "Length",
      status:
        cleanNumber.length >= selectedCountryData.minLength &&
        cleanNumber.length <= selectedCountryData.maxLength,
    },
    {
      id: "format",
      label: "Format",
      status: (() => {
        try {
          const phoneNumber = parsePhoneNumberFromString(
            fullNumber,
            selectedCountryData.code as CountryCode
          );
          return phoneNumber ? phoneNumber.isValid() : false;
        } catch {
          return false;
        }
      })(),
    },
    {
      id: "genuine",
      label: "Genuine",
      status: (() => {
        if (cleanNumber.length < 8) return null; // Not enough digits to check
        const fakePatterns = [
          /^1{8,}$/,
          /^0{8,}$/,
          /^1234567890$/,
          /^0987654321$/,
          /^(\d)\1{7,}$/,
        ];
        return !fakePatterns.some((pattern) => pattern.test(cleanNumber));
      })(),
    },
  ];

  const overallValid = checks.every((check) => check.status === true);
  const hasValidationIssue =
    contextualMessage && contextualMessage.type === "error";

  return (
    <div className="relative" ref={popupRef}>
      <div
        ref={inputContainerRef}
        onFocus={() => cleanNumber.length > 0 && setIsVisible(true)}
      >
        {children}
      </div>

      {isVisible && (
        <div className="fixed md:absolute top-100 md:top-0 right-4 md:right-0 z-[9999] md:translate-x-full md:-translate-y-1 w-[calc(100%-2rem)] max-w-xs md:w-52 md:max-w-none ml-3">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-lg p-3 text-xs backdrop-blur-sm">
            {/* Compact Header */}
            <div
              className={`flex items-center space-x-2 mb-2 p-1.5 rounded ${
                hasValidationIssue
                  ? "bg-red-50 dark:bg-red-950/20"
                  : overallValid
                  ? "bg-green-50 dark:bg-green-950/20"
                  : "bg-amber-50 dark:bg-amber-950/20"
              }`}
            >
              {hasValidationIssue ? (
                <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
              ) : overallValid ? (
                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
              ) : (
                <Info className="w-3 h-3 text-amber-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium text-xs ${
                    hasValidationIssue
                      ? "text-red-700 dark:text-red-300"
                      : overallValid
                      ? "text-green-700 dark:text-green-300"
                      : "text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {hasValidationIssue
                    ? "Invalid"
                    : overallValid
                    ? "Valid"
                    : "Checking..."}
                </div>
              </div>
              {overallValid && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>

            {/* Contextual Message */}
            {contextualMessage && (
              <div
                className={`flex items-start space-x-1.5 mb-2 p-1.5 rounded text-xs ${
                  contextualMessage.type === "error"
                    ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300"
                    : "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300"
                }`}
              >
                <contextualMessage.icon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="leading-tight">
                  {contextualMessage.message}
                </span>
              </div>
            )}

            {/* Compact Validation Checks */}
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {checks.map((check) => (
                <div key={check.id} className="flex items-center space-x-1.5">
                  {check.status === true ? (
                    <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                  ) : check.status === false ? (
                    <X className="w-3 h-3 text-red-500 flex-shrink-0" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      check.status === true
                        ? "text-green-700 dark:text-green-300"
                        : check.status === false
                        ? "text-red-700 dark:text-red-300"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {check.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini Progress Bar */}
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>
                  {checks.filter((c) => c.status === true).length}/
                  {checks.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    hasValidationIssue
                      ? "bg-red-500"
                      : overallValid
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                  style={{
                    width: `${
                      (checks.filter((c) => c.status === true).length /
                        checks.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const handleMobileInput = (
  value: string,
  country: (typeof countries)[0],
  setValue: (value: string) => void
) => {
  let cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length > country.maxLength) {
    cleanValue = cleanValue.slice(0, country.maxLength);
  }

  // Country-specific input restrictions (keeping existing logic)
  switch (country.code) {
    case "IN":
      if (cleanValue.length > 0 && !/^[6-9]/.test(cleanValue)) {
        cleanValue = cleanValue.replace(/^[^6-9]/, "");
      }
      break;
    case "US":
    case "CA":
      if (cleanValue.length > 0 && /^[01]/.test(cleanValue)) {
        cleanValue = cleanValue.replace(/^[01]/, "");
      }
      if (cleanValue.length >= 4 && /^.{3}[01]/.test(cleanValue)) {
        cleanValue = cleanValue.slice(0, 3) + cleanValue.slice(4);
      }
      break;
    case "GB":
      if (cleanValue.length > 0 && !/^7/.test(cleanValue)) {
        cleanValue = cleanValue.replace(/^[^7]/, "");
      }
      break;
    case "AE":
      if (cleanValue.length > 0 && !/^5/.test(cleanValue)) {
        cleanValue = cleanValue.replace(/^[^5]/, "");
      }
      if (cleanValue.length >= 2 && !/^5[0-8]/.test(cleanValue)) {
        cleanValue = cleanValue.slice(0, 1) + cleanValue.slice(2);
      }
      break;
    case "AU":
      if (cleanValue.length > 0 && !/^4/.test(cleanValue)) {
        cleanValue = cleanValue.replace(/^[^4]/, "");
      }
      break;
    case "DE":
      if (cleanValue.length > 0 && !/^1/.test(cleanValue)) {
        cleanValue = cleanValue.replace(/^[^1]/, "");
      }
      if (cleanValue.length >= 2 && !/^1[5-7]/.test(cleanValue)) {
        cleanValue = cleanValue.slice(0, 1) + cleanValue.slice(2);
      }
      break;
    case "FR":
      if (cleanValue.length > 0 && !/^[67]/.test(cleanValue)) {
        cleanValue = cleanValue.replace(/^[^67]/, "");
      }
      break;
    case "BR":
      if (cleanValue.length >= 3 && cleanValue[2] !== "9") {
        cleanValue = cleanValue.slice(0, 2) + "9" + cleanValue.slice(3);
      }
      break;
    case "PK":
      if (cleanValue.length > 0 && !/^3/.test(cleanValue)) {
        cleanValue = cleanValue.replace(/^[^3]/, "");
      }
      break;
    case "BD":
      if (cleanValue.length > 0 && !/^1/.test(cleanValue)) {
        cleanValue = cleanValue.replace(/^[^1]/, "");
      }
      if (cleanValue.length >= 2 && !/^1[3-9]/.test(cleanValue)) {
        cleanValue = cleanValue.slice(0, 1) + cleanValue.slice(2);
      }
      break;
  }

  setValue(cleanValue);
};

const formatMobileNumber = (value: string, country: (typeof countries)[0]) => {
  const cleanValue = value.replace(/\D/g, "");

  try {
    const fullNumber = `${country.dialCode}${cleanValue}`;
    const phoneNumber = parsePhoneNumberFromString(fullNumber, country.code as CountryCode);
    if (phoneNumber && cleanValue.length >= country.minLength) {
      const formatted = phoneNumber.formatNational().replace(/^0+/, "");
      return formatted;
    }
  } catch (error) {
    console.warn("Phone number formatting failed, falling back:", error);
  }

  // Fallback to manual formatting
  switch (country.code) {
    case "IN":
      return cleanValue.replace(/(\d{5})(\d{5})/, "$1 $2");
    case "US":
    case "CA":
      return cleanValue.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    case "GB":
      return cleanValue.replace(/(\d{4})(\d{6})/, "$1 $2");
    case "AE":
      return cleanValue.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3");
    case "AU":
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
    case "DE":
      return cleanValue.replace(/(\d{4})(\d{7})/, "$1 $2");
    case "FR":
      return cleanValue.replace(
        /(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/,
        "$1 $2 $3 $4 $5"
      );
    case "BR":
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, "$1 $2-$3");
    case "PK":
      return cleanValue.replace(/(\d{3})(\d{7})/, "$1 $2");
    case "BD":
      return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, "$1 $2 $3");
    default:
      return cleanValue;
  }
};


export interface RegistrationRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  mobile: string;
  countryCode: string;
  fullMobileNumber?: string;
}

const createRegistrationSchema = (selectedCountry: string) => z
    .object({
      firstName: z
        .string()
        .min(1, "First name is required")
        .min(2, "First name must be at least 2 characters long")
        .regex(
          /^[a-zA-Z\s]+$/,
          "First name can only contain letters and spaces"
        ),
      lastName: z
        .string()
        .min(1, "Last name is required")
        .min(2, "Last name must be at least 2 characters long")
        .regex(
          /^[a-zA-Z\s]+$/,
          "Last name can only contain letters and spaces"
        ),
      email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
      countryCode: z.string().min(1, "Please select a country"),
      mobile: createMobileValidation(selectedCountry),
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

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const { signIn } = useAuthStore();
  const [triggerSignIn, { isLoading }] = useSignInMutation()
  
  const [triggerRegister] = useRegisterMutation();
  const [activeTab, setActiveTab] = useState("signin");
  const router = useRouter();
  const [loginProgress, setLoginProgress] = useState(0);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const registrationForm = useForm<RegistrationFormData>({
    resolver: zodResolver(createRegistrationSchema(selectedCountry)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      countryCode: selectedCountry,
      mobile: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    registrationForm.setValue("countryCode", countryCode);
    registrationForm.clearErrors("mobile");
    registrationForm.setValue("mobile", "");
    const currentMobile = registrationForm.getValues("mobile");
    if (currentMobile) {
      registrationForm.trigger("mobile");
    }
  };

  const passwordValue = registrationForm.watch("password");
  const mobileValue = registrationForm.watch("mobile");

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

  const simulateLoginProgress = () => {
    setLoginProgress(0);
    const interval = setInterval(() => {
      setLoginProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
    return interval;
  };

  const handleSignIn = async (data: SignInFormData) => {
    setLoginSuccess(false)
    const progressInterval = simulateLoginProgress()
    try {
      const result = await triggerSignIn({
        ...data,
        rememberMe: data.rememberMe ?? false,
      }).unwrap()

      if (!result.exists) {
        clearInterval(progressInterval)
        setLoginProgress(0)
        signInForm.setError("root", { message: "Invalid email or password" })
        toast("❌ Invalid credentials", {
          description: "Please check your email and password.",
          className: "bg-red-500 text-white border border-red-600",
        })
        return
      }
      clearInterval(progressInterval)
      setLoginProgress(100)
      setLoginSuccess(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      signIn({ user: result.user, token: result.token })
      toast(`👋 Welcome back, ${result.user.name}!`, {
        description: "You're now signed in.",
        duration: 3000,
      })
      router.push("/dashboard")
    } catch (err: unknown) {
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
      setLoginProgress(0)
      setLoginSuccess(false)
    }
  }

  const handleRegister = async (data: RegistrationFormData) => {
    try {
      const selectedCountryData =
        countries.find((c) => c.code === selectedCountry) || countries[0];
      const cleanMobileNumber = data.mobile.replace(/[\s\-()]/g, "");
      const fullMobileNumber = `${selectedCountryData.dialCode}${cleanMobileNumber}`;

      const registrationData = {
        ...data,
        fullMobileNumber,
        mobile: cleanMobileNumber,
      };

      console.log("📱 Registration data with full mobile number:", {
        mobile: registrationData.mobile,
        countryCode: registrationData.countryCode,
        fullMobileNumber: registrationData.fullMobileNumber,
      });

      const result = await triggerRegister(registrationData).unwrap();
      
      console.log("✅ Registration result:", result);

      if (result.exists) {
        registrationForm.setError("root", {
          message: "User already registered.",
        });
        return;
      }

      if (result.user) {
        toast("🎉 Registration complete!", {
          description: `Account created with mobile: ${fullMobileNumber}`,
          duration: 4000,
        });
        registrationForm.reset();
        setActiveTab("signin");
      } else {
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

  const selectedCountryData =
    countries.find((c) => c.code === selectedCountry) || countries[0];

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-all duration-700">
        {/* Modern Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-orange-400/10 dark:from-pink-500/20 dark:to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-400/5 to-blue-400/5 dark:from-green-500/10 dark:to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="w-11 h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 group"
          >
            {isDarkMode ? (
              <svg
                className="h-5 w-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-gray-700 group-hover:rotate-180 transition-transform duration-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </Button>
        </div>

        <Toaster
          position="top-center"
          className="!top-6"
          toastOptions={{
            classNames: {
              toast:
                "bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 px-6 py-4 text-gray-900 dark:text-gray-100",
              title: "font-semibold text-base",
              description: "text-sm text-gray-600 dark:text-gray-400",
            },
          }}
        />

        <div className="flex min-h-screen">
          {/* Left Side - Brand Section */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
            <div className="max-w-lg text-center space-y-8">
              {/* Logo/Brand */}
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-gray-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                  CALORIQ
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 font-light">
                  Your Health, Simplified
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Smart Tracking
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Advanced nutrition monitoring
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Goal Achievement
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Personalized fitness goals
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Health Insights
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      AI-powered recommendations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
            <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-visible">
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto">
                        {loginSuccess ? (
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                            <svg
                              className="w-8 h-8 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    {!loginSuccess && (
                      <div className="w-64 mx-auto space-y-3">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                          <span>Signing you in...</span>
                          <span className="font-medium">
                            {Math.round(loginProgress)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${loginProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      {loginSuccess ? (
                        <div>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            Welcome back!
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Redirecting to dashboard...
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                            {loginProgress < 30
                              ? "Verifying credentials..."
                              : loginProgress < 60
                              ? "Authenticating..."
                              : loginProgress < 90
                              ? "Setting up session..."
                              : "Almost ready..."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <CardHeader className="text-center space-y-2 pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-6 overflow-visible">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  {/* Modern Tab List */}
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 h-12">
                    <TabsTrigger
                      value="signin"
                      className="rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      Register
                    </TabsTrigger>
                  </TabsList>

                  {/* Sign In Tab */}
                  <TabsContent value="signin" className="space-y-6">
                    <form
                      onSubmit={signInForm.handleSubmit(handleSignIn)}
                      className="space-y-5"
                    >
                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="signin-email"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Email Address
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-gray-400"
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
                          </div>
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="Enter your email"
                            className={`pl-10 h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              signInForm.formState.errors.email
                                ? "border-red-500 focus:ring-red-500"
                                : ""
                            }`}
                            {...signInForm.register("email")}
                          />
                        </div>
                        {signInForm.formState.errors.email && (
                          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                            <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                              {signInForm.formState.errors.email.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="signin-password"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-gray-400"
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
                          </div>
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className={`pl-10 pr-10 h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              signInForm.formState.errors.password
                                ? "border-red-500 focus:ring-red-500"
                                : ""
                            }`}
                            {...signInForm.register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            {showPassword ? (
                              <svg
                                className="h-5 w-5"
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
                                className="h-5 w-5"
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
                          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                            <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                              {signInForm.formState.errors.password.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {/* Remember Me & Forgot Password */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            className="rounded border-gray-300 dark:border-gray-600"
                            {...signInForm.register("rememberMe")}
                          />
                          <Label
                            htmlFor="remember"
                            className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                          >
                            Remember me
                          </Label>
                        </div>
                        <a
                          href="#"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          Forgot password?
                        </a>
                      </div>

                      {/* Error Alert */}
                      {signInForm.formState.errors.root && (
                        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                          <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                            {signInForm.formState.errors.root.message}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={
                          signInForm.formState.isSubmitting || isLoading
                        }
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      >
                        {signInForm.formState.isSubmitting || isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Signing In...</span>
                          </div>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Register Tab */}
                  <TabsContent value="register" className="space-y-5">
                    <form
                      onSubmit={registrationForm.handleSubmit(handleRegister)}
                      className="space-y-4"
                    >
                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="first-name"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            First Name
                          </Label>
                          <Input
                            id="first-name"
                            type="text"
                            placeholder="First name"
                            className={`h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              registrationForm.formState.errors.firstName
                                ? "border-red-500 focus:ring-red-500"
                                : ""
                            }`}
                            {...registrationForm.register("firstName")}
                          />
                          {registrationForm.formState.errors.firstName && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              {
                                registrationForm.formState.errors.firstName
                                  .message
                              }
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="last-name"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Last Name
                          </Label>
                          <Input
                            id="last-name"
                            type="text"
                            placeholder="Last name"
                            className={`h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              registrationForm.formState.errors.lastName
                                ? "border-red-500 focus:ring-red-500"
                                : ""
                            }`}
                            {...registrationForm.register("lastName")}
                          />
                          {registrationForm.formState.errors.lastName && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              {
                                registrationForm.formState.errors.lastName
                                  .message
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="register-email"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Email Address
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-gray-400"
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
                          </div>
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="Enter your email"
                            className={`pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              registrationForm.formState.errors.email
                                ? "border-red-500 focus:ring-red-500"
                                : ""
                            }`}
                            {...registrationForm.register("email")}
                          />
                        </div>
                        {registrationForm.formState.errors.email && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {registrationForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      {/* Phone Number Field with Compact Popup Validation */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="mobile"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Phone Number
                        </Label>
                        <div className="flex space-x-2">
                          {/* Country Selector */}
                          <Select
                            value={selectedCountry}
                            onValueChange={handleCountryChange}
                          >
                            <SelectTrigger className="w-[120px] h-11 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white">
                              <SelectValue>
                                <div className="flex items-center space-x-1">
                                  <span className="text-base">
                                    {selectedCountryData.flag}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {selectedCountryData.dialCode}
                                  </span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 text-gray-900 dark:text-white">
                              {countries.map((country) => (
                                <SelectItem
                                  key={country.code}
                                  value={country.code}
                                  className="hover:bg-gray-100 dark:hover:bg-blue-600 dark:focus:bg-blue-600 dark:data-[state=checked]:bg-blue-600"
                                >
                                  <div className="flex items-center space-x-3">
                                    <span className="text-base">
                                      {country.flag}
                                    </span>
                                    <div>
                                      <div className="text-sm font-medium">
                                        {country.name}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-300">
                                        {country.dialCode}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Mobile Input with Always-Visible Popup Validation */}
                          <PhoneValidationPopup
                            phoneNumber={mobileValue || ""}
                            countryCode={selectedCountry}
                            selectedCountryData={selectedCountryData}
                          >
                            <div className="flex-1 relative">
                              {/* Phone Icon */}
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              </div>

                              <Input
                                id="mobile"
                                type="tel"
                                placeholder={`e.g., ${selectedCountryData.formatExample}`}
                                value={formatMobileNumber(
                                  registrationForm.watch("mobile") || "",
                                  selectedCountryData
                                )}
                                onChange={(e) => {
                                  handleMobileInput(
                                    e.target.value,
                                    selectedCountryData,
                                    (value) =>
                                      registrationForm.setValue("mobile", value)
                                  );
                                  registrationForm.trigger("mobile");
                                }}
                                className={`mt-[-2px] pl-12 h-10 bg-gray-50 dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                  registrationForm.formState.errors.mobile
                                    ? "border-red-500 focus:ring-red-500"
                                    : ""
                                }`}
                                maxLength={selectedCountryData.maxLength + 5}
                              />
                            </div>
                          </PhoneValidationPopup>
                        </div>

                        {registrationForm.formState.errors.mobile && (
                          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                            <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                              {registrationForm.formState.errors.mobile.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="register-password"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-gray-400"
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
                          </div>
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className={`pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              registrationForm.formState.errors.password
                                ? "border-red-500 focus:ring-red-500"
                                : ""
                            }`}
                            {...registrationForm.register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            {showPassword ? (
                              <svg
                                className="h-5 w-5"
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
                                className="h-5 w-5"
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

                        {/* Password Strength Indicator */}
                        {passwordValue && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">
                                Password strength:
                              </span>
                              <span
                                className={`font-medium ${
                                  getPasswordStrength(passwordValue).strength >=
                                  80
                                    ? "text-green-600 dark:text-green-400"
                                    : getPasswordStrength(passwordValue)
                                        .strength >= 60
                                    ? "text-blue-600 dark:text-blue-400"
                                    : getPasswordStrength(passwordValue)
                                        .strength >= 40
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {getPasswordStrength(passwordValue).label}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
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
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {registrationForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="confirm-password"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-gray-400"
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
                          </div>
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className={`pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              registrationForm.formState.errors.confirmPassword
                                ? "border-red-500 focus:ring-red-500"
                                : ""
                            }`}
                            {...registrationForm.register("confirmPassword")}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <svg
                                className="h-5 w-5"
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
                                className="h-5 w-5"
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
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {
                              registrationForm.formState.errors.confirmPassword
                                .message
                            }
                          </p>
                        )}
                      </div>

                      {/* Error Alert */}
                      {registrationForm.formState.errors.root && (
                        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                          <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                            {registrationForm.formState.errors.root.message}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={
                          registrationForm.formState.isSubmitting || isLoading
                        }
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      >
                        {registrationForm.formState.isSubmitting ||
                        isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Creating Account...</span>
                          </div>
                        ) : (
                          "Create Account"
                        )}
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
  );
}
