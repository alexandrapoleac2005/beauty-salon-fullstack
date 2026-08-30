import { useState, useEffect } from "react";
import api from "./api/axios";
import { useNavigate, Link } from "react-router-dom";

const CATEGORY_OPTIONS = [
  { value: "COAFOR_FRIZERIE", label: "Coafor / Frizerie" },
  { value: "MANICHIURA_PEDICHIURA", label: "Manichiură / Pedichiură" },
  { value: "GENE_SPRANCENE", label: "Gene / Sprâncene" },
  { value: "EPILARE_DEFINITIVA", label: "Epilare definitivă" },
];

const categoryLabel = (value) =>
  CATEGORY_OPTIONS.find((c) => c.value === value)?.label || value;

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("services"); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [serviceForm, setServiceForm] = useState({ name: "", description: "", price: "", durationMinutes: "", category: "" });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [employeeForm, setEmployeeForm] = useState({ firstName: "", lastName: "", email: "", password: "", phoneNumber: "", profilePictureUrl: "", serviceIds: [] });

  const [toastMessage, setToastMessage] = useState("");
  const [deactivateConfirmId, setDeactivateConfirmId] = useState(null);

  const navigate = useNavigate();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  const fetchAdminData = async () => {
    try {
      const userRes = await api.get("/api/users/me");
      const userData = userRes.data;

      if (userData.role !== "ADMIN") {
        setError("Acces interzis. Nu aveți rolul de administrator.");
        setLoading(false);
        return;
      }

      setUser(userData);

      const servicesRes = await api.get("/api/services");
      setServices(servicesRes.data);

      const employeesRes = await api.get("/api/users/employees");
      setEmployees(employeesRes.data);

      setLoading(false);
    } catch (err) {
      console.error("Eroare la încărcarea panoului de admin:", err);
      setError("Sesiunea a expirat sau a apărut o eroare.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...serviceForm,
        price: Number(serviceForm.price),
        durationMinutes: Number(serviceForm.durationMinutes)
      };

      if (editingServiceId) {
        await api.put(`/api/services/${editingServiceId}`, payload);
        showToast("Serviciul a fost actualizat cu succes.");
      } else {
        await api.post("/api/services", payload);
        showToast("Serviciul a fost adăugat cu succes.");
      }

      setServiceForm({ name: "", description: "", price: "", durationMinutes: "", category: "" });
      setEditingServiceId(null);
      fetchAdminData();
    } catch (err) {
      console.error("Eroare la salvarea serviciului:", err);
      showToast("Eroare la salvarea serviciului.");
    }
  };

  const handleEditService = (srv) => {
    setEditingServiceId(srv.id);
    setServiceForm({
      name: srv.name,
      description: srv.description || "",
      price: srv.price,
      durationMinutes: srv.durationMinutes,
      category: srv.category || ""
    });
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Sigur doriți să ștergeți acest serviciu?")) return;
    try {
      await api.delete(`/api/services/${id}`);
      showToast("Serviciul a fost șters.");
      fetchAdminData();
    } catch (err) {
      console.error("Eroare la ștergere:", err);
      showToast("Nu s-a putut șterge serviciul.");
    }
  };

  const toggleEmployeeService = (serviceId) => {
    setEmployeeForm((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...employeeForm,
        serviceIds: employeeForm.serviceIds.map(Number)
      };
      await api.post("/api/users/employees", payload);
      showToast("Angajatul a fost adăugat cu succes.");
      setEmployeeForm({ firstName: "", lastName: "", email: "", password: "", phoneNumber: "", profilePictureUrl: "", serviceIds: [] });
      fetchAdminData();
    } catch (err) {
      console.error("Eroare la adăugarea angajatului:", err);
      showToast("Eroare la adăugarea angajatului.");
    }
  };

  const handleDeactivateEmployee = async (id) => {
    try {
      await api.delete(`/api/users/employees/${id}`);
      showToast("Angajatul a fost dezactivat.");
      fetchAdminData();
    } catch (err) {
      console.error("Eroare la dezactivarea angajatului:", err);
      showToast("Nu s-a putut dezactiva angajatul.");
    }
  };

  const inkFont = { fontFamily: "'Inter', sans-serif" };
  const displayFont = { fontFamily: "'Fraunces', serif" };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center text-[#2A2420]/60 text-[14px] tracking-wide" style={inkFont}>
        Se încarcă panoul de control...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center text-[#9B4A5C] text-[14px] tracking-wide" style={inkFont}>
        {error}
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
      `}</style>

      {/* Antet Admin */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 border border-[#2A2420]/12 p-7">
        <div>
          <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">Panou de control</span>
          <h1 className="text-[1.9rem] leading-tight mt-1" style={displayFont}>Administrator</h1>
          <p className="text-[#2A2420]/60 text-[14px] mt-1">Autentificat ca: {user.firstName} {user.lastName}</p>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/" className="text-[13px] tracking-wide text-[#2A2420]/70 hover:text-[#2A2420] pb-1 border-b border-transparent hover:border-[#9B4A5C] transition-colors duration-200">
            Acasă
          </Link>
          <button onClick={handleLogout} className="bg-[#2A2420] text-[#FAF6F1] px-5 py-2.5 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200">
            Deconectare
          </button>
        </div>
      </div>

      {/* Navigare Tab-uri */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-3 border-b border-[#2A2420]/10">
        <button
          onClick={() => setActiveTab("services")}
          className={`px-5 py-3 text-[13px] tracking-wide transition-colors duration-200 border-b-2 -mb-px ${
            activeTab === "services"
              ? "border-[#9B4A5C] text-[#2A2420]"
              : "border-transparent text-[#2A2420]/50 hover:text-[#2A2420]"
          }`}
        >
          Gestionare servicii
        </button>
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-5 py-3 text-[13px] tracking-wide transition-colors duration-200 border-b-2 -mb-px ${
            activeTab === "employees"
              ? "border-[#9B4A5C] text-[#2A2420]"
              : "border-transparent text-[#2A2420]/50 hover:text-[#2A2420]"
          }`}
        >
          Gestionare angajați
        </button>
      </div>

      {/* Continut Tab 1: Servicii */}
      {activeTab === "services" && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formular Adaugare / Editare Serviciu */}
          <div className="border border-[#2A2420]/12 p-7 h-fit">
            <h2 className="text-[1.15rem] mb-5" style={displayFont}>
              {editingServiceId ? "Editează serviciul" : "Adaugă serviciu nou"}
            </h2>
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Nume serviciu</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Descriere</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  rows="3"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Categorie</label>
                <select
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  required
                >
                  <option value="">— Selectează o categorie —</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Preț (RON)</label>
                <input
                  type="number"
                  step="0.01"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Durată (minute)</label>
                <input
                  type="number"
                  value={serviceForm.durationMinutes}
                  onChange={(e) => setServiceForm({...serviceForm, durationMinutes: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={() => { setEditingServiceId(null); setServiceForm({ name: "", description: "", price: "", durationMinutes: "", category: "" }); }}
                    className="border border-[#2A2420]/20 text-[#2A2420] px-4 py-2 text-[13px] tracking-wide hover:border-[#2A2420] transition-colors duration-200"
                  >
                    Anulează
                  </button>
                )}
                <button type="submit" className="flex-1 bg-[#2A2420] text-[#FAF6F1] py-2.5 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200">
                  {editingServiceId ? "Salvează modificările" : "Adaugă serviciu"}
                </button>
              </div>
            </form>
          </div>

          {/* Lista Servicii Existente */}
          <div className="border border-[#2A2420]/12 p-7 col-span-1 lg:col-span-2">
            <h2 className="text-[1.15rem] mb-4" style={displayFont}>Lista serviciilor</h2>

            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setCategoryFilter("ALL")}
                className={`px-4 py-1.5 text-[12px] tracking-wide transition-colors duration-200 border ${
                  categoryFilter === "ALL"
                    ? "bg-[#2A2420] text-[#FAF6F1] border-[#2A2420]"
                    : "border-[#2A2420]/20 text-[#2A2420]/60 hover:border-[#2A2420]/40"
                }`}
              >
                Toate
              </button>
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategoryFilter(c.value)}
                  className={`px-4 py-1.5 text-[12px] tracking-wide transition-colors duration-200 border ${
                    categoryFilter === c.value
                      ? "bg-[#2A2420] text-[#FAF6F1] border-[#2A2420]"
                      : "border-[#2A2420]/20 text-[#2A2420]/60 hover:border-[#2A2420]/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {services
                .filter((srv) => categoryFilter === "ALL" || srv.category === categoryFilter)
                .map((srv) => (
                <div key={srv.id} className="border border-[#2A2420]/10 p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-[#9B4A5C]">{categoryLabel(srv.category)}</span>
                    <h3 className="text-[15px] mt-0.5" style={{ fontFamily: "'Fraunces', serif" }}>{srv.name}</h3>
                    <p className="text-[13px] text-[#2A2420]/60 mt-0.5">{srv.description || "Fără descriere"}</p>
                    <p className="text-[12px] text-[#2A2420]/45 mt-1 tracking-wide">
                      {srv.price} RON &nbsp;·&nbsp; {srv.durationMinutes} min
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEditService(srv)} className="border border-[#2A2420]/20 text-[#2A2420] px-3 py-1.5 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200">
                      Editează
                    </button>
                    <button onClick={() => handleDeleteService(srv.id)} className="border border-[#2A2420]/20 text-[#2A2420]/70 px-3 py-1.5 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200">
                      Șterge
                    </button>
                  </div>
                </div>
              ))}

              {services.filter((srv) => categoryFilter === "ALL" || srv.category === categoryFilter).length === 0 && (
                <p className="text-[13px] text-[#2A2420]/45 text-center py-8">
                  Niciun serviciu în această categorie.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Continut Tab 2: Angajati */}
      {activeTab === "employees" && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formular Adăugare Angajat */}
          <div className="border border-[#2A2420]/12 p-7 h-fit">
            <h2 className="text-[1.15rem] mb-5" style={displayFont}>Adaugă angajat nou</h2>
            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Prenume</label>
                <input
                  type="text"
                  value={employeeForm.firstName}
                  onChange={(e) => setEmployeeForm({...employeeForm, firstName: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Nume</label>
                <input
                  type="text"
                  value={employeeForm.lastName}
                  onChange={(e) => setEmployeeForm({...employeeForm, lastName: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Email</label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Parolă</label>
                <input
                  type="password"
                  value={employeeForm.password}
                  onChange={(e) => setEmployeeForm({...employeeForm, password: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Telefon</label>
                <input
                  type="text"
                  value={employeeForm.phoneNumber}
                  onChange={(e) => setEmployeeForm({...employeeForm, phoneNumber: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">
                  Poză de profil (URL)
                </label>
                <input
                  type="text"
                  value={employeeForm.profilePictureUrl}
                  onChange={(e) => setEmployeeForm({...employeeForm, profilePictureUrl: e.target.value})}
                  placeholder="https://..."
                  className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                />
                <p className="text-[11px] text-[#2A2420]/40 mt-1">Opțional — fără link, se vor afișa inițialele angajatului.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">
                  Servicii oferite
                </label>
                <div className="border border-[#2A2420]/20 p-3 max-h-40 overflow-y-auto space-y-1.5">
                  {services.length === 0 ? (
                    <p className="text-[13px] text-[#2A2420]/45">Nu există servicii create încă.</p>
                  ) : (
                    services.map((srv) => (
                      <label key={srv.id} className="flex items-center gap-2 text-[13px] text-[#2A2420]/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={employeeForm.serviceIds.includes(srv.id)}
                          onChange={() => toggleEmployeeService(srv.id)}
                          className="accent-[#9B4A5C]"
                        />
                        {srv.name}
                      </label>
                    ))
                  )}
                </div>
              </div>
              <button type="submit" className="w-full bg-[#2A2420] text-[#FAF6F1] py-2.5 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200">
                Creează cont angajat
              </button>
            </form>
          </div>

          {/* Listă Angajați */}
          <div className="border border-[#2A2420]/12 p-7 col-span-1 lg:col-span-2">
            <h2 className="text-[1.15rem] mb-5" style={displayFont}>Echipa de specialiști</h2>
            <div className="space-y-3">
              {employees.map((emp) => (
                <div key={emp.id} className="border border-[#2A2420]/10 p-4 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {emp.profilePictureUrl ? (
                      <img
                        src={emp.profilePictureUrl}
                        alt={`${emp.firstName} ${emp.lastName}`}
                        className="h-12 w-12 rounded-full object-cover border border-[#2A2420]/12 shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full border border-[#9B4A5C]/30 flex items-center justify-center text-[#9B4A5C] text-[14px] shrink-0" style={{ fontFamily: "'Fraunces', serif" }}>
                        {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-[15px]" style={{ fontFamily: "'Fraunces', serif" }}>{emp.firstName} {emp.lastName}</h3>
                      <p className="text-[13px] text-[#2A2420]/60 mt-0.5">{emp.email}</p>
                      <p className="text-[12px] text-[#2A2420]/45 mt-0.5 tracking-wide">{emp.phoneNumber}</p>
                      {emp.services && emp.services.length > 0 && (
                        <p className="text-[11px] text-[#2A2420]/45 mt-1 tracking-wide truncate">
                          {emp.services.map((s) => s.name).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] tracking-[0.15em] uppercase text-[#9B4A5C] border border-[#9B4A5C]/30 px-3 py-1">
                      {emp.role}
                    </span>
                    <button
                      onClick={() => setDeactivateConfirmId(emp.id)}
                      className="border border-[#2A2420]/20 text-[#2A2420]/70 px-3 py-1.5 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200"
                    >
                      Dezactivează
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {deactivateConfirmId && (
        <div className="fixed inset-0 bg-[#2A2420]/40 flex items-center justify-center p-4 z-50">
          <div className="bg-[#FAF6F1] max-w-sm w-full p-8 text-center border border-[#2A2420]/12">
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">
              Confirmare
            </span>
            <h3 className="text-[1.4rem] leading-tight mt-1.5 mb-3" style={displayFont}>
              Dezactivezi angajatul?
            </h3>
            <p className="text-[#2A2420]/60 text-[14px] leading-relaxed mb-7">
              Contul nu se șterge — dispare din listă și de pe pagina de echipă, dar programările lui vechi rămân intacte.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeactivateConfirmId(null)}
                className="flex-1 border border-[#2A2420]/20 text-[#2A2420] py-3 text-[13px] tracking-wide hover:border-[#2A2420] transition-colors duration-200"
              >
                Renunță
              </button>
              <button
                onClick={() => {
                  handleDeactivateEmployee(deactivateConfirmId);
                  setDeactivateConfirmId(null);
                }}
                className="flex-1 bg-[#9B4A5C] text-[#FAF6F1] py-3 text-[13px] tracking-wide hover:bg-[#2A2420] transition-colors duration-200"
              >
                Da, dezactivează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
