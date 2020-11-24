import './style/util.css';
import './style/style.css';
import Board from './components/board';

const board = new Board();
document.querySelector('#main').appendChild(board.render());
document.querySelector('#solve').addEventListener('click', board.setUpBeforeSolveAndSolve);
document.querySelector('#speed').addEventListener('input', board.handleSpeedInput);
document.querySelector('#addArrayButton').addEventListener('click',
  () => board.handleInputFromArray(document.querySelector('#arrayInput').value));
