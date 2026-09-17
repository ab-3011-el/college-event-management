const BASE = '/api';

const req = async (path, options = {}) => {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // Stats
  getStats:        ()              => req('/stats'),

  // Events
  getEvents:       (params = {})  => req('/events?' + new URLSearchParams(params)),
  getEvent:        (id)           => req(`/events/${id}`),
  createEvent:     (body)         => req('/events',       { method: 'POST', body: JSON.stringify(body) }),
  deleteEvent:     (id)           => req(`/events/${id}`, { method: 'DELETE' }),

  // Departments
  getDepartments:  ()             => req('/departments'),

  // Students
  getStudents:     ()             => req('/students'),
  createStudent:   (body)         => req('/students',     { method: 'POST', body: JSON.stringify(body) }),

  // Registrations
  getRegistrations:(params = {})  => req('/registrations?' + new URLSearchParams(params)),
  register:        (body)         => req('/registrations', { method: 'POST', body: JSON.stringify(body) }),
  cancelReg:       (id)           => req(`/registrations/${id}/cancel`, { method: 'PATCH' }),

  // Feedback
  getFeedback:     (eventId)      => req(`/feedback/${eventId}`),
  submitFeedback:  (body)         => req('/feedback',     { method: 'POST', body: JSON.stringify(body) }),
};
