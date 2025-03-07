// src/services/api.ts
import { User } from "../interfaces/User";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;



// Fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem("accessToken");
  console.log(token);
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    if (response.status === 400) handleUnauthorized();
    throw new Error("Failed to fetch users");
  }
  

  return response.json();
};

// Fetch IVTS Operator URL
export const fetchIvtsOperatorUrl = async (): Promise<string> => {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/api/getIvtsOpretorUrl`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized();
    throw new Error("Failed to fetch IVTS Operator URL");
  }

  return response.json();
};

// Add or update a user
export const saveUser = async (user: User, isEditing: boolean): Promise<void> => {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/api/users/${isEditing ? user.id : ""}`, {
    method: isEditing ? "PUT" : "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.error || "User operation failed");
};

export const resetPassword = async (id:number, password: string) : Promise<void> => {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/api/users/${id}/reset-password`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.error || "User operation failed");
}

// Delete a user
export const deleteUser = async (id: number): Promise<void> => {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to delete user");
};

// Handle logout
export const logout = async (): Promise<void> => {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Logout failed");
};

// Handle unauthorized access
const handleUnauthorized = () => {
  localStorage.removeItem("accessToken");
  // window.location.href = "/login";
};

export const fetchUsesrsSessions = async (query: string = ""): Promise<User[]> => {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/api/sessions/usersSessionsData?${query}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized();
    throw new Error("Failed to fetch users");
  }

  const data: unknown = await response.json();

  // Ensure type safety by explicitly casting
  return data as User[];
};
