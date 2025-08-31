import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const Routes = {
  login: "/login",
  referral: "/referral",
  deals: "/deals",
};

export const ApiRoutes = {
  logout: "/auth/logout",
  me: "/auth/me",
  verify_code: "/auth/verify-code",
  verify_email: "/auth/verify-email",
};

export default api;
