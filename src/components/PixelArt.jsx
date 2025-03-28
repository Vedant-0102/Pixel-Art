import React, { useState, useEffect, useRef } from 'react';
import '../assets/styles.css';

const PixelArt = () => {
  const [width, setWidth] = useState(16);
  const [height, setHeight] = useState(16);
  const [color, setColor] = useState('#43a047');
  const [eraseMode, setEraseMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [grid, setGrid] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    createGrid();
  }, []);

  const createGrid = () => {
    const newGrid = [];
    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
        row.push('#ffffff');
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  };

  const clearGrid = () => {
    setGrid(prev => prev.map(row => row.map(() => '#ffffff')));
  };

  const handleCellClick = (row, col) => {
    const newGrid = [...grid];
    newGrid[row][col] = eraseMode ? '#ffffff' : color;
    setGrid(newGrid);
  };

  const handleMouseEnter = (row, col) => {
    if (isDrawing) {
      handleCellClick(row, col);
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
              <label htmlFor="width-range">Grid Width: {width.toString().padStart(2, '0')}</label>
              <input
                type="range"
                id="width-range"
                min="1"
                max="35"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
              />
            </div>
            <div className="slider">
              <label htmlFor="height-range">Grid Height: {height.toString().padStart(2, '0')}</label>
              <input
                type="range"
                id="height-range"
                min="1"
                max="35"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
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
            <button className="btn download-btn" onClick={downloadImage}>
              Save Image
            </button>
          </div>
        </div>

        <div
          className="container"
          ref={containerRef}
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
        >
          {grid.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="gridRow">
              {row.map((cell, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="gridCol"
                  style={{ backgroundColor: cell }}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (element && element.classList.contains('gridCol')) {
                      handleCellClick(rowIndex, colIndex);
                    }
                  }}
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
