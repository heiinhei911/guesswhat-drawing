import {
  createContext,
  useContext,
  useState,
  useEffect,
  FC,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

type StrokeSizeType = [number, number];

interface ICanvasContext {
  color: string;
  setColor: (color: string) => void | Dispatch<SetStateAction<string>>;
  strokeSize: StrokeSizeType;
  setStrokeSize: (
    strokeSize: StrokeSizeType
  ) => void | Dispatch<SetStateAction<StrokeSizeType>>;
  lineStyle: string;
  setLineStyle: (linkStyle: string) => void | Dispatch<SetStateAction<string>>;
  mode: string;
  setMode: (mode: string) => void | Dispatch<SetStateAction<string>>;
  toggleMode: (selectedMode: string) => void;
  clear: boolean;
  setClear: (clear: boolean) => void | Dispatch<SetStateAction<boolean>>;
}

const CanvasContext = createContext<ICanvasContext>({
  color: "black",
  setColor: (color: string) => {},
  strokeSize: [3, 0.3],
  setStrokeSize: (strokeSize: StrokeSizeType) => {},
  lineStyle: "solid",
  setLineStyle: (linkStyle: string) => {},
  mode: "pen",
  setMode: (mode: string) => {},
  toggleMode: (mode: string) => {},
  clear: false,
  setClear: (clear: boolean) => {},
});

const useCanvas = () => useContext(CanvasContext);

const CanvasProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [color, setColor] = useState<string>("black");
  const [strokeSize, setStrokeSize] = useState<StrokeSizeType>([3, 0.3]);
  const [lineStyle, setLineStyle] = useState<string>("solid");
  const [mode, setMode] = useState<string>("pen");
  const [clear, setClear] = useState<boolean>(false);

  const [prevColor, setPrevColor] = useState<string>(color);
  const [prevStrokeSize, setPrevStrokeSize] =
    useState<StrokeSizeType>(strokeSize);
  const [prevLineStyle, setPrevLineStyle] = useState<string>(lineStyle);
  const [prevEraserSize, setPrevEraserSize] = useState<StrokeSizeType>([
    3, 0.3,
  ]);

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

  const toggleMode = (selectedMode: string) => {
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
