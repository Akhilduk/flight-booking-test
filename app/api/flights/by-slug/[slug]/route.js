import { readFile } from "fs/promises";
import path from "path";

const FLIGHTS_PATH = path.join(process.cwd(), "data", "flights.json");

export async function GET(_req, { params }) {
  try {
    const { slug } = await params;
    const raw = await readFile(FLIGHTS_PATH, "utf-8");
    const flights = JSON.parse(raw);
    const flight = flights.find((item) => item.slug === slug);

    if (!flight) {
      return Response.json({ error: "Flight not found" }, { status: 404 });
    }

    return Response.json(flight);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to load flight" }, { status: 500 });
  }
}
