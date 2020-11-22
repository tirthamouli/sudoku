import Memo from '../lib/memo';
import { getSector } from '../utils/utils';

/**
 * This component represents the board
 */
export default class Board {
  /**
   * The sudoku board along with the DOM elements
   */
  board = new Array(9)

  /**
   * Creates a new memo
   */
  createNewMemo = () => {
    try {
      this.memo = new Memo(this.board);
      return true;
    } catch (e) {
      alert(e.message);
      return false;
    }
  }

  /**
   * Repaints the board
   */
  repaintBoard = () => {
    this.board.forEach((row) => row.forEach((cell) => {
      cell.$el.innerText = cell.value;
    }));
  }

  /**
   * Get the first unsolved cell after the current row and column
   * @param {Number} row - Current row
   * @param {Number} column - Current column
   */
  getFirstUnsolved = (row, column) => {
    for (let i = row; i < 9; i += 1) {
      for (let j = i === row ? column : 0; j < 9; j += 1) {
        if (this.board[i][j].value === '') {
          return [i, j];
        }
      }
    }
    return [false, false];
  }

  /**
   * Set the board value in array and in DOM
   * @param {Number} row - Row where the value needs to be set
   * @param {Number} column - Column where the value needs to be set
   * @param {Number} value - Value that needs to be set
   * @param {Boolean} visualizeMode - Weather we want to visualize or not.
   * If we want to visualize, then we set the previous value, else we don't
   */
  setCellValue = (row, column, value) => {
    // Step 1: Get the cell
    const cell = this.board[row][column];

    // Step 2: Set the value
    cell.value = value;
  }

  /**
   * Try one of the numbers
   * @param {Number} row
   * @param {Number} column
   * @param {Number} sector
   * @param {Number} num
   */
  tryOne = (row, column, sector, num) => {
    this.memo.setVal('row', row, num, true);
    this.memo.setVal('column', column, num, true);
    this.memo.setVal('sector', sector, num, true);
    this.setCellValue(row, column, num);

    const res = this.solveBoard(row, column);
    if (!res) {
      this.memo.setVal('row', row, num, false);
      this.memo.setVal('column', column, num, false);
      this.memo.setVal('sector', sector, num, false);
      this.setCellValue(row, column, '');
    }
    return res;
  }

  /**
   * Solves the board
   * @param {Number} row
   * @param {Number} column
   */
  solveBoard = (row = 0, column = 0) => {
    // Step 1: Base case
    const [x, y] = this.getFirstUnsolved(row, column);
    if (x === false) {
      return true;
    }

    // Step 2: Solve
    const s = getSector(x, y);
    let solved = false;
    for (let i = 1; i <= 9; i += 1) {
      if (!this.memo.checkIfIn('row', x, i)
      && !this.memo.checkIfIn('column', y, i)
      && !this.memo.checkIfIn('sector', s, i)) {
        solved = this.tryOne(x, y, s, i);
      }

      if (solved) {
        break;
      }
    }

    // Step 3: Return result
    return solved;
  }

  /**
   * Setup and solve board
   * @param {MouseEvent} event
   */
  setUpBeforeSolveAndSolve = async (event) => {
    if (this.createNewMemo()) {
      this.solveBoard();
      this.repaintBoard();
    }
  }

  /**
   * Set board from array
   * @param {String} value
   */
  handleInputFromArray = (value) => {
    try {
      const array = JSON.parse(value);
      array.forEach((row, i) => row.forEach(
        (cell, j) => this.setCellValue(i, j, cell === '.' ? '' : +cell),
      ));
      this.repaintBoard();
    } catch (_err) {
      alert('Incorrect array');
    }
  }

  /**
   * Handle input in any of the editable tds
   * @param {InputEvent} event
   */
  handleInput = (event) => {
    // Step 1: Destructuring
    const { target: element } = event;
    const { innerText: value } = element;

    // Step 2: Validation
    if (value.length !== 0 && !/^[0-9]$/.test(value)) {
      element.innerText = '';
      return;
    }

    // Step 3: Setting values
    const [x, y] = element.id.split('-');
    this.setCellValue(x, y, value.length === 0 ? '' : +value);
  }

  /**
   * Renders the board
   * @returns {HTMLTableElement} - The main table which holds the board
   */
  render() {
    // Step 1: Create the board
    for (let i = 0; i < 9; i += 1) {
      this.board[i] = new Array(9);
    }

    // Step 3: Generate the table
    const table = document.createElement('table');
    for (let i = 0; i < 9; i += 1) {
      // Individual row
      const tr = document.createElement('tr');

      for (let j = 0; j < 9; j += 1) {
        // Individual cell
        const td = document.createElement('td');

        // Setting attributes
        td.addEventListener('input', this.handleInput);
        td.setAttribute('id', `${i}-${j}`);
        td.contentEditable = true;

        // Append to the row
        tr.appendChild(td);

        // Setting the value in board
        this.board[i][j] = {
          $el: td,
          value: '',
        };
      }
      table.appendChild(tr);
    }
    return table;
  }
}
