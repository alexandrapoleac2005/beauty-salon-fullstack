import { Link } from "react-router-dom";
import salonImage from "./assets/salon.jpg";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    showToast("Ai fost deconectată cu succes.");
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,500&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen bg-[#FAF6F1] text-[#2A2420] flex flex-col justify-between relative"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Notificare discreta */}
        {toastMessage && (
          <div
            className="fixed top-6 right-6 z-50 bg-[#FAF6F1] border border-[#2A2420]/15 border-l-4 border-l-[#9B4A5C] px-5 py-3.5 shadow-sm max-w-xs"
            style={{ animation: "slideIn 0.35s ease-out" }}
          >
            <p className="text-[13px] tracking-wide text-[#2A2420]">{toastMessage}</p>
          </div>
        )}
        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Navbar */}
        <header className="border-b border-[#2A2420]/10 py-5 px-8 flex justify-between items-center">
          <h1
            className="text-lg tracking-[0.18em] uppercase"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Beauty Salon
          </h1>

          <nav className="flex items-center gap-7 text-[13px] tracking-wide uppercase">
            <Link
              to="/team"
              className="text-[#2A2420]/80 hover:text-[#2A2420] pb-1 border-b border-transparent hover:border-[#9B4A5C] transition-colors duration-200"
            >
              Echipa
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="text-[#2A2420]/80 hover:text-[#2A2420] pb-1 border-b border-transparent hover:border-[#9B4A5C] transition-colors duration-200"
                >
                  Contul meu
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[#2A2420]/80 hover:text-[#9B4A5C] pb-1 border-b border-transparent hover:border-[#9B4A5C] transition-colors duration-200"
                >
                  Deconectare
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[#2A2420]/80 hover:text-[#2A2420] pb-1 border-b border-transparent hover:border-[#9B4A5C] transition-colors duration-200"
                >
                  Conectare
                </Link>
                <Link
                  to="/register"
                  className="bg-[#2A2420] text-[#FAF6F1] px-5 py-2.5 tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200"
                >
                  Creează cont
                </Link>
              </>
            )}
          </nav>
        </header>

        {/* Hero */}
        <main className="max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full">
          <div className="space-y-7">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-[#9B4A5C]" />
              <span className="text-[12px] tracking-[0.2em] uppercase text-[#9B4A5C]">
                Ritualuri de îngrijire
              </span>
            </div>

            <h2
              className="text-[2.75rem] md:text-[3.4rem] leading-[1.08] text-[#2A2420]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Frumusețea ta,{" "}
              <em className="italic text-[#9B4A5C]">tratată cu răbdare</em>
            </h2>

            <p className="text-[#2A2420]/70 text-[17px] leading-relaxed max-w-md">
              Programează-te la manichiură, coafură, cosmetică sau masaj
              într-un spațiu gândit pentru liniște, nu pentru grabă.
            </p>

            <div className="flex flex-wrap gap-4 pt-3">
              <Link
                to="/team"
                className="bg-[#2A2420] text-[#FAF6F1] px-7 py-3.5 tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200 text-center text-[14px]"
              >
                Vezi echipa noastră
              </Link>

              {!isLoggedIn ? (
                <>
                  <Link
                    to="/register"
                    className="border border-[#2A2420]/25 text-[#2A2420] px-7 py-3.5 hover:border-[#2A2420] transition-colors duration-200 text-center text-[14px] tracking-wide"
                  >
                    Vreau un cont nou
                  </Link>
                  <Link
                    to="/login"
                    className="text-[#2A2420]/60 hover:text-[#2A2420] px-2 py-3.5 text-center text-[14px] tracking-wide underline decoration-[#2A2420]/20 underline-offset-4"
                  >
                    Am deja cont
                  </Link>
                </>
              ) : (
                <Link
                  to="/profile"
                  className="border border-[#2A2420]/25 text-[#2A2420] px-7 py-3.5 hover:border-[#2A2420] transition-colors duration-200 text-center text-[14px] tracking-wide"
                >
                  Mergi la profilul meu
                </Link>
              )}
            </div>
          </div>

          <div className="relative flex">
            {/* eticheta verticala — semnatura vizuala a paginii */}
            <div className="hidden md:flex items-center justify-center w-10 shrink-0">
              <span
                className="text-[11px] tracking-[0.3em] uppercase text-[#2A2420]/50 whitespace-nowrap"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                Manichiură · Coafură · Cosmetică · Masaj
              </span>
            </div>

            <div className="relative flex-1">
              <img
                src={salonImage}
                alt="Salon de înfrumusețare"
                className="object-cover h-[440px] w-full border border-[#2A2420]/10"
              />
            </div>
          </div>
        </main>

        <footer className="border-t border-[#2A2420]/10 py-6 text-center text-[12px] tracking-wide text-[#2A2420]/50">
          © 2026 Beauty Salon — Toate drepturile rezervate
        </footer>
      </div>
    </>
  );
}
