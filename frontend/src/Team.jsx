import { useState, useEffect } from "react";
import api from "./api/axios";
import { Link, useNavigate } from "react-router-dom";

const CATEGORY_OPTIONS = [
  { value: "COAFOR_FRIZERIE", label: "Coafor / Frizerie" },
  { value: "MANICHIURA_PEDICHIURA", label: "Manichiură / Pedichiură" },
  { value: "GENE_SPRANCENE", label: "Gene / Sprâncene" },
  { value: "EPILARE_DEFINITIVA", label: "Epilare definitivă" },
];

export default function Team() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/users/employees")
      .then((response) => {
        setEmployees(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Eroare la preluarea echipei:", err);
        setError("Nu am putut încărca echipa salonului.");
        setLoading(false);
      });
  }, []);

  const handleEmployeeClick = (employeeId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoginPromptOpen(true);
      return;
    }
    navigate(`/team/${employeeId}`);
  };

  const employeesForCategory = (categoryValue) =>
    employees.filter((emp) =>
      (emp.services || []).some((s) => s.category === categoryValue)
    );

  const inkFont = { fontFamily: "'Inter', sans-serif" };
  const displayFont = { fontFamily: "'Fraunces', serif" };

  return (
    <div className="min-h-screen bg-[#FAF6F1] text-[#2A2420] py-12 px-8" style={inkFont}>
      <div className="max-w-6xl mx-auto flex justify-between items-end mb-10 border-b border-[#2A2420]/10 pb-6">
        <div className="space-y-2">
          <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">Echipa noastră</span>
          <h1 className="text-[2.25rem] leading-tight" style={displayFont}>Specialiștii salonului</h1>
        </div>
        <Link
          to="/"
          className="text-[13px] tracking-wide text-[#2A2420]/70 hover:text-[#2A2420] pb-1 border-b border-transparent hover:border-[#9B4A5C] transition-colors duration-200"
        >
          Înapoi acasă
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        {loading && (
          <p className="text-center text-[#2A2420]/60 text-[14px] tracking-wide">Se încarcă echipa...</p>
        )}
        {error && (
          <p className="text-center text-[#9B4A5C] text-[14px] tracking-wide">{error}</p>
        )}

        {!loading && !error && (
          <div className="space-y-14">
            {CATEGORY_OPTIONS.map((cat) => {
              const catEmployees = employeesForCategory(cat.value);
              if (catEmployees.length === 0) return null;

              return (
                <section key={cat.value}>
                  <h2 className="text-[1.4rem] mb-6" style={displayFont}>{cat.label}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                    {catEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => handleEmployeeClick(emp.id)}
                        className="flex flex-col items-center text-center group bg-transparent border-0 p-0 cursor-pointer"
                      >
                        {emp.profilePictureUrl ? (
                          <img
                            src={emp.profilePictureUrl}
                            alt={`${emp.firstName} ${emp.lastName}`}
                            className="h-28 w-28 rounded-full object-cover border border-[#2A2420]/12 group-hover:border-[#9B4A5C]/50 transition-colors duration-200"
                          />
                        ) : (
                          <div
                            className="h-28 w-28 rounded-full border border-[#9B4A5C]/30 group-hover:border-[#9B4A5C] flex items-center justify-center text-[#9B4A5C] text-[1.6rem] transition-colors duration-200"
                            style={displayFont}
                          >
                            {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                          </div>
                        )}
                        <span className="mt-3 text-[14px] text-[#2A2420] group-hover:text-[#9B4A5C] transition-colors duration-200">
                          {emp.firstName} {emp.lastName}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}

            {!loading && !error && employees.length === 0 && (
              <div className="border border-[#2A2420]/12 p-14 text-center">
                <p className="text-[#2A2420]/60 text-[14px]">Nu există încă angajați înregistrați.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {loginPromptOpen && (
        <div className="fixed inset-0 bg-[#2A2420]/40 flex items-center justify-center p-4 z-50">
          <div
            className="bg-[#FAF6F1] max-w-sm w-full p-8 text-center relative border border-[#2A2420]/12"
            style={{ animation: "fadeIn 0.25s ease-out" }}
          >
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">
              Un pas rămas
            </span>
            <h3 className="text-[1.5rem] leading-tight mt-2 mb-3" style={displayFont}>
              Autentificare necesară
            </h3>
            <p className="text-[#2A2420]/60 text-[14px] leading-relaxed mb-7">
              Pentru a vedea serviciile acestui specialist și pentru a face o programare, te rugăm să te conectezi sau să îți creezi un cont.
            </p>

            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-[#2A2420] text-[#FAF6F1] py-3 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200"
              >
                Conectare — am deja cont
              </Link>

              <p className="text-[12px] text-[#2A2420]/50 tracking-wide pt-1">
                Client nou?{" "}
                <Link
                  to="/register"
                  className="text-[#9B4A5C] hover:underline underline-offset-4"
                >
                  Înregistrează-te acum
                </Link>
              </p>
            </div>

            <button
              onClick={() => setLoginPromptOpen(false)}
              aria-label="Închide"
              className="absolute top-5 right-5 text-[#2A2420]/40 hover:text-[#2A2420] text-[15px] transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
