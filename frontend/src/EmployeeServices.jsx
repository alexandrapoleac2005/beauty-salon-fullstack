import { useState, useEffect } from "react";
import api from "./api/axios";
import { Link, useParams } from "react-router-dom";
import AppointmentModal from "./AppointmentModal";

export default function EmployeeServices() {
  const { employeeId } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState(null);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  useEffect(() => {
    api.get("/api/users/employees")
      .then((response) => {
        const found = response.data.find((e) => String(e.id) === String(employeeId));
        if (!found) {
          setError("Specialistul nu a fost găsit.");
        } else {
          setEmployee(found);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Eroare la preluarea specialistului:", err);
        setError("Nu am putut încărca datele specialistului.");
        setLoading(false);
      });
  }, [employeeId]);

  const handleBookClick = (service) => {
    setSelectedService(service);
  };

  const services = employee?.services || [];
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const inkFont = { fontFamily: "'Inter', sans-serif" };
  const displayFont = { fontFamily: "'Fraunces', serif" };

  const isLoggedIn = !!localStorage.getItem("token");

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex flex-col items-center justify-center gap-6 px-6 text-center" style={inkFont}>
        <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">Un pas rămas</span>
        <h1 className="text-[1.9rem] leading-tight" style={displayFont}>
          Vezi serviciile acestui specialist
        </h1>
        <p className="text-[#2A2420]/60 text-[14px] max-w-sm">
          Pentru a vedea serviciile și pentru a face o programare, te rugăm să te conectezi sau să îți creezi un cont.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            className="bg-[#2A2420] text-[#FAF6F1] px-6 py-3 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200"
          >
            Conectare
          </Link>
          <Link
            to="/register"
            className="border border-[#2A2420]/20 text-[#2A2420] px-6 py-3 text-[13px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200"
          >
            Creează cont
          </Link>
        </div>
        <Link to="/team" className="text-[13px] text-[#2A2420]/50 hover:text-[#2A2420] transition-colors duration-200 mt-2">
          ← Înapoi la echipă
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center text-[#2A2420]/60 text-[14px] tracking-wide" style={inkFont}>
        Se încarcă...
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex flex-col items-center justify-center gap-5" style={inkFont}>
        <p className="text-[#9B4A5C] text-[14px] tracking-wide">{error}</p>
        <Link to="/team" className="bg-[#2A2420] text-[#FAF6F1] px-6 py-2.5 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200">
          Înapoi la echipă
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F1] text-[#2A2420] py-12 px-8 relative" style={inkFont}>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-6xl mx-auto mb-10">
        <Link
          to="/team"
          className="text-[13px] tracking-wide text-[#2A2420]/60 hover:text-[#2A2420] transition-colors duration-200 inline-flex items-center gap-2 mb-8"
        >
          <span aria-hidden="true">←</span> Înapoi la echipă
        </Link>

        <div className="flex items-center gap-5 border-b border-[#2A2420]/10 pb-8">
          {employee.profilePictureUrl ? (
            <img
              src={employee.profilePictureUrl}
              alt={`${employee.firstName} ${employee.lastName}`}
              className="h-20 w-20 rounded-full object-cover border border-[#2A2420]/12"
            />
          ) : (
            <div className="h-20 w-20 rounded-full border border-[#9B4A5C]/30 flex items-center justify-center text-[#9B4A5C] text-[1.4rem]" style={displayFont}>
              {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
            </div>
          )}
          <div>
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">Specialist</span>
            <h1 className="text-[1.9rem] leading-tight mt-1" style={displayFont}>
              {employee.firstName} {employee.lastName}
            </h1>
          </div>
        </div>
      </div>

      {/* Bara de cautare */}
      <div className="max-w-6xl mx-auto mb-10">
        <input
          type="text"
          placeholder="Caută printre serviciile acestui specialist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 border border-[#2A2420]/20 p-3.5 bg-transparent focus:border-[#9B4A5C] focus:outline-none focus:ring-1 focus:ring-[#9B4A5C] text-[15px] placeholder-[#2A2420]/40 transition-colors duration-200"
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {filteredServices.length === 0 && (
          <div className="border border-[#2A2420]/12 p-14 text-center">
            <p className="text-[#2A2420]/60 text-[14px]">
              {services.length === 0
                ? "Acest specialist nu are încă servicii asociate."
                : `Nu am găsit niciun serviciu care să corespundă căutării „${searchQuery}”.`}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-[#FAF6F1] border border-[#2A2420]/12 p-7 flex flex-col justify-between hover:border-[#9B4A5C]/50 transition-colors duration-200"
            >
              <div>
                <h3
                  className="text-[1.3rem] leading-snug mb-2.5"
                  style={displayFont}
                >
                  {service.name}
                </h3>
                <p className="text-[#2A2420]/60 text-[14px] leading-relaxed mb-6">
                  {service.description || "Fără descriere disponibilă."}
                </p>
              </div>

              <div className="border-t border-[#2A2420]/10 pt-5 flex justify-between items-center">
                <div>
                  <span className="text-[1.2rem]" style={displayFont}>
                    {service.price} RON
                  </span>
                  <span className="block text-[12px] text-[#2A2420]/45 tracking-wide mt-0.5">
                    {service.durationMinutes} minute
                  </span>
                </div>
                <button
                  onClick={() => handleBookClick(service)}
                  className="bg-[#2A2420] text-[#FAF6F1] px-5 py-2.5 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200"
                >
                  Programează-te
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal pentru programare — specialistul e deja stabilit */}
      {selectedService && (
        <AppointmentModal
          service={selectedService}
          employee={employee}
          onClose={() => setSelectedService(null)}
          onSuccess={() => {
            showToast("Programarea a fost realizată cu succes.");
          }}
        />
      )}
    </div>
  );
}
