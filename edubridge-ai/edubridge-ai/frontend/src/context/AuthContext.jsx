import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("edubridge_token");
    const cachedUser = localStorage.getItem("edubridge_user");
    if (token && cachedUser) {
      setUser(JSON.parse(cachedUser));
      // refresh profile in background to catch any changes
      api
        .get("/users/profile")
        .then(({ data }) => {
          setUser(data.user);
          localStorage.setItem("edubridge_user", JSON.stringify(data.user));
        })
        .catch(() => {});
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("edubridge_token", data.token);
    localStorage.setItem("edubridge_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("edubridge_token", data.token);
    localStorage.setItem("edubridge_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("edubridge_user", JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem("edubridge_token");
    localStorage.removeItem("edubridge_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
