import { createContext, useContext, useState, useEffect } from "react";

const CanvasContext = createContext();

const useCanvas = () => useContext(CanvasContext);

const CanvasProvider = ({ children }) => {
  const [color, setColor] = useState("black");
  const [strokeSize, setStrokeSize] = useState([3, 0.3]);
  const [lineStyle, setLineStyle] = useState("solid");
  const [mode, setMode] = useState("pen");
  const [clear, setClear] = useState(false);

  const [prevColor, setPrevColor] = useState(color);
  const [prevStrokeSize, setPrevStrokeSize] = useState(strokeSize);
  const [prevLineStyle, setPrevLineStyle] = useState(lineStyle);
  const [prevEraserSize, setPrevEraserSize] = useState([3, 0.3]);

  useEffect(() => {
    if (mode === "pen") {
      setPrevColor(color);
    }
  }, [color]);

  useEffect(() => {
    if (mode === "pen") {
      setPrevStrokeSize(strokeSize);
    } else {
      setPrevEraserSize(strokeSize);
    }
  }, [strokeSize]);

  useEffect(() => {
    if (mode === "pen") {
      setPrevLineStyle(lineStyle);
    }
  }, [lineStyle]);

  useEffect(() => {
    if (mode === "pen") {
      setColor(prevColor);
      setStrokeSize(prevStrokeSize);
      setLineStyle(prevLineStyle);
    } else {
      setColor("black");
      setStrokeSize(prevEraserSize);
      setLineStyle("solid");
    }
  }, [mode]);

  const toggleMode = (selectedMode) => {
    if (selectedMode !== mode) {
      setMode(selectedMode);
    }
  };

  const value = {
    color,
    setColor,
    strokeSize,
    setStrokeSize,
    lineStyle,
    setLineStyle,
    mode,
    setMode,
    toggleMode,
    clear,
    setClear,
  };

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
};

export { CanvasProvider, useCanvas };
