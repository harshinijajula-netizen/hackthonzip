export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message =
    status === 500
      ? "Something went wrong on our end. Please try again."
      : err.message || "Request failed.";
  res.status(status).json({ message });
};

export const notFound = (req, res) => {
  res.status(404).json({ message: "Route not found." });
};
