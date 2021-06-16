import './board.css';
import Memo2D from '../lib/memo2D';
import { getSector } from '../utils/utils';

/**
 * This component represents the board
 */
export default class Board {
  /**
   * When going through the board,
   * this stores the value of the previously edited cell in DOM
   */
  prev = null

  /**
   * The sudoku board along with the DOM elements
   */
  board = new Array(9)

  /**
   * Speed of the step
   */
  speed = 1000

  /**
   * Stores the row memo
   */
  row = null

  /**
   * Stores the column memo
   */
  column = null

  /**
   * Stores the sector memo
   */
  sector = null

  /**
   * Weather the board has been solved or not
   */
  solved = false

  /**
   * Clear all the cell classes
   */
  clearAllCellClasses = () => {
    this.board.forEach((row) => row.forEach(({ $el }) => {
      $el.className = '';
    }));
  }

  /**
   * Sets up the initial memo
   */
  setUpMemo = () => {
    this.board.forEach((boardRow, i) => boardRow.forEach((cell, j) => {
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
   * Get the first unsolved cell after the current row and column
   * @param {number} row - Current row
   * @param {number} column - Current column
   */
  getFirstUnsolved = (row, column) => {
    for (let i = row; i < 9; i += 1) {
      for (let j = i === row ? column : 0; j < 9; j += 1) {
        const { value } = this.board[i][j];
        if (value === '') {
          return [i, j];
        }
      }
    }
    return [false, false];
  }

  /**
   * Update classList for visualization
   * @param {HTMLTableDataCellElement} currentCell
   * @param {HTMLTableDataCellElement} prevCell
   * @param {'solved' | 'fault'} solvedOrFault
   */
  updateClassList = (currentCell, prevCell, solvedOrFault) => {
    if (prevCell) {
      prevCell.className = solvedOrFault;
      if (solvedOrFault === 'fault') {
        setTimeout(() => {
          prevCell.classList.remove(solvedOrFault);
        }, this.speed / 2);
      }
    }
    currentCell.className = 'current';
  }

  /**
   * Set the board value in array and in DOM
   * @param {number} row - Row where the value needs to be set
   * @param {number} column - Column where the value needs to be set
   * @param {number} value - Value that needs to be set
   * @param {'solved' | 'fault' | null} solvedOrFault - For visualization
   * Will be null when no visialization is required.
   */
  setCellValue = (row, column, value, solvedOrFault = null) => {
    // Step 1: Get the cell
    const cell = this.board[row][column];

    // Step 2: Set the value
    cell.value = value;
    if (+cell.$el.innerText !== value) {
      cell.$el.innerText = value;
    }

    // Step 3: Visualization steps if required
    if (solvedOrFault) {
      this.updateClassList(cell.$el, this.prev, solvedOrFault);
      this.prev = cell.$el;
    }
  }

  /**
   * Try one of the numbers
   * @param {number} row
   * @param {number} column
   * @param {number} sector
   * @param {number} num
   */
  tryOne = (row, column, sector, num) => new Promise((resolve) => {
    // Set Data
    this.row.setVal(row, num, true);
    this.column.setVal(column, num, true);
    this.sector.setVal(sector, num, true);
    this.setCellValue(row, column, num, 'solved');

    // For visualizing it
    setTimeout(() => {
      this.solveBoard(row, column).then((res) => {
        if (!res) {
          // Unset Data
          this.row.setVal(row, num, false);
          this.column.setVal(column, num, false);
          this.sector.setVal(sector, num, false);
          this.setCellValue(row, column, '', 'fault');
        }
        resolve(res);
      });
    }, this.speed);
  })

  /**
   * Solves the board
   * @param {number} row
   * @param {number} column
   */
  solveBoard = async (row = 0, column = 0) => {
    // Step 1: Base case
    const [x, y] = this.getFirstUnsolved(row, column);
    if (x === false) {
      this.solved = true;
      return true;
    }

    // Step 2: Solve
    const s = getSector(x, y);
    let solved = false;
    for (let i = 1; i <= 9; i += 1) {
      if (!this.row.checkIfIn(x, i)
      && !this.column.checkIfIn(y, i)
      && !this.sector.checkIfIn(s, i)) {
        solved = await this.tryOne(x, y, s, i);
      }

      if (solved) {
        break;
      }
    }

    // Step 3: Return result
    return solved;
  }

  cleanUp = () => {
    this.solved = false;
    this.prev = null;
    this.clearAllCellClasses();
  }

  /**
   * Setup and solve board
   * @param {MouseEvent} @param0
   */
  setUpBeforeSolveAndSolve = async ({ target }) => {
    // Clean up board in case we are solving again
    this.cleanUp();

    // Set memo and solve board
    if (this.createNewMemo()) {
      target.setAttribute('disabled', true);
      await this.solveBoard();
      target.removeAttribute('disabled');

      // Check if board was successfully solved
      if (!this.solved) {
        alert('Board not solvable');
      } else {
        alert('Solved');
      }
    }
  }

  /**
   * Set board from array
   * @param {string} value
   */
  handleInputFromArray = (value) => {
    try {
      const array = JSON.parse(value);
      array.forEach((row, i) => row.forEach(
        (cell, j) => this.setCellValue(i, j, cell === '.' ? '' : +cell),
      ));
    } catch (_err) {
      alert('Incorrect array');
    }
  }

  /**
   * Set the speed
   * @param {InputEvent} event
   */
  handleSpeedInput = ({ target: { value } }) => {
    // Step 1: Set the value
    this.speed = +value;
  }

  /**
   * Handle input in any of the editable tds
   * @param {InputEvent} event
   */
  handleInput = (event) => {
    // Step 1: Destructuring
    const { target: element } = event;
    const { innerText: value, id } = element;
    const [x, y] = id.split('-');

    // Step 2: Validation
    if (value.length !== 0 && !/^[0-9]$/.test(value)) {
      this.setCellValue(x, y, '');
      return;
    }

    // Step 3: Setting values
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
