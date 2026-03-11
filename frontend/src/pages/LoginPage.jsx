import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        await api.post("/auth/register", { username, password });
        alert("Registration successful. Now login.");
        setIsRegister(false);
        return;
      }

      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>DSA Manager</h1>
        <p>{isRegister ? "Create account" : "Login to continue"}</p>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">{isRegister ? "Register" : "Login"}</button>

        <span className="link-text" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Already have an account? Login" : "New user? Register"}
        </span>
      </form>
    </div>
  );
}