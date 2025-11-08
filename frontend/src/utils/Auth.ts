import api from "./server";

const auth = async (data) => {
  try {
    const response = await api.post("/users/auth", data);
    return response.data;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error; // re-throw the error so it can be caught by the caller
  }
};

export default auth;
