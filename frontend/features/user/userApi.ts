// userApi.ts
import { createHistoryRequest } from '@/app/api/createhistory';
import { deleteHistoryRequest } from '@/app/api/deletehistory';
import { CalorieRequest, CalorieResponse, getCaloriesRequest } from '@/app/api/getCalories'
import { getHistoryRequest } from '@/app/api/gethistory';
import { RegisterRequest, registerRequest } from '@/app/api/register'
import { signInRequest, SignInRequest, SignInResponse } from '@/app/api/singIn'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
export interface CreateHistoryRequest {
  id: string;
  dish_name: string;
  calories_per_serving: number;
  servings: number;
  total_calories: number;
  time: string;
  timestamp: string; // ISO format
  email: string;
}
export interface DeleteHistoryRequest {
  id: string;
}

export interface DeleteHistoryResponse {
  message: string;
  deletedId: string;
}
export interface HistoryRecord {
  id: string;
  dish_name: string;
  calories_per_serving: number;
  servings: number;
  total_calories: number;
  time: string;
  timestamp: string; // ISO format
  email: string;
}

export interface GetHistoryRequest {
  email: string;
}

export interface GetHistoryResponse {
  history: HistoryRecord[];
}

export interface CreateHistoryResponse {
  message: string;
  history: {
    id: string;
    dish_name: string;
    calories_per_serving: number;
    servings: number;
    total_calories: number;
    time: string;
    timestamp: string;
    email: string;
  };
}


export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: builder => ({
    getUser: builder.query<{ name: string }, void>({
      query: () => 'user',
    }),
    signIn: builder.mutation<SignInResponse, SignInRequest>({
      async queryFn(signInData) {
        try {
          const data = await signInRequest(signInData)
          return { data }
        } catch (error: unknown) {
          const err = error as Error;
        
          return {
            error: {
              status: 500,
              data: err.message || "Something went wrong.",
            },
          };
        }
      },
    }),
    register: builder.mutation<SignInResponse, RegisterRequest>({
      async queryFn(registerData) {
        try {
          const data = await registerRequest(registerData);
          return { data };
        } catch (error: unknown) {
          const err = error as Error;
        
          return {
            error: {
              status: 500,
              data: err.message || "An unexpected error occurred.",
            },
          };
        }
        
      },
    }),
    getCalories: builder.mutation<CalorieResponse, CalorieRequest>({
      async queryFn(calorieData) {
        try {
          const data = await getCaloriesRequest(calorieData);
          return { data };
        } catch (error: unknown) {
          const err = error as Error;
        
          return {
            error: {
              status: 500,
              data: err.message || 'Unable to fetch calories',
            },
          };
        }
        
      },
    }),
    createHistory: builder.mutation<CreateHistoryResponse, CreateHistoryRequest>({
      async queryFn(historyData) {
        try {
          const data = await createHistoryRequest(historyData);
          return { data };
        } catch (error: unknown) {
          const err = error as Error;
          return {
            error: {
              status: 500,
              data: err.message || 'Failed to create history',
            },
          };
        }
      },
    }),
    getHistoryByEmail: builder.query<GetHistoryResponse, GetHistoryRequest>({
      async queryFn(requestData) {
        try {
          const data = await getHistoryRequest(requestData);
          return { data };
        } catch (error: unknown) {
          const err = error as Error;
          return {
            error: {
              status: 500,
              data: err.message || 'Failed to fetch history',
            },
          };
        }
      },
    }),
    deleteHistoryById: builder.mutation<DeleteHistoryResponse, DeleteHistoryRequest>({
      async queryFn(requestData) {
        try {
          const data = await deleteHistoryRequest(requestData);
          return { data };
        } catch (error: unknown) {
          const err = error as Error;
          return {
            error: {
              status: 500,
              data: err.message || "Failed to delete history",
            },
          };
        }
      },
    }),
  }),
})

export const {
  useGetUserQuery,
  useLazyGetUserQuery,
  useSignInMutation,
  useRegisterMutation,
  useGetCaloriesMutation,
  useCreateHistoryMutation,
  useGetHistoryByEmailQuery,
  useDeleteHistoryByIdMutation
} = userApi
