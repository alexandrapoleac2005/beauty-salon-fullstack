import { useState } from "react";
import api from "./api/axios"; // Folosim instanța ta globală
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/auth/register", { 
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
      });

      setMessage("Cont creat cu succes. Te redirecționăm către autentificare...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Eroare la înregistrare:", error);
      setMessage("Eroare la înregistrare. Verifică datele introduse.");
    }
  };

  const isError = message.toLowerCase().includes("verifică");

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#FAF6F1] text-[#2A2420] px-6 py-14"
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
              Bun venit
            </span>
            <h2
              className="text-[2rem] leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Creează cont
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

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">
                  Prenume
                </label>
                <input
                  type="text"
                  className="w-full border border-[#2A2420]/20 bg-transparent p-3 text-[15px] focus:border-[#9B4A5C] focus:outline-none focus:ring-1 focus:ring-[#9B4A5C] transition-colors duration-200"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">
                  Nume
                </label>
                <input
                  type="text"
                  className="w-full border border-[#2A2420]/20 bg-transparent p-3 text-[15px] focus:border-[#9B4A5C] focus:outline-none focus:ring-1 focus:ring-[#9B4A5C] transition-colors duration-200"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-[#2A2420]/20 bg-transparent p-3 text-[15px] focus:border-[#9B4A5C] focus:outline-none focus:ring-1 focus:ring-[#9B4A5C] transition-colors duration-200"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">
                Număr telefon
              </label>
              <input
                type="text"
                className="w-full border border-[#2A2420]/20 bg-transparent p-3 text-[15px] focus:border-[#9B4A5C] focus:outline-none focus:ring-1 focus:ring-[#9B4A5C] transition-colors duration-200"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2A2420] text-[#FAF6F1] p-3.5 text-[14px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200 mt-2"
            >
              Înregistrare
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-[#2A2420]/60">
            Ai deja cont?{" "}
            <Link
              to="/login"
              className="text-[#9B4A5C] hover:underline underline-offset-4"
            >
              Conectare aici
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
