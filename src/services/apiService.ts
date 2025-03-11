// src/services/api.ts
import { User } from "../interfaces/User";
import api from "../utils/axiosInstance";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


// Fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const token = localStorage.getItem("accessToken");
    console.log(token);

    const response = await api.get<User[]>(`${API_BASE_URL}/api/users`);

    return response.data; // ✅ Axios does NOT require `.json()`
  } catch (error: any) {
    if (error.response) {
      // if (error.response.status === 400) handleUnauthorized();
      // if (error.response.status === 403) refreshAccessToken();
    }
    throw new Error("Failed to fetch users");
  }
};

// Fetch IVTS Operator URL
export const fetchIvtsOperatorUrl = async (): Promise<string> => {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/api/getIvtsOpretorUrl`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized();
    if (response?.status === 403) {
      //  refreshAccessToken();
    }
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

  if (!response.ok) {
    if (response?.status === 403) {
      //  refreshAccessToken();
    }
    throw new Error(data.error || "User operation failed");
  }
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

  if (!response.ok) {
    if (response?.status === 403) {
      //  refreshAccessToken();
    }
    throw new Error("Failed to delete user");
  }
};

// Handle logout
export const logout = async (): Promise<void> => {
  const token = localStorage.getItem("accessToken");
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
};

// Handle unauthorized access
const handleUnauthorized = () => {
  localStorage.removeItem("accessToken");
  // window.location.href = "/login";
};

export const fetchUsersSessions = async (query: string = ""): Promise<User[]> => {  
  try {  
    const response = await api.get(`/api/sessions/usersSessionsData?${query}`);  

    // Return response data directly since Axios does not require `.json()`
    return response.data as User[];  
  } catch (error: any) {  
    if (error.response) {  
      if (error.response.status === 401) {  
        handleUnauthorized();  
      }  
      if (error.response.status === 403) {  
        await refreshAccessToken(); // Try refreshing token  
        return fetchUsersSessions(query); // Retry the request  
      }  
    }  
    console.error("Failed to fetch users:", error.response?.data || error.message);  
    throw new Error("Failed to fetch users");  
  }  
}; 

export const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
    method: "POST",
    credentials: "include", // ✅ Correct placement
  });

  const data = await response.json();
  localStorage.setItem("accessToken", data.accessToken);
  return data.accessToken;
};
