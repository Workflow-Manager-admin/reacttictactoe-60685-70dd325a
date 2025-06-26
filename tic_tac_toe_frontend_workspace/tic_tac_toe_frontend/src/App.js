import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * The main Tic Tac Toe App. Provides accessible interactive game board, player turn indicator,
 * win/draw detection, and reset option. Modern minimalistic style and light theme.
 */
function App() {
  // Game state: 'X' = player 1, 'O' = player 2
  const [board, setBoard] = useState(Array(9).fill(''));
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState('');
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const boardRef = useRef([]);

  // Apply light theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  // Check for winner/draw after each move
  useEffect(() => {
    const winLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    let foundWinner = null;
    for (const [a, b, c] of winLines) {
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        foundWinner = board[a];
        break;
      }
    }
    if (foundWinner) {
      setWinner(foundWinner);
      setStatus(`Winner: ${foundWinner === 'X' ? 'Player 1 (X)' : 'Player 2 (O)'}`);
      setIsDraw(false);
    } else if (board.every(cell => cell)) {
      setWinner(null);
      setIsDraw(true);
      setStatus('It’s a draw!');
    } else {
      setWinner(null);
      setIsDraw(false);
      setStatus(`Turn: ${isXNext ? 'Player 1 (X)' : 'Player 2 (O)'}`);
    }
  }, [board, isXNext]);

  /**
   * PUBLIC_INTERFACE
   * Handles click on a board cell.
   */
  function handleCellClick(idx) {
    if (board[idx] || winner || isDraw) return;
    const newBoard = [...board];
    newBoard[idx] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    // Focus next empty cell for accessibility
    setTimeout(() => {
      const emptyIdx = newBoard.findIndex((v, i) => v === '' && i > idx);
      if (emptyIdx > -1 && boardRef.current[emptyIdx]) {
        boardRef.current[emptyIdx].focus();
      }
    }, 50);
  }

  /**
   * PUBLIC_INTERFACE
   * Keyboard controls: Space/Enter for move, arrow keys for board navigation.
   */
  function handleCellKeyDown(e, idx) {
    if (['Enter', ' '].includes(e.key)) {
      e.preventDefault();
      handleCellClick(idx);
    }
    // Arrow navigation: left/right/up/down moves in grid
    const move = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
    if (move[e.key] !== undefined) {
      e.preventDefault();
      let newIdx = idx + move[e.key];
      if (newIdx < 0) newIdx = 0;
      if (newIdx > 8) newIdx = 8;
      if (boardRef.current[newIdx]) boardRef.current[newIdx].focus();
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Resets the game.
   */
  function resetGame() {
    setBoard(Array(9).fill(''));
    setIsXNext(true);
    setWinner(null);
    setIsDraw(false);
    setStatus('Turn: Player 1 (X)');
    // Focus first cell
    setTimeout(() => {
      if (boardRef.current[0]) boardRef.current[0].focus();
    }, 100);
  }

  // Color palette from requirements
  const COLORS = {
    primary: '#1976d2',   // blue (Player 1),
    secondary: '#ff7043', // orange (Player 2),
    accent: '#ffd600'     // accent for win/draw
  };

  // "Modern minimalistic" board styling
  return (
    <div className="App" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <main className="ttt-container" tabIndex={-1} aria-label="Tic Tac Toe game">
        <h1 className="ttt-title">Tic&nbsp;Tac&nbsp;Toe</h1>
        <div
          className="ttt-status"
          aria-live="polite"
          style={{
            margin: '0.8rem 0',
            fontSize: '1.15rem',
            fontWeight: 600,
            color:
              winner ? COLORS.accent : isDraw ? COLORS.secondary : (isXNext ? COLORS.primary : COLORS.secondary)
          }}
        >
          {status}
        </div>
        <section
          className="ttt-board"
          role="grid"
          aria-label="Tic Tac Toe board"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 72px)',
            gridTemplateRows: 'repeat(3, 72px)',
            gap: '8px',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            padding: 16,
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(30,37,47,0.06)'
          }}
        >
          {board.map((cell, i) => (
            <button
              key={i}
              className="ttt-cell"
              ref={el => (boardRef.current[i] = el)}
              aria-label={
                cell
                  ? `Cell ${i + 1}, ${cell === 'X' ? 'Player 1 X' : 'Player 2 O'}`
                  : `Cell ${i + 1}, empty`
              }
              role="gridcell"
              tabIndex={board[i] === '' && !winner && !isDraw ? 0 : -1}
              onClick={() => handleCellClick(i)}
              onKeyDown={e => handleCellKeyDown(e, i)}
              disabled={!!winner || !!cell || isDraw}
              aria-disabled={!!winner || !!cell || isDraw}
              style={{
                outline: 'none',
                border: `2px solid ${cell
                  ? (cell === 'X' ? COLORS.primary : COLORS.secondary)
                  : 'var(--border-color)'}`,
                background: 'var(--bg-primary)',
                borderRadius: 12,
                fontSize: '2.1rem',
                fontWeight: 700,
                color: cell
                  ? (cell === 'X' ? COLORS.primary : COLORS.secondary)
                  : '#bbb',
                cursor: cell || winner || isDraw ? 'not-allowed' : 'pointer',
                height: 72,
                width: 72,
                textAlign: 'center',
                transition: 'background 0.16s, border 0.18s, color 0.18s'
              }}
            >
              {cell}
            </button>
          ))}
        </section>
        <div className="ttt-controls" style={{ marginTop: '1.6rem', display: 'flex', justifyContent: 'center' }}>
          <button
            className="ttt-reset"
            aria-label="Reset the game"
            onClick={resetGame}
            style={{
              background: winner || isDraw ? COLORS.accent : COLORS.primary,
              color: '#fff',
              fontWeight: 600,
              fontSize: 18,
              border: 'none',
              borderRadius: 8,
              padding: '12px 27px',
              boxShadow: '0 2px 6px rgba(20,20,35,0.065)',
              cursor: 'pointer',
              outline: 'none',
              marginRight: 0
            }}
          >
            {winner || isDraw ? 'Play Again' : 'Reset'}
          </button>
        </div>
        <footer className="ttt-footer" style={{ marginTop: '2.5rem', fontSize: 13, color: '#bbc' }}>
          <span>
            <b style={{ color: COLORS.primary }}>X</b> = Player 1 &nbsp;|&nbsp;
            <b style={{ color: COLORS.secondary }}>O</b> = Player 2
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
