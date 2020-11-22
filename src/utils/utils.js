/**
 * Get the sector from row and column
 * @param {Number} row
 * @param {Number} column
 */
export const getSector = (row, column) => {
  for (let i = 0; i < 9; i += 3) {
    if (row <= i + 2) {
      for (let j = 0; j < 9; j += 3) {
        if (column <= j + 2) {
          return (i + 1) + parseInt((j / 3), 10);
        }
      }
    }
  }
  return false;
};
