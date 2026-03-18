import { readFile } from "fs/promises";
import path from "path";

const FLIGHTS_PATH = path.join(process.cwd(), "data", "flights.json");

export async function GET() {
  try {
    const raw = await readFile(FLIGHTS_PATH, "utf-8");
    return Response.json(JSON.parse(raw));
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to load flights" }, { status: 500 });
  }
}
