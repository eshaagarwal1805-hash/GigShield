import { useState, useEffect } from 'react';
import { triggerSOS, resolveSOS, getActiveSOSAlert } from '../api/safety';

/**
 * Drop this anywhere in the worker dashboard.
 * Props:
 *   onShift {boolean} — pass the current shift status from parent
 */
export default function SOSButton({ onShift = false }) {
  const [activeAlert, setActiveAlert] = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [status,      setStatus]      = useState('');

  // On mount: restore active SOS state (survives page refresh)
  useEffect(() => {
    getActiveSOSAlert()
      .then(({ data }) => { if (data) setActiveAlert(data); })
      .catch(() => {});
  }, []);

  const getCoords = () =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
        reject
      )
    );

  const handleSOS = async () => {
    setLoading(true);
    setStatus('');
    try {
      const coordinates = await getCoords();
      const { data } = await triggerSOS({
        location: { coordinates },
        message: 'Emergency SOS triggered',
        onShift,
      });
      setActiveAlert(data);
      setStatus('SOS sent. Help is on the way.');
    } catch (err) {
      setStatus(
        err?.response?.data?.message || 'Failed to send SOS. Check location permissions.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!activeAlert) return;
    setLoading(true);
    try {
      await resolveSOS(activeAlert._id);
      setActiveAlert(null);
      setStatus('Alert resolved.');
    } catch (err) {
      setStatus('Failed to resolve alert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sos-wrapper">
      {!activeAlert ? (
        <button className="sos-btn" onClick={handleSOS} disabled={loading}>
          {loading ? 'Sending…' : '🆘 SOS'}
        </button>
      ) : (
        <button className="sos-resolve-btn" onClick={handleResolve} disabled={loading}>
          {loading ? 'Resolving…' : '✅ Resolve Alert'}
        </button>
      )}
      {status && <p className="sos-status">{status}</p>}
    </div>
  );
}