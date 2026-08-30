import { useState } from "react";
import api from "./api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/auth/login", {
        email: email,
        password: password,
      });

      const jwtToken = response.data.token;
      localStorage.setItem("token", jwtToken);

      setMessage("Logare reușită. Te redirecționăm...");

      const userRes = await api.get("/api/users/me");
      const userRole = userRes.data.role;

      setTimeout(() => {
        if (userRole === "ADMIN") {
          navigate("/admin-dashboard");
        } else if (userRole === "EMPLOYEE") {
          navigate("/profile");
        } else {
          navigate("/team");
        }
      }, 1000);

    } catch (error) {
      console.error("Eroare la logare:", error);
      setMessage("Email sau parolă incorecte.");
    }
  };

  const isError = message.toLowerCase().includes("incorecte");

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#FAF6F1] text-[#2A2420] px-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="text-[13px] tracking-wide text-[#2A2420]/60 hover:text-[#2A2420] transition-colors duration-200 inline-flex items-center gap-2 mb-8"
        >
          <span aria-hidden="true">←</span> Înapoi la pagina principală
        </Link>

        <div className="border border-[#2A2420]/12 bg-[#FAF6F1] p-10">
          <div className="mb-8 text-center space-y-2">
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">
              Contul tău
            </span>
            <h2
              className="text-[2rem] leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Conectare
            </h2>
          </div>

          {message && (
            <p
              className={`mb-6 text-center text-[13px] tracking-wide border px-4 py-2.5 ${
                isError
                  ? "border-[#9B4A5C]/30 text-[#9B4A5C] bg-[#9B4A5C]/5"
                  : "border-[#2A2420]/15 text-[#2A2420] bg-[#2A2420]/[0.03]"
              }`}
            >
              {message}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-[#2A2420]/20 bg-transparent p-3 text-[15px] focus:border-[#9B4A5C] focus:outline-none focus:ring-1 focus:ring-[#9B4A5C] transition-colors duration-200"
                placeholder="ana@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">
                Parolă
              </label>
              <input
                type="password"
                className="w-full border border-[#2A2420]/20 bg-transparent p-3 text-[15px] focus:border-[#9B4A5C] focus:outline-none focus:ring-1 focus:ring-[#9B4A5C] transition-colors duration-200"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2A2420] text-[#FAF6F1] p-3.5 text-[14px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200 mt-2"
            >
              Conectare
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
