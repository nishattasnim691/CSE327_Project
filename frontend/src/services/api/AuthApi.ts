import { apiRequest } from "./ApiClient";


export type UserRole = "patient" | "doctor";


export type LoginRequest = {
  email: string;
  password: string;
  role: UserRole;
};


export type LoginResponse = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
};



export type SignupRequest = {
  name: string;
  email: string;
  password: string;
  role: UserRole;

  // Patient information
  dob?: string;
  gender?: string;
  bloodGroup?: string;

  // Doctor information
  licenseNumber?: string;
  specialty?: string;
};



export type SignupResponse = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
};



export async function login(
  request: LoginRequest
): Promise<LoginResponse> {

  return apiRequest<LoginResponse>(
    "/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

}



export async function signup(
  request: SignupRequest
): Promise<SignupResponse> {

  return apiRequest<SignupResponse>(
    "/api/auth/signup",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

}