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
        } catch (error: any) {
          return { error: { status: 500, data: error.message } }
        }
      },
    }),
    register: builder.mutation<SignInResponse, RegisterRequest>({
      async queryFn(registerData) {
        try {
          const data = await registerRequest(registerData);
          return { data };
        } catch (error: any) {
          return { error: { status: 500, data: error.message } };
        }
      },
    }),
    getCalories: builder.mutation<CalorieResponse, CalorieRequest>({
      async queryFn(calorieData) {
        try {
          const data = await getCaloriesRequest(calorieData);
          return { data };
        } catch (error: any) {
          return {
            error: {
              status: 500,
              data: error.message || 'Unable to fetch calories',
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
