import { useState, useEffect } from "react";
import api from "./api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ro } from "date-fns/locale";

export default function AppointmentModal({ service, employee, onClose, onSuccess }) {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState(employee ? String(employee.id) : "");
  const [selectedDate, setSelectedDate] = useState(null);
  const [busySlots, setBusySlots] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (employee) return;

    api.get("/api/users/employees")
      .then((response) => setEmployees(response.data))
      .catch((err) => console.error("Eroare la preluarea angajaților:", err));
  }, [employee]);

  const dateString = selectedDate 
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : null;

  useEffect(() => {
    if (employeeId && dateString) {
      api.get(`/api/appointments/employee/${employeeId}/busy-slots?date=${dateString}`)
        .then((response) => setBusySlots(response.data))
        .catch((err) => console.error("Eroare la preluarea orelor ocupate:", err));
    }
  }, [employeeId, dateString]);

  useEffect(() => {
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
  }, []);

  const isNotSunday = (date) => date.getDay() !== 0; 

  const minTime = new Date();
  minTime.setHours(9, 0, 0, 0);

  const maxTime = new Date();
  maxTime.setHours(18, 0, 0, 0);

  const filterPassedTime = (time) => {
    const checkStartMins = time.getHours() * 60 + time.getMinutes();
    const checkEndMins = checkStartMins + service.durationMinutes; 

    if (checkEndMins > 18 * 60) {
      return false;
    }

    const isOverlapping = busySlots.some((slot) => {
      const startTimePart = slot.startTime.split('T')[1]; 
      const [startHour, startMin] = startTimePart.split(':').map(Number);
      const busyStartMins = startHour * 60 + startMin;

      const endTimePart = slot.endTime.split('T')[1]; 
      const [endHour, endMin] = endTimePart.split(':').map(Number);
      const busyEndMins = endHour * 60 + endMin;

      return checkStartMins < busyEndMins && busyStartMins < checkEndMins;
    });

    return !isOverlapping;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!selectedDate || !employeeId) {
      setError(employee ? "Te rugăm să alegi data și ora." : "Te rugăm să alegi specialistul, data și ora.");
      setLoading(false);
      return;
    }

    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      const startTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;

      const payload = {
        employeeId: Number(employeeId),
        serviceId: service.id,
        startTime: startTime,
      };

      await api.post("/api/appointments", payload);

      setToastMessage("Programarea a fost creată cu succes.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);

    } catch (err) {
      console.error("Eroare la programare:", err);
      const errorMessage = err.response?.data?.message || err.response?.data || "A apărut o eroare la programare.";
      setError(typeof errorMessage === 'string' ? errorMessage : "Eroare necunoscută.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#2A2420]/40 flex items-center justify-center p-4 z-50"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Notificare discretă */}
      {toastMessage && (
        <div
          className="absolute top-6 bg-[#FAF6F1] border border-[#2A2420]/15 border-l-4 border-l-[#9B4A5C] px-5 py-3.5 shadow-sm z-50 max-w-xs"
          style={{ animation: "slideIn 0.35s ease-out" }}
        >
          <p className="text-[13px] tracking-wide text-[#2A2420]">{toastMessage}</p>
        </div>
      )}

      <div
        className="bg-[#FAF6F1] max-w-md w-full p-8 relative border border-[#2A2420]/12"
        style={{ animation: "fadeIn 0.25s ease-out" }}
      >
        <span className="text-[11px] tracking-[0.25em] uppercase text-[#9B4A5C]">
          Ultimul pas
        </span>
        <h2
          className="text-[1.6rem] leading-tight mt-1.5 mb-1"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Finalizează programarea
        </h2>
        <p className="text-[#2A2420]/60 text-[14px] mb-6">
          {service.name} — {service.price} RON ({service.durationMinutes} min)
        </p>

        {error && (
          <div className="mb-5 p-3.5 border border-[#9B4A5C]/30 bg-[#9B4A5C]/5 text-[#9B4A5C] text-[13px] tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">
              Specialist
            </label>
            {employee ? (
              <div className="w-full border border-[#2A2420]/20 p-3 text-[15px] bg-[#2A2420]/[0.03] flex items-center gap-3">
                {employee.profilePictureUrl ? (
                  <img
                    src={employee.profilePictureUrl}
                    alt={`${employee.firstName} ${employee.lastName}`}
                    className="h-8 w-8 rounded-full object-cover border border-[#2A2420]/12 shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full border border-[#9B4A5C]/30 flex items-center justify-center text-[#9B4A5C] text-[12px] shrink-0" style={{ fontFamily: "'Fraunces', serif" }}>
                    {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                  </div>
                )}
                {employee.firstName} {employee.lastName}
              </div>
            ) : (
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full border border-[#2A2420]/20 p-3 text-[15px] focus:border-[#9B4A5C] focus:outline-none focus:ring-1 focus:ring-[#9B4A5C] bg-transparent transition-colors duration-200"
                required
              >
                <option value="">— Selectează un specialist —</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] tracking-wide uppercase text-[#2A2420]/60">
              Data și ora dorită
            </label>
            <div className="w-full relative custom-datepicker-wrapper">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
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
                disabled={!employeeId} 
                className="w-full border border-[#2A2420]/20 p-3 text-[15px] focus:border-[#9B4A5C] focus:outline-none focus:ring-1 focus:ring-[#9B4A5C] bg-transparent cursor-pointer disabled:bg-[#2A2420]/[0.03] disabled:cursor-not-allowed transition-colors duration-200"
                placeholderText={employeeId ? "Apasă pentru a alege data și ora..." : "Alege specialistul mai întâi..."}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#2A2420]/20 text-[#2A2420] py-3 text-[13px] tracking-wide hover:border-[#2A2420] transition-colors duration-200"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDate || !employeeId}
              className="flex-1 bg-[#2A2420] text-[#FAF6F1] py-3 text-[13px] tracking-wide hover:bg-[#9B4A5C] transition-colors duration-200 disabled:opacity-40 disabled:hover:bg-[#2A2420]"
            >
              {loading ? "Se trimite..." : "Confirmă"}
            </button>
          </div>
        </form>
      </div>

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
