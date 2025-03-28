import React, { useState, useEffect, useRef } from 'react';
import '../assets/styles.css';

const PixelArt = () => {
  const [width, setWidth] = useState(16);
  const [height, setHeight] = useState(16);
  const [pendingWidth, setPendingWidth] = useState(16);
  const [pendingHeight, setPendingHeight] = useState(16);
  const [color, setColor] = useState('#43a047');
  const [eraseMode, setEraseMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [grid, setGrid] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const containerRef = useRef(null);
  const strokeStartRef = useRef(null);
  const lastCellRef = useRef(null); // To track last cell to prevent duplicate strokes

  // Initialize grid
  useEffect(() => {
    createGrid();
  }, []);

  const createGrid = () => {
    const newGrid = Array(pendingHeight).fill().map(() => Array(pendingWidth).fill('#ffffff'));
    setGrid(newGrid);
    setWidth(pendingWidth);
    setHeight(pendingHeight);
    setHistory([{ grid: JSON.parse(JSON.stringify(newGrid)), changes: [] }]);
    setHistoryIndex(0);
  };

  const clearGrid = () => {
    const newGrid = Array(height).fill().map(() => Array(width).fill('#ffffff'));
    setGrid(newGrid);
    setHistory([{ grid: JSON.parse(JSON.stringify(newGrid)), changes: [] }]);
    setHistoryIndex(0);
  };

  const handleCellClick = (row, col, isDrag = false) => {
    // Skip if this is the same cell as last time during a drag
    if (isDrag && lastCellRef.current && lastCellRef.current.row === row && lastCellRef.current.col === col) {
      return;
    }

    const newGrid = [...grid];
    const previousColor = newGrid[row][col];
    newGrid[row][col] = eraseMode ? '#ffffff' : color;
    setGrid(newGrid);

    if (!isDrawing) {
      strokeStartRef.current = { row, col };
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ 
        grid: JSON.parse(JSON.stringify(newGrid)),
        changes: [[row, col, previousColor]] 
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else {
      setHistory(prev => {
        const newHistory = [...prev];
        if (newHistory.length > 0) {
          const current = newHistory[historyIndex];
          current.changes.push([row, col, previousColor]);
          current.grid = JSON.parse(JSON.stringify(newGrid));
        }
        return newHistory;
      });
    }

    // Update last cell reference
    lastCellRef.current = { row, col };
  };

  const handleMouseDown = (row, col) => {
    setIsDrawing(true);
    lastCellRef.current = { row, col }; // Initialize last cell
    handleCellClick(row, col);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    strokeStartRef.current = null;
    lastCellRef.current = null; // Reset last cell
  };

  const handleMouseEnter = (row, col) => {
    if (isDrawing) {
      handleCellClick(row, col, true);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setGrid(JSON.parse(JSON.stringify(prevState.grid)));
      setHistoryIndex(historyIndex - 1);
    } else {
      const blankGrid = Array(height).fill().map(() => Array(width).fill('#ffffff'));
      setGrid(blankGrid);
      setHistory([{ grid: JSON.parse(JSON.stringify(blankGrid)), changes: [] }]);
      setHistoryIndex(0);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setGrid(JSON.parse(JSON.stringify(nextState.grid)));
      setHistoryIndex(historyIndex + 1);
    }
  };

  const downloadImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const cellSize = 20;
    
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    
    grid.forEach((row, rowIndex) => {
      row.forEach((cellColor, colIndex) => {
        ctx.fillStyle = cellColor;
        ctx.fillRect(colIndex * cellSize, rowIndex * cellSize, cellSize, cellSize);
      });
    });

    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="app-container">
      <div className="wrapper">
        <h1 className="title">Pixel Art Generator</h1>
        <p className="subtitle">Create your masterpiece!</p>
        
        <div className="options">
          <div className="opt-wrapper">
            <div className="slider">
              <label htmlFor="width-range">Grid Width: {pendingWidth.toString().padStart(2, '0')}</label>
              <input
                type="range"
                id="width-range"
                min="1"
                max="35"
                value={pendingWidth}
                onChange={(e) => setPendingWidth(parseInt(e.target.value))}
              />
            </div>
            <div className="slider">
              <label htmlFor="height-range">Grid Height: {pendingHeight.toString().padStart(2, '0')}</label>
              <input
                type="range"
                id="height-range"
                min="1"
                max="35"
                value={pendingHeight}
                onChange={(e) => setPendingHeight(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="opt-wrapper">
            <button id="submit-grid" className="btn" onClick={createGrid}>Create Grid</button>
            <button id="clear-grid" className="btn" onClick={clearGrid}>Clear Grid</button>
            <input
              type="color"
              id="color-input"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <button
              id="erase-btn"
              className={`btn ${eraseMode ? 'active' : ''}`}
              onClick={() => setEraseMode(true)}
            >
              Erase
            </button>
            <button
              id="paint-btn"
              className={`btn ${!eraseMode ? 'active' : ''}`}
              onClick={() => setEraseMode(false)}
            >
              Paint
            </button>
            <button 
              className="btn undo-btn" 
              onClick={undo}
              disabled={history.length <= 1 && historyIndex === 0}
            >
              Undo
            </button>
            <button 
              className="btn redo-btn" 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              Redo
            </button>
            <button className="btn download-btn" onClick={downloadImage}>
              Save Image
            </button>
          </div>
        </div>

        <div
          className="container"
          ref={containerRef}
          onMouseLeave={handleMouseUp}
          style={{
            maxHeight: '525px',
            maxWidth: '525px',
            overflow: 'hidden'
          }}
        >
          {grid.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="gridRow">
              {row.map((cell, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="gridCol"
                  style={{ backgroundColor: cell }}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseUp={handleMouseUp}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleMouseDown(rowIndex, colIndex);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleMouseUp();
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (element && element.classList.contains('gridCol')) {
                      const rect = element.getBoundingClientRect();
                      const relativeX = touch.clientX - rect.left;
                      const relativeY = touch.clientY - rect.top;
                      if (relativeX >= 0 && relativeY >= 0 && relativeX <= rect.width && relativeY <= rect.height) {
                        const row = parseInt(element.getAttribute('data-row'));
                        const col = parseInt(element.getAttribute('data-col'));
                        handleMouseEnter(row, col);
                      }
                    }
                  }}
                  data-row={rowIndex}
                  data-col={colIndex}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="footer">
        <p>Click the "Save Image" button to download your artwork!</p>
        <div className="color-palette">
          {['#43a047', '#e53935', '#1e88e5', '#fdd835', '#000000', '#ffffff'].map((c) => (
            <div
              key={c}
              className="palette-color"
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PixelArt;