// Seat layout: rows A–F, columns 1–8
const ROWS = ["A", "B", "C", "D", "E", "F"];
const COLS = 8;

export function getAllSeatIds() {
  const ids = [];
  for (const row of ROWS) {
    for (let col = 1; col <= COLS; col++) {
      ids.push(`${row}${col}`);
    }
  }
  return ids;
}

export function getRows() {
  return ROWS;
}

export function getCols() {
  return COLS;
}
