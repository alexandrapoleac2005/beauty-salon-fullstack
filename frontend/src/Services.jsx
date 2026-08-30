import { useState, useEffect } from "react";
import api from "./api/axios";
import { Link } from "react-router-dom";
import AppointmentModal from "./AppointmentModal";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [unauthorizedModalOpen, setUnauthorizedModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    api.get("/api/services")
      .then((response) => {
        setServices(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Eroare la preluarea serviciilor:", err);
        setError("Nu s-au putut încărca serviciile salonului.");
        setLoading(false);
      });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const handleBookClick = (service) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUnauthorizedModalOpen(true);
      return;
    }
    setSelectedService(service);
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      className="min-h-screen bg-[#FAF6F1] text-[#2A2420] py-12 px-8 relative"
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-6xl mx-auto flex justify-between items-end mb-10 border-b border-[#2A2420]/10 pb-6">
        <div className="space-y-2">
          <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">
            Catalog
          </span>
          <h1
            className="text-[2.25rem] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Serviciile noastre
          </h1>
        </div>
        <Link
          to="/"
          className="text-[13px] tracking-wide text-[#2A2420]/70 hover:text-[#2A2420] pb-1 border-b border-transparent hover:border-[#9B4A5C] transition-colors duration-200"
        >
          Înapoi acasă
        </Link>
      </div>

      {/* Bara de cautare */}
      <div className="max-w-6xl mx-auto mb-10">
        <input
          type="text"
          placeholder="Caută un serviciu — manichiură, coafură, masaj..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 border border-[#2A2420]/20 p-3.5 bg-transparent focus:border-[#9B4A5C] focus:outline-none focus:ring-1 focus:ring-[#9B4A5C] text-[15px] placeholder-[#2A2420]/40 transition-colors duration-200"
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {loading && (
          <p className="text-center text-[#2A2420]/60 text-[14px] tracking-wide">
            Se încarcă serviciile...
          </p>
        )}
        {error && (
          <p className="text-center text-[#9B4A5C] text-[14px] tracking-wide">{error}</p>
        )}

        {!loading && !error && filteredServices.length === 0 && (
          <div className="border border-[#2A2420]/12 p-14 text-center">
            <p className="text-[#2A2420]/60 text-[14px]">
              Nu am găsit niciun serviciu care să corespundă căutării „{searchQuery}”.
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
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {service.name}
                </h3>
                <p className="text-[#2A2420]/60 text-[14px] leading-relaxed mb-6">
                  {service.description || "Fără descriere disponibilă."}
                </p>
              </div>

              <div className="border-t border-[#2A2420]/10 pt-5 flex justify-between items-center">
                <div>
                  <span
                    className="text-[1.2rem]"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
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

      {/* Modal pentru programare */}
      {selectedService && (
        <AppointmentModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onSuccess={() => {
            showToast("Programarea a fost realizată cu succes.");
          }}
        />
      )}

      {/* Modal pentru vizitatorii neautentificati */}
      {unauthorizedModalOpen && (
        <div className="fixed inset-0 bg-[#2A2420]/40 flex items-center justify-center p-4 z-50">
          <div
            className="bg-[#FAF6F1] max-w-sm w-full p-8 text-center relative border border-[#2A2420]/12"
            style={{ animation: "fadeIn 0.25s ease-out" }}
          >
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">
              Un pas rămas
            </span>
            <h3
              className="text-[1.5rem] leading-tight mt-2 mb-3"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Autentificare necesară
            </h3>
            <p className="text-[#2A2420]/60 text-[14px] leading-relaxed mb-7">
              Pentru a putea face o programare la acest serviciu, te rugăm să te conectezi sau să îți creezi un cont.
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
              onClick={() => setUnauthorizedModalOpen(false)}
              aria-label="Închide"
              className="absolute top-5 right-5 text-[#2A2420]/40 hover:text-[#2A2420] text-[15px] transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
