// src/api/auth.js
import { authAPI } from "../lib/updatedApiClient.js";

export async function loginSeller(email, password) {
  try {
    const response = await authAPI.login({ email, password });
    return response; // { success, seller, token }
  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
}

export async function signupSeller(payload) {
  try {
    const response = await authAPI.register(payload);
    return response; // { success, seller }
  } catch (error) {
    throw new Error(error.message || "Signup failed");
  }
}
