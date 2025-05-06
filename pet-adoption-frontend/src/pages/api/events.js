// pages/api/events.js
import axios from "axios";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default async function handler(req, res) {
  const { method, body, headers } = req;
  const authHeader = headers.authorization;

  try {
    // build axios options
    const opts = {
      url: `${BACKEND}/api/events`,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      // only attach a body for methods that support it
      ...(method !== "GET" && { data: body }),
    };

    const response = await axios(opts);

    // mirror the status & payload
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Next.js /api/events error:", error);

    const status = error.response?.status || 500;
    const data = error.response?.data || { error: error.message };

    res.status(status).json(data);
  }
}
