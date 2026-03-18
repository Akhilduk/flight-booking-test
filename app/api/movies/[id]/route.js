import { readFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const MOVIES_PATH = path.join(DATA_DIR, "movies.json");

export async function GET(_req, { params }) {
  // console.log("GET request received", params);
  try {
    const id = (await params).id;
    const raw = await readFile(MOVIES_PATH, "utf-8");
    const movies = JSON.parse(raw);
    const movie = movies.find((m) => m.id === id);
    if (!movie) {
      return Response.json({ error: "Movie not found" }, { status: 404 });
    }
    return Response.json(movie);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to load movie" }, { status: 500 });
  }
}
