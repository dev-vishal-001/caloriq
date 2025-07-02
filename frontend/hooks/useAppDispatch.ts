import { useDispatch, UseDispatch } from "react-redux";
import type { AppDispatch } from "@/store";

export const useAppDispatch = () => useDispatch<AppDispatch>()