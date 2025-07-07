const formatDateMuiInput = (date: string | Date) => {
  if (!date) return "";
  const dateObj = new Date(date);

  return dateObj.toISOString().split("T")[0];
};

const formatDateTimeMuiInput = (date: string | Date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj.toISOString().split("T")[0];
};

export { formatDateMuiInput, formatDateTimeMuiInput };
