import { useState, useEffect } from "react";
import api from "./api/axios";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ro } from "date-fns/locale";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [hiddenAppointmentIds, setHiddenAppointmentIds] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newStartTime, setNewStartTime] = useState(null);
  const [busySlots, setBusySlots] = useState([]);

  const [toastMessage, setToastMessage] = useState("");

  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  const fetchProfileData = async () => {
    try {
      const userRes = await api.get("/api/users/me");
      const userData = userRes.data;
      setUser(userData);
      
      let appRes;
      if (userData.role === "ADMIN") {
        appRes = await api.get("/api/appointments");
      } else if (userData.role === "EMPLOYEE") {
        appRes = await api.get(`/api/appointments/employee/${userData.id}`);
      } else {
        appRes = await api.get(`/api/appointments/client/${userData.id}`);
      }
      
      setAppointments(appRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Eroare la preluarea datelor:", err);
      setError("Sesiunea a expirat sau a apărut o eroare. Te rugăm să te reloghezi.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const dateString = newStartTime 
    ? `${newStartTime.getFullYear()}-${String(newStartTime.getMonth() + 1).padStart(2, '0')}-${String(newStartTime.getDate()).padStart(2, '0')}`
    : null;

  useEffect(() => {
    if (selectedAppointment && dateString) {
      api.get(`/api/appointments/employee/${selectedAppointment.employeeId}/busy-slots?date=${dateString}`)
        .then((response) => setBusySlots(response.data))
        .catch((err) => console.error("Eroare la preluarea orelor ocupate:", err));
    }
  }, [selectedAppointment, dateString]);

  useEffect(() => {
    if (!rescheduleModalOpen) return;
    const observer = new MutationObserver(() => {
      const timeListContainer = document.querySelector('.react-datepicker__time-list');
      if (timeListContainer) {
        const items = timeListContainer.querySelectorAll('.react-datepicker__time-list-item');
        items.forEach(item => {
          const timeText = item.textContent.trim(); 
          const [hour, minute] = timeText.split(':').map(Number);
          
          if (!isNaN(hour)) {
            if (hour < 9 || hour > 18 || (hour === 18 && minute > 0)) {
              item.style.display = 'none';
            } else {
              item.style.display = 'block';
            }
          }
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [rescheduleModalOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const startEditing = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
    });
    setIsEditing(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("/api/users/me", formData);
      setUser(response.data);
      setIsEditing(false);
      showToast("Profilul a fost actualizat cu succes.");
    } catch (err) {
      console.error("Eroare la actualizare:", err);
      showToast("Eroare la actualizarea profilului.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("Parolele noi nu coincid.");
      return;
    }

    try {
      await api.put("/api/users/change-password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMessage("Parola a fost schimbată cu succes.");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Eroare la schimbarea parolei:", err);
      const errMsg = err.response?.data?.message || err.response?.data || "Parola veche este incorectă sau nu respectă cerințele.";
      setPasswordMessage(typeof errMsg === 'string' ? errMsg : "Eroare la schimbarea parolei.");
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}/cancel`);
      showToast("Programarea a fost anulată.");
      fetchProfileData(); 
    } catch (err) {
      console.error("Eroare la anulare:", err);
      showToast("Nu s-a putut anula programarea.");
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}/status`, {
        status: newStatus
      });
      showToast(`Status actualizat cu succes la ${newStatus}.`);
      fetchProfileData();
    } catch (err) {
      console.error("Eroare la actualizarea statusului:", err);
      showToast("Nu s-a putut actualiza statusul.");
    }
  };

  const handleHideCompletedOrCancelled = () => {
    const idsToHide = appointments
      .filter(app => app.status === 'COMPLETED' || app.status === 'CANCELLED')
      .map(app => app.id);
    
    setHiddenAppointmentIds(prev => [...prev, ...idsToHide]);
  };

  const openRescheduleModal = (app) => {
    setSelectedAppointment(app);
    setNewStartTime(null);
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!newStartTime || !selectedAppointment) return;

    try {
      const year = newStartTime.getFullYear();
      const month = String(newStartTime.getMonth() + 1).padStart(2, '0');
      const day = String(newStartTime.getDate()).padStart(2, '0');
      const hours = String(newStartTime.getHours()).padStart(2, '0');
      const minutes = String(newStartTime.getMinutes()).padStart(2, '0');
      const formattedStartTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;

      await api.put(`/api/appointments/${selectedAppointment.id}/reschedule`, {
        newStartTime: formattedStartTime
      });

      showToast("Programarea a fost reprogramată cu succes.");
      setRescheduleModalOpen(false);
      fetchProfileData();
    } catch (err) {
      console.error("Eroare la reprogramare:", err);
      const errorData = err.response?.data;
      let errorMessage = "Eroare la reprogramare.";
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      showToast(errorMessage);
    }
  };

  const isNotSunday = (date) => date.getDay() !== 0;
  const minTime = new Date();
  minTime.setHours(9, 0, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(18, 0, 0, 0);

  const filterPassedTime = (time) => {
    if (!selectedAppointment) return true;
    const checkStartMins = time.getHours() * 60 + time.getMinutes();
    const duration = selectedAppointment.durationMinutes || 45; 
    const checkEndMins = checkStartMins + duration;

    if (checkEndMins > 18 * 60) return false;

    return !busySlots.some((slot) => {
      const startTimePart = slot.startTime.split('T')[1];
      const [startHour, startMin] = startTimePart.split(':').map(Number);
      const busyStartMins = startHour * 60 + startMin;

      const endTimePart = slot.endTime.split('T')[1];
      const [endHour, endMin] = endTimePart.split(':').map(Number);
      const busyEndMins = endHour * 60 + endMin;

      return checkStartMins < busyEndMins && busyStartMins < checkEndMins;
    });
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
        Se încarcă profilul...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex flex-col items-center justify-center" style={inkFont}>
        <p className="text-[#9B4A5C] text-[14px] tracking-wide mb-5">{error}</p>
        <Link to="/login" className="bg-[#2A2420] text-[#FAF6F1] px-6 py-2.5 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200">
          Mergi la login
        </Link>
      </div>
    );
  }

  const isEmployeeOrAdmin = user.role === "EMPLOYEE" || user.role === "ADMIN";
  const isAdmin = user.role === "ADMIN";
  const isEmployee = user.role === "EMPLOYEE";

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-[#9B4A5C] border-[#9B4A5C]/30';
      case 'CANCELLED':
        return 'text-[#9B4A5C]/60 border-[#9B4A5C]/20 line-through';
      case 'COMPLETED':
        return 'text-[#2A2420]/45 border-[#2A2420]/15';
      default: // PENDING
        return 'text-[#2A2420]/70 border-[#2A2420]/25';
    }
  };

  const filteredAppointments = appointments
    .filter(app => !hiddenAppointmentIds.includes(app.id))
    .filter(app => {
      if (statusFilter === "ALL") return true;
      return app.status === statusFilter;
    });

  const filters = [
    { key: "ALL", label: "Toate" },
    { key: "PENDING", label: "În așteptare" },
    { key: "CONFIRMED", label: "Confirmate" },
    { key: "COMPLETED", label: "Finalizate" },
    { key: "CANCELLED", label: "Anulate" },
  ];

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

      <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-4 mb-8 border-b border-[#2A2420]/10 pb-6">
        <div className="space-y-2">
          <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">
            {isAdmin ? "Panou administrator" : isEmployee ? "Panou specialist" : "Contul tău"}
          </span>
          <h1 className="text-[1.9rem] leading-tight" style={displayFont}>
            {isEmployeeOrAdmin ? user.firstName : `Bun venit, ${user.firstName}`}
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/" className="text-[13px] tracking-wide text-[#2A2420]/70 hover:text-[#2A2420] pb-1 border-b border-transparent hover:border-[#9B4A5C] transition-colors duration-200">
            Acasă
          </Link>

          {user.role === "ADMIN" && (
            <Link to="/admin-dashboard" className="bg-[#2A2420] text-[#FAF6F1] px-5 py-2.5 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200">
              Panou admin
            </Link>
          )}

          {!isEmployeeOrAdmin && (
            <Link to="/team" className="border border-[#2A2420]/20 text-[#2A2420] px-5 py-2.5 text-[13px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200">
             Echipa noastră 
            </Link>
          )}
          <button onClick={handleLogout} className="bg-[#2A2420] text-[#FAF6F1] px-5 py-2.5 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200">
            Deconectare
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 col-span-1">
          <div className="border border-[#2A2420]/12 p-7">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 border border-[#9B4A5C]/30 flex items-center justify-center text-[#9B4A5C] text-[18px]" style={displayFont}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <h2 className="text-[17px]" style={displayFont}>{user.firstName} {user.lastName}</h2>
                <span className="text-[11px] tracking-[0.15em] uppercase text-[#9B4A5C]">{user.role}</span>
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] tracking-wide uppercase text-[#2A2420]/45">Email</p>
                  <p className="text-[#2A2420] text-[14px] mt-0.5">{user.email}</p>
                </div>
                <div>
                  <p className="text-[12px] tracking-wide uppercase text-[#2A2420]/45">Telefon</p>
                  <p className="text-[#2A2420] text-[14px] mt-0.5">{user.phoneNumber}</p>
                </div>
                <button onClick={startEditing} className="w-full mt-4 border border-[#2A2420]/20 text-[#2A2420] py-3 text-[13px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200">
                  Editează profilul
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Prenume</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Nume</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Telefon</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full border border-[#2A2420]/20 p-2.5 text-[14px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 border border-[#2A2420]/20 text-[#2A2420] py-2.5 text-[13px] tracking-wide hover:border-[#2A2420] transition-colors duration-200">Anulează</button>
                  <button type="submit" className="flex-1 bg-[#2A2420] text-[#FAF6F1] py-2.5 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200">Salvează</button>
                </div>
              </form>
            )}
          </div>

          <div className="border border-[#2A2420]/12 p-7">
            <h3 className="text-[15px] mb-4" style={displayFont}>Securitate</h3>

            {passwordMessage && (
              <p className={`mb-4 text-[12px] tracking-wide border px-3.5 py-2 ${
                passwordMessage.startsWith('Parola a fost')
                  ? 'border-[#2A2420]/15 text-[#2A2420] bg-[#2A2420]/[0.03]'
                  : 'border-[#9B4A5C]/30 text-[#9B4A5C] bg-[#9B4A5C]/5'
              }`}>
                {passwordMessage}
              </p>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] tracking-wide uppercase text-[#2A2420]/55">Parola veche</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2 text-[13px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] tracking-wide uppercase text-[#2A2420]/55">Parola nouă</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2 text-[13px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] tracking-wide uppercase text-[#2A2420]/55">Confirmă parola nouă</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full border border-[#2A2420]/20 p-2 text-[13px] bg-transparent focus:border-[#9B4A5C] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-[#2A2420] text-[#FAF6F1] py-2.5 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200 mt-2">
                Schimbă parola
              </button>
            </form>
          </div>
        </div>

        <div className="border border-[#2A2420]/12 p-7 col-span-1 lg:col-span-2 h-fit">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-[1.4rem]" style={displayFont}>
              {isAdmin ? "Programările clienților" : isEmployee ? "Agenda mea de lucru" : "Programările mele"}
            </h2>

            <button
              onClick={handleHideCompletedOrCancelled}
              className="text-[12px] tracking-wide border border-[#2A2420]/20 text-[#2A2420]/70 px-3.5 py-2 hover:border-[#2A2420] hover:text-[#2A2420] transition-colors duration-200"
            >
              Curăță finalizate / anulate
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-4 py-1.5 text-[12px] tracking-wide transition-colors duration-200 border ${
                  statusFilter === f.key
                    ? "bg-[#2A2420] text-[#FAF6F1] border-[#2A2420]"
                    : "border-[#2A2420]/20 text-[#2A2420]/60 hover:border-[#2A2420]/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          
          {filteredAppointments.length === 0 ? (
            <div className="border border-dashed border-[#2A2420]/20 p-14 text-center">
              <p className="text-[#2A2420]/55 text-[14px] mb-5">
                Nu există programări pentru filtrul selectat.
              </p>
              {!isEmployeeOrAdmin && (
                <Link to="/team" className="inline-block bg-[#2A2420] text-[#FAF6F1] px-6 py-3 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200">
                  Programează-te acum
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((app) => (
                <div key={app.id} className="border border-[#2A2420]/10 p-5 flex flex-col md:flex-row justify-between md:items-center hover:border-[#9B4A5C]/40 transition-colors duration-200">
                  <div>
                    <h3 className="text-[16px]" style={displayFont}>{app.serviceName}</h3>

                    {isAdmin ? (
                      <>
                        <p className="text-[13px] text-[#2A2420]/60 mt-1"><span className="text-[#2A2420]/80">Client:</span> {app.clientFirstName} {app.clientLastName}</p>
                        <p className="text-[13px] text-[#2A2420]/60"><span className="text-[#2A2420]/80">Specialist:</span> {app.employeeFirstName} {app.employeeLastName}</p>
                      </>
                    ) : isEmployee ? (
                      <p className="text-[13px] text-[#2A2420]/60 mt-1"><span className="text-[#2A2420]/80">Client:</span> {app.clientFirstName} {app.clientLastName}</p>
                    ) : (
                      <p className="text-[13px] text-[#2A2420]/60 mt-1"><span className="text-[#2A2420]/80">Specialist:</span> {app.employeeFirstName} {app.employeeLastName}</p>
                    )}

                    <p className="text-[13px] text-[#2A2420]/60"><span className="text-[#2A2420]/80">Data:</span> {formatDate(app.startTime)}</p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-col md:items-end gap-2 shrink-0">
                    <span className={`text-[11px] tracking-[0.15em] uppercase px-3 py-1 border ${statusBadgeClass(app.status)}`}>
                      {app.status}
                    </span>

                    {!isEmployeeOrAdmin && app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openRescheduleModal(app)}
                          className="border border-[#2A2420]/20 text-[#2A2420] px-3 py-1.5 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200"
                        >
                          Reprogramare
                        </button>
                        <button
                          onClick={() => setCancelConfirmId(app.id)}
                          className="border border-[#2A2420]/20 text-[#2A2420]/70 px-3 py-1.5 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200"
                        >
                          Anulează
                        </button>
                      </div>
                    )}

                    {isEmployee && app.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                          className="border border-[#2A2420]/20 text-[#2A2420] px-3 py-1.5 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200"
                        >
                          Confirmă
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                          className="border border-[#2A2420]/20 text-[#2A2420]/70 px-3 py-1.5 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200"
                        >
                          Anulează
                        </button>
                      </div>
                    )}

                    {isEmployee && app.status === 'CONFIRMED' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                          className="border border-[#2A2420]/20 text-[#2A2420] px-3 py-1.5 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200"
                        >
                          Finalizată
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                          className="border border-[#2A2420]/20 text-[#2A2420]/70 px-3 py-1.5 text-[12px] tracking-wide hover:border-[#9B4A5C] hover:text-[#9B4A5C] transition-colors duration-200"
                        >
                          Anulează
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {rescheduleModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-[#2A2420]/40 flex items-center justify-center p-4 z-50">
          <div className="bg-[#FAF6F1] max-w-md w-full p-8 border border-[#2A2420]/12 relative" style={{ animation: "fadeIn 0.25s ease-out" }}>
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">Reprogramare</span>
            <h2 className="text-[1.5rem] leading-tight mt-1.5 mb-1" style={displayFont}>Alege o nouă oră</h2>
            <p className="text-[#2A2420]/60 text-[14px] mb-6">
              {selectedAppointment.serviceName} cu {selectedAppointment.employeeFirstName} {selectedAppointment.employeeLastName}
            </p>

            <form onSubmit={handleConfirmReschedule} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">Noua dată și oră</label>
                <div className="w-full relative custom-datepicker-wrapper">
                  <DatePicker
                    selected={newStartTime}
                    onChange={(date) => setNewStartTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Ora"
                    dateFormat="d MMMM yyyy, HH:mm"
                    locale={ro}
                    minDate={new Date()}
                    filterDate={isNotSunday}
                    minTime={minTime}
                    maxTime={maxTime}
                    filterTime={filterPassedTime}
                    className="w-full border border-[#2A2420]/20 p-3 text-[15px] bg-transparent focus:border-[#9B4A5C] focus:outline-none focus:ring-1 focus:ring-[#9B4A5C] cursor-pointer transition-colors duration-200"
                    placeholderText="Alege noua dată și oră..."
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="flex-1 border border-[#2A2420]/20 text-[#2A2420] py-3 text-[13px] tracking-wide hover:border-[#2A2420] transition-colors duration-200"
                >
                  Renunță
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2A2420] text-[#FAF6F1] py-3 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200"
                >
                  Confirmă
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelConfirmId && (
        <div className="fixed inset-0 bg-[#2A2420]/40 flex items-center justify-center p-4 z-50">
          <div
            className="bg-[#FAF6F1] max-w-sm w-full p-8 text-center border border-[#2A2420]/12"
            style={{ animation: "fadeIn 0.25s ease-out" }}
          >
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">
              Confirmare
            </span>
            <h3 className="text-[1.4rem] leading-tight mt-1.5 mb-3" style={displayFont}>
              Anulezi programarea?
            </h3>
            <p className="text-[#2A2420]/60 text-[14px] leading-relaxed mb-7">
              Acțiunea nu poate fi anulată. Locul din agendă va deveni disponibil pentru altcineva.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirmId(null)}
                className="flex-1 border border-[#2A2420]/20 text-[#2A2420] py-3 text-[13px] tracking-wide hover:border-[#2A2420] transition-colors duration-200"
              >
                Renunță
              </button>
              <button
                onClick={() => {
                  handleCancelAppointment(cancelConfirmId);
                  setCancelConfirmId(null);
                }}
                className="flex-1 bg-[#9B4A5C] text-[#FAF6F1] py-3 text-[13px] tracking-wide hover:bg-[#2A2420] transition-colors duration-200"
              >
                Da, anulează
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__time-container { width: 100px !important; }
        .react-datepicker__time-box { width: 100% !important; }
        .react-datepicker-popper { z-index: 9999 !important; }

        .react-datepicker {
          font-family: 'Inter', sans-serif !important;
          border-color: rgba(42,36,32,0.12) !important;
          border-radius: 0 !important;
        }
        .react-datepicker__header {
          background-color: #FAF6F1 !important;
          border-bottom: 1px solid rgba(42,36,32,0.1) !important;
        }
        .react-datepicker__current-month,
        .react-datepicker-time__header {
          font-family: 'Fraunces', serif !important;
          color: #2A2420 !important;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected,
        .react-datepicker__time-list-item--selected {
          background-color: #9B4A5C !important;
          color: #FAF6F1 !important;
        }
        .react-datepicker__day:hover,
        .react-datepicker__time-list-item:hover {
          background-color: rgba(155,74,92,0.12) !important;
        }

        .react-datepicker__day--disabled,
        .react-datepicker__time-list-item--disabled { 
          color: rgba(42,36,32,0.3) !important; 
          text-decoration: line-through; 
          cursor: not-allowed !important; 
          background-color: transparent !important;
        } 
      `}} />
    </div>
  );
}
