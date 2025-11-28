import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // always send cookies
});

export default http;
