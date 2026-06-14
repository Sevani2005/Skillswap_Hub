import api from './axios';

export const createWorkshop = async (workshopData) => {
  const res = await api.post('/workshops', workshopData);
  return res.data;
};

export const getWorkshops = async () => {
  const res = await api.get('/workshops');
  return res.data;
};

export const getWorkshopById = async (id) => {
  const res = await api.get(`/workshops/${id}`);
  return res.data;
};

export const joinWorkshop = async (id) => {
  const res = await api.post(`/workshops/${id}/join`);
  return res.data;
};

export const leaveWorkshop = async (id) => {
  const res = await api.post(`/workshops/${id}/leave`);
  return res.data;
};
