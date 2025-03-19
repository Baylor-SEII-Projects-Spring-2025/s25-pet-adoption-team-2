import axios from "axios";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const response = await axios.get("http://35.225.196.242:8080/api/events");
        res.status(200).json(response.data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch events" });
      }
      break;
    case "POST":
      try {
        const response = await axios.post("http://35.225.196.242:8080/api/events", req.body);
        res.status(201).json(response.data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create event" });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}