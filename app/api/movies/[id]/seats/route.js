import { readFile, writeFile } from "fs/promises";
import path from "path";
import { getAllSeatIds } from "@/lib/seats";

const DATA_DIR = path.join(process.cwd(), "data");
const BOOKINGS_PATH = path.join(DATA_DIR, "bookings.json");

export async function GET(_req, { params }) {
  try {
    const id = (await params).id;
    let bookings = {};
    try {
      const raw = await readFile(BOOKINGS_PATH, "utf-8");
      bookings = JSON.parse(raw);
    } catch {
      // file may not exist yet
    }
    const bookedSeats = bookings[id] || [];
    const allSeats = getAllSeatIds();
    const seats = allSeats.map((seatId) => ({
      id: seatId,
      booked: bookedSeats.includes(seatId),
    }));
    return Response.json({ seats, bookedSeats });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to load seats" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const id = (await params).id;
    const body = await req.json();
    const { seats: seatsToBook } = body;
    if (!Array.isArray(seatsToBook) || seatsToBook.length === 0) {
      return Response.json(
        { error: "Please provide a non-empty array of seat ids" },
        { status: 400 }
      );
    }
    let bookings = {};
    try {
      const raw = await readFile(BOOKINGS_PATH, "utf-8");
      bookings = JSON.parse(raw);
    } catch {
      // file may not exist yet
    }
    const existing = bookings[id] || [];
    const allSeats = getAllSeatIds();
    const invalid = seatsToBook.filter((s) => !allSeats.includes(s));
    if (invalid.length) {
      return Response.json(
        { error: `Invalid seat(s): ${invalid.join(", ")}` },
        { status: 400 }
      );
    }
    const alreadyBooked = seatsToBook.filter((s) => existing.includes(s));
    if (alreadyBooked.length) {
      return Response.json(
        { error: `Already booked: ${alreadyBooked.join(", ")}` },
        { status: 409 }
      );
    }
    bookings[id] = [...existing, ...seatsToBook];
    await writeFile(BOOKINGS_PATH, JSON.stringify(bookings, null, 2));
    return Response.json({
      success: true,
      booked: seatsToBook,
      message: `Booked ${seatsToBook.length} seat(s): ${seatsToBook.join(", ")}`,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to book seats" }, { status: 500 });
  }
}
