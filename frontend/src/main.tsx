import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { AuthProvider } from "./auth/AuthProvider";
import "./styles/global.css";
import "./styles/global.css"; // Asegúrate de tener un archivo global.css en tu carpeta styles
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);