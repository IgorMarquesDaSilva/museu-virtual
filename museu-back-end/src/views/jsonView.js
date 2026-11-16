export function sendData(response, data, status = 200) {
  response.status(status).json({ data });
}

export function sendError(response, message, status = 500) {
  response.status(status).json({ error: message });
}
