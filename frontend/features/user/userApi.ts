// userApi.ts
import { CalorieRequest, CalorieResponse, getCaloriesRequest } from '@/app/api/getCalories'
import { RegisterRequest, registerRequest } from '@/app/api/register'
import { signInRequest, SignInRequest, SignInResponse } from '@/app/api/singIn'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

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
  }),
})

export const {
  useGetUserQuery,
  useLazyGetUserQuery,
  useSignInMutation,
  useRegisterMutation,
  useGetCaloriesMutation
} = userApi
