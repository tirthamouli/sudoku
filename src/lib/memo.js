import { getSector } from '../utils/utils';

/**
 * A memo for the row, column and sector data
 */
export default class Memo {
  /**
   * Row memo data
   */
  row = new Map()

  /**
   * Column memo data
   */
  column = new Map()

  /**
   * Sector memo data
   */
  sector = new Map()

  /**
   * Check if the given position contains the value
   * @param {'row' | 'column' | 'sector'} rowOrColumnOrSector
   * @param {*} row
   * @param {*} column
   */
  checkIfIn = (rowOrColumnOrSector, pos, value) => this[rowOrColumnOrSector].get(pos)
  && this[rowOrColumnOrSector].get(pos).get(value)

  /**
   * Set a value in the map
   * @param {'row' | 'column' | 'sector'} rowOrColumnOrSector
   * @param {Number} row
   * @param {Number} column
   * @param {Number} value
   * @returns {Boolean} - True if successfull, false if not
   */
  setVal = (rowOrColumnOrSector, row, column, value) => {
    // Check if row is set
    if (this[rowOrColumnOrSector].get(row)) {
      // Check if true is already set and trying to set true
      if (value && this[rowOrColumnOrSector].get(row).get(column)) {
        return false;
      }

      this[rowOrColumnOrSector].get(row).set(column, value);
      return true;
    }

    // When row not set
    this[rowOrColumnOrSector].set(row, new Map([[column, value]]));
    return true;
  }

  /**
   * Genrates memo for the board
   * @param {Array} board
   */
  constructor(board) {
    for (let i = 0; i < board.length; i += 1) {
      const vertical = board[i];
      for (let j = 0; j < vertical.length; j += 1) {
        const cell = vertical[j];
        if (cell.value !== '') {
          if (!this.setVal('row', i, cell.value, true)
          || !this.setVal('column', j, cell.value, true)
          || !this.setVal('sector', getSector(i, j), cell.value, true)) {
            throw new Error('Incorrect board');
          }
        }
      }
    }
  }
}
