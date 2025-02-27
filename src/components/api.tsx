const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchUsersAPI = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return response.json();
};

export const fetchIvtsOperatorUrlAPI = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/getIvtsOpretorUrl`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const deleteUserAPI = async () => {

};

// Other API functions for deleteUserAPI, saveUserAPI, logoutAPI...
