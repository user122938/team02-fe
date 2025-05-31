import React, { createContext, useState, useCallback } from "react";
import { axiosInstance } from "../apis/axiosInstance";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Logout: clear state and token
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("accessToken");
    delete axiosInstance.defaults.headers.common.Authorization;
  }, []);

  // Login: store token and fetch profile
  const login = useCallback(
    async ({ accessToken }) => {
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        try {
          const res = await axiosInstance.get("/api/auth/user/me");
          setUser(res.data);
        } catch (err) {
          logout();
        }
      }
    },
    [logout]
  );

  return (
    <UserContext.Provider value={{ user, login, logout, initialized }}>
      {children}
    </UserContext.Provider>
  );
}
