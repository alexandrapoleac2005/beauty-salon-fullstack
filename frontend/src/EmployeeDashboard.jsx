import { useState, useEffect } from "react";
import api from "./api/axios";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  const fetchEmployeeData = async () => {
    try {
      const userRes = await api.get("/api/users/me");
      const userData = userRes.data;

      if (userData.role !== "EMPLOYEE" && userData.role !== "ADMIN") {
        setError("Nu aveți permisiunea de a accesa această pagină.");
        setLoading(false);
        return;
      }

      setEmployee(userData);

      const appRes = await api.get(`/api/appointments/employee/${userData.id}`);
      setAppointments(appRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Eroare la preluarea datelor angajatului:", err.response?.data || err);
      setError("A apărut o eroare la încărcarea panoului. Sesiunea a expirat sau nu aveți drepturi.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}/status`, {
        status: newStatus
      });
      // Înlocuit alert() cu toast discret
      showToast(`Status actualizat cu succes la ${newStatus}.`);
      fetchEmployeeData(); 
    } catch (err) {
      console.error("Eroare la actualizarea statusului:", err.response?.data || err);
      showToast("Nu s-a putut actualiza statusul programării.");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  const inkFont = { fontFamily: "'Inter', sans-serif" };
  const displayFont = { fontFamily: "'Fraunces', serif" };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center text-[#2A2420]/60 text-[14px] tracking-wide" style={inkFont}>
        Se încarcă panoul specialistului...
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex flex-col items-center justify-center p-4" style={inkFont}>
        <p className="text-[#9B4A5C] text-[14px] tracking-wide mb-5 text-center">{error}</p>
        <button onClick={() => navigate("/login")} className="bg-[#2A2420] text-[#FAF6F1] px-6 py-2.5 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200">
          Mergi la login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F1] text-[#2A2420] py-12 px-8 relative" style={inkFont}>

      {/* Notificare discretă */}
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

      {/* Antet Panou Angajat */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 border border-[#2A2420]/12 p-7">
        <div>
          <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">Panou de lucru</span>
          <h1 className="text-[1.9rem] leading-tight mt-1" style={displayFont}>Specialist</h1>
          <p className="text-[#2A2420]/60 text-[14px] mt-1">
            Bine ai revenit, {employee.firstName} {employee.lastName} ({employee.email})
          </p>
        </div>
        <button onClick={handleLogout} className="bg-[#2A2420] text-[#FAF6F1] px-5 py-2.5 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200 shrink-0">
          Deconectare
        </button>
      </div>

      {/* Lista Programari */}
      <div className="max-w-6xl mx-auto border border-[#2A2420]/12 p-7">
        <h2 className="text-[1.4rem] mb-6" style={displayFont}>Programările mele</h2>

        {appointments.length === 0 ? (
          <div className="border border-dashed border-[#2A2420]/20 p-14 text-center">
            <p className="text-[#2A2420]/55 text-[14px]">Nu aveți nicio programare înregistrată în acest moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((app) => (
              <div key={app.id} className="border border-[#2A2420]/10 p-5 flex flex-col md:flex-row justify-between md:items-center hover:border-[#9B4A5C]/40 transition-colors duration-200">
                <div className="space-y-1.5">
                  <span className="text-[11px] tracking-[0.15em] uppercase text-[#9B4A5C]">
                    {app.serviceName}
                  </span>
                  <h3 className="text-[16px]" style={displayFont}>
                    Client: {app.clientFirstName} {app.clientLastName}
                  </h3>
                  <p className="text-[13px] text-[#2A2420]/60">
                    <span className="text-[#2A2420]/80">Data și ora:</span> {formatDate(app.startTime)}
                  </p>
                  <p className="text-[12px] text-[#2A2420]/45 tracking-wide">
                    Status curent: <span className="text-[#2A2420]/70">{app.status}</span>
                  </p>
                </div>

                <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center shrink-0">
                  {app.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                        className="border border-[#2A2420]/20 text-[#2A2420] px-4 py-2 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200"
                      >
                        Confirmă
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                        className="border border-[#2A2420]/20 text-[#2A2420]/70 px-4 py-2 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200"
                      >
                        Anulează
                      </button>
                    </>
                  )}

                  {app.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                        className="border border-[#2A2420]/20 text-[#2A2420] px-4 py-2 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200"
                      >
                        Marchează finalizată
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                        className="border border-[#2A2420]/20 text-[#2A2420]/70 px-4 py-2 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200"
                      >
                        Anulează
                      </button>
                    </>
                  )}

                  {app.status === 'COMPLETED' && (
                    <span className="text-[11px] tracking-[0.15em] uppercase text-[#2A2420]/50 border border-[#2A2420]/15 px-4 py-2">
                      Finalizată
                    </span>
                  )}

                  {app.status === 'CANCELLED' && (
                    <span className="text-[11px] tracking-[0.15em] uppercase text-[#9B4A5C]/70 border border-[#9B4A5C]/25 px-4 py-2 line-through">
                      Anulată
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
