// src/services/api.ts
import { User } from "../interfaces/User";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


app.get("/filteredUsersSessionsData", async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    // Validate the date parameters
    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "Both fromDate and toDate are required" });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.stream = true;

    const usersMap = {}; // Object for storing unique users
    const formattedData = [];

    // Query to filter sessions based on login_time between fromDate and toDate
    request.query(
      `SELECT u.id, u.name, us.login_time, us.logout_time 
       FROM users u 
       LEFT JOIN user_sessions us ON u.id = us.user_id 
       WHERE us.login_time BETWEEN @fromDate AND @toDate`
    );

    // Add parameters for the date range
    request.input('fromDate', new Date(fromDate));
    request.input('toDate', new Date(toDate));

    request.on("row", (row) => {
      if (!usersMap[row.id]) {
        usersMap[row.id] = {
          id: row.id,
          name: row.name,
          sessions: [],
        };
        formattedData.push(usersMap[row.id]); // Push reference to array
      }

      // Add session only if login_time is not null
      if (row.login_time) {
        usersMap[row.id].sessions.push({
          login_time: row.login_time,
          logout_time: row.logout_time,
        });
      }
    });

    request.on("error", (err) => {
      console.error("Query Error:", err);
      res.status(500).json({ error: "
        
// Fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized();
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

// Fetch IVTS Operator URL
export const fetchIvtsOperatorUrl = async (): Promise<string> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/getIvtsOpretorUrl`, {
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
console.log(user);
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/users/${isEditing ? user.id : ""}`, {
    method: isEditing ? "PUT" : "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!response.ok) throw new Error("User operation failed");
};

// Delete a user
export const deleteUser = async (id: number): Promise<void> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to delete user");
};

// Handle logout
export const logout = async (): Promise<void> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Logout failed");
};

// Handle unauthorized access
const handleUnauthorized = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export const fetchUsesrsSessions = async (): Promise<User[]> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/usersSessionsData`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
  
    if (!response.ok) {
      if (response.status === 401) handleUnauthorized();
      throw new Error("Failed to fetch users");
    }
  
    return response.json();
  };