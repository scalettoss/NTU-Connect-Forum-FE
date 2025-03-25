import { z } from 'zod';

export const RegisterRequest = z.object({
    email: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
    firstName: z.string().min(3),
    lastName: z.string().min(3),
})
    .strict()
export type RegisterRequestType = z.infer<typeof RegisterRequest>


export const RegisterResponse = z.object({
    message: z.string(),
    code: z.number(),
})
export type RegisterResponseType = z.infer<typeof RegisterResponse>



//Login
export const LoginRequest = z.object({
    email: z.string(),
    password: z.string(),
})
    .strict()

export type LoginRequestType = z.infer<typeof LoginRequest>

export const LoginResponse = z.object({
    accessToken: z.string(),
    expires: z.string(),
    message: z.string(),
})

export type LoginResponseType = z.infer<typeof LoginResponse>
