import axios from "axios";

const server = axios.create({
  baseURL: "http://localhost:3000/api/ikv1/",
});

// Add request interceptor to include token dynamically
server.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default server;
