import { readFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const MOVIES_PATH = path.join(DATA_DIR, "movies.json");

/**
 * GET /api/movies/by-slug/[slug]
 * Resolves a URL slug (e.g. "the-dark-knight") to a single movie.
 * In a real project, slugs are used in URLs for SEO and readability;
 * the server looks up the resource by slug and returns it (with id for internal APIs like seats).
 */
export async function GET(_req, { params }) {
  try {
    const slug = (await params).slug;
    const raw = await readFile(MOVIES_PATH, "utf-8");
    const movies = JSON.parse(raw);
    const movie = movies.find((m) => m.slug === slug);
    if (!movie) {
      return Response.json({ error: "Movie not found" }, { status: 404 });
    }
    return Response.json(movie);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to load movie" }, { status: 500 });
  }
}
