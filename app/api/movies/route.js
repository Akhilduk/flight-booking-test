import { readFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const MOVIES_PATH = path.join(DATA_DIR, "movies.json");

export async function GET() {
  try {
    const raw = await readFile(MOVIES_PATH, "utf-8");
    const movies = JSON.parse(raw);
    return Response.json(movies);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to load movies" }, { status: 500 });
  }
}
