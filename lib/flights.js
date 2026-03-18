export const CABIN_ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
export const CABIN_COLUMNS = [1, 2, 3, 4, 5, 6];

export function getAllSeatIds() {
  return CABIN_ROWS.flatMap((row) => CABIN_COLUMNS.map((col) => `${row}${col}`));
}

export function buildSeatMap(bookedSeats = []) {
  const booked = new Set(bookedSeats);

  return CABIN_ROWS.map((row, rowIndex) => ({
    row,
    cabin: rowIndex < 2 ? 'Business' : 'Economy',
    seats: CABIN_COLUMNS.map((column) => ({
      id: `${row}${column}`,
      column,
      priceModifier: rowIndex < 2 ? 2500 : rowIndex < 4 ? 1200 : 0,
      kind: column === 1 || column === 6 ? 'Window' : 'Aisle',
      booked: booked.has(`${row}${column}`),
    })),
  }));
}

export function calculateSeatPrice(basePrice, seatId) {
  const rowIndex = CABIN_ROWS.indexOf(seatId[0]);
  if (rowIndex === -1) return basePrice;
  if (rowIndex < 2) return basePrice + 2500;
  if (rowIndex < 4) return basePrice + 1200;
  return basePrice;
}

export function formatDuration(durationMinutes) {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
