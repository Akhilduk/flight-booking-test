import { readFile, writeFile } from "fs/promises";
import path from "path";
import { buildSeatMap, calculateSeatPrice, getAllSeatIds } from "@/lib/flights";

const FLIGHTS_PATH = path.join(process.cwd(), "data", "flights.json");
const BOOKINGS_PATH = path.join(process.cwd(), "data", "bookings.json");

async function readJson(filePath, fallback) {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const flights = await readJson(FLIGHTS_PATH, []);
    const flight = flights.find((item) => item.id === id);

    if (!flight) {
      return Response.json({ error: "Flight not found" }, { status: 404 });
    }

    const bookings = await readJson(BOOKINGS_PATH, {});
    const reservations = bookings[id] || [];
    const bookedSeats = reservations.map((reservation) => reservation.seatId);

    return Response.json({
      flightId: id,
      bookedSeats,
      reservations,
      seatMap: buildSeatMap(bookedSeats),
      availableSeats: getAllSeatIds().length - bookedSeats.length,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to load seat map" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const payload = await req.json();
    const { seats, passengerName, email, phone, tripType, cabinClass, specialRequest } = payload;

    if (!Array.isArray(seats) || seats.length === 0 || !passengerName || !email) {
      return Response.json({ error: "Passenger info and at least one seat are required" }, { status: 400 });
    }

    const flights = await readJson(FLIGHTS_PATH, []);
    const flight = flights.find((item) => item.id === id);
    if (!flight) {
      return Response.json({ error: "Flight not found" }, { status: 404 });
    }

    const validSeats = new Set(getAllSeatIds());
    const invalidSeats = seats.filter((seatId) => !validSeats.has(seatId));
    if (invalidSeats.length > 0) {
      return Response.json({ error: `Invalid seats: ${invalidSeats.join(", ")}` }, { status: 400 });
    }

    const bookings = await readJson(BOOKINGS_PATH, {});
    const existingReservations = bookings[id] || [];
    const bookedSeats = new Set(existingReservations.map((reservation) => reservation.seatId));
    const conflicts = seats.filter((seatId) => bookedSeats.has(seatId));
    if (conflicts.length > 0) {
      return Response.json({ error: `These seats were just booked: ${conflicts.join(", ")}` }, { status: 409 });
    }

    const newReservations = seats.map((seatId) => ({
      seatId,
      passengerName,
      email,
      phone,
      tripType,
      cabinClass,
      specialRequest,
      price: calculateSeatPrice(flight.basePrice, seatId),
      bookedAt: new Date().toISOString(),
    }));

    bookings[id] = [...existingReservations, ...newReservations];
    await writeFile(BOOKINGS_PATH, JSON.stringify(bookings, null, 2));

    const total = newReservations.reduce((sum, item) => sum + item.price, 0);

    return Response.json({
      success: true,
      bookedSeats: seats,
      reservations: newReservations,
      total,
      message: `Booking confirmed for ${passengerName}. ${seats.length} seat(s) reserved.`,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to complete booking" }, { status: 500 });
  }
}
