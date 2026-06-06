export const getApiErrorMessage = (err, fallback) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.request) {
    return 'Cannot reach the API. Start the server (npm run dev:server) and check MongoDB Atlas IP access.';
  }
  return fallback;
};
