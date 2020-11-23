import './board.css';
import Memo2D from '../lib/memo2D';
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
   * Sets up the initial memo
   */
  setUpMemo = () => {
    this.board.forEach((vertical, i) => vertical.forEach((cell, j) => {
      if (cell.value !== '') {
        if (!this.row.setVal(i, cell.value, true)
              || !this.column.setVal(j, cell.value, true)
            || !this.sector.setVal(getSector(i, j), cell.value, true)) {
          throw new Error('Incorrect board');
        }
      }
    }));
  }

  /**
   * Creates a new memo for row column and sector
   */
  createNewMemo = () => {
    this.row = new Memo2D();
    this.column = new Memo2D();
    this.sector = new Memo2D();
    try {
      this.setUpMemo();
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
    this.row.setVal(row, num, true);
    this.column.setVal(column, num, true);
    this.sector.setVal(sector, num, true);
    this.setCellValue(row, column, num);

    const res = this.solveBoard(row, column);
    if (!res) {
      this.row.setVal(row, num, false);
      this.column.setVal(column, num, false);
      this.sector.setVal(sector, num, false);
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
      if (!this.row.checkIfIn(x, i)
      && !this.column.checkIfIn(y, i)
      && !this.sector.checkIfIn(s, i)) {
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
   */
  setUpBeforeSolveAndSolve = async () => {
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
