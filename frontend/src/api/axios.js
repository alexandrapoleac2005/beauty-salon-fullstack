import axios from "axios";

// Creăm o instanță globală de axios pentru backend-ul nostru
const api = axios.create({
  baseURL: "http://localhost:8080",
});

// Interceptorul: Se activează AUTOMAT înainte ca orice cerere să plece spre backend
api.interceptors.request.use(
  (config) => {
    // Luăm token-ul pe care l-am salvat în localStorage când utilizatorul s-a logat
    const token = localStorage.getItem("token");
    
    if (token) {
      // Îl punem în antetul (header-ul) cererii, exact cum cere Spring Security
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;