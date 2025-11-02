import axios from "axios";
const token = localStorage.getItem("token");
const server = axios.create({
  baseURL: "http://localhost:3000/api/ikv1/",
  headers: {
    Authorization: token,
  },
});
export default server;
