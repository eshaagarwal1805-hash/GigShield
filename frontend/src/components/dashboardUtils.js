/**
 * dashboardUtils.js
 * Utility functions for date formatting and time calculations.
 */

export function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", 
    month: "short",
    hour: "2-digit", 
    minute: "2-digit",
  });
}

export function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", 
    minute: "2-digit",
  });
}

export function shiftDuration(start, end) {
  if (!start) return "00:00";
  const ms = (end ? new Date(end) : new Date()) - new Date(start);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  return `${h}:${m}`;
}

export function msToHHMM(ms) {
  if (!ms || ms <= 0) return "0h 0m";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}