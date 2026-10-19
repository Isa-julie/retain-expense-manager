export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Turns any error into a clean JSON message the frontend can show.
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong.';

  if (err.name === 'CastError') {
    status = 400;
    message = 'That id is not valid.';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(' ');
  } else if (err.code === 11000) {
    status = 409;
    message = 'That value is already taken.';
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Something went wrong on the server.' : message });
}
