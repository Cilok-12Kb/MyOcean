import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useEffect } from "react";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      const response = await api.post(
        "/ocean-control-center/login",
        {
          email,
          password,
        }
      );

      // simpan token
      localStorage.setItem(
        "token",
        response.data.token
      );

      // simpan role
      localStorage.setItem(
        "role",
        response.data.role[0]
      );

      alert("Login berhasil");

      navigate("/ocean-dashboard");

    } catch (error) {

      alert("Email atau password salah");

      console.log(error);

    }
  };

  useEffect(() => {

  const token = localStorage.getItem("token");

  if (token) {
    navigate("/ocean-dashboard");
  }

}, []);

  return (
    <div style={{ padding: "50px" }}>
      <h1>Login Admin My_Ocean</h1>

      <form onSubmit={handleLogin}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <br /><br />

        <button type="submit">
          Login
        </button>

      </form>
    </div>
  );
}