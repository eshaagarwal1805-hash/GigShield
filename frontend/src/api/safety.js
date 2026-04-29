import API from './axios';

// SOS

export const getActiveSOSAlert = () => API.get('/safety/sos/active');
export const triggerSOS        = (payload) => API.post('/safety/sos', payload);
export const fetchSOSHistory   = () => API.get('/safety/sos/history');
export const resolveSOS        = (id) => API.patch(`/safety/sos/${id}/resolve`);


// Anonymous report
export const submitRiskReport  = (payload) => API.post('/safety/report', payload);

// Heatmap
export const fetchHeatmap      = () => API.get('/safety/heatmap');

// Nearby risks
export const fetchNearbyRisks  = (lng, lat, radius = 5000) =>
  API.get('/safety/nearby', { params: { lng, lat, radius } });

// Nearby (simpler, no default radius)
export const fetchNearby       = (lng, lat)                =>
  API.get('/safety/nearby', { params: { lng, lat } });

// Polling-based notifications (call every ~30s)
export const fetchNearbyAlerts = (lng, lat, radius = 3000) =>
  API.get('/safety/alerts/nearby', { params: { lng, lat, radius } });

export const fetchActiveAlert = () => API.get('/safety/sos/active');