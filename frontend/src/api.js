import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  const session = localStorage.getItem("sessionToken");
  if (session) cfg.headers["x-session-token"] = session;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(e);
  }
);

export default api;