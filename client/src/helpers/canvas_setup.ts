import {
  MutableRefObject,
  Dispatch,
  SetStateAction,
  MouseEvent,
  TouchEvent,
} from "react";
import { Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  IDrawingData,
} from "@backend/interfaces";
import { MOBILE_BREAKPOINT, MAX_CANVAS_SIZE } from "../styles/_constants";

interface ICoordsData {
  x: number;
  y: number;
}

const getSmallerScreenLength = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  let smaller: number | null = null;

  if (width > height) {
    smaller = height * 0.8;
  } else {
    if (width >= MOBILE_BREAKPOINT) {
      smaller = width * 0.8;
    } else {
      smaller = width;
    }
  }

  return smaller < MAX_CANVAS_SIZE ? Math.trunc(smaller) : MAX_CANVAS_SIZE;
};

const canvasSize = getSmallerScreenLength();
const scaleIndex =
  canvasSize < MAX_CANVAS_SIZE ? MAX_CANVAS_SIZE / canvasSize : 1;

const isSentDrawingData = (
  e:
    | TouchEvent<HTMLCanvasElement>
    | MouseEvent<HTMLCanvasElement>
    | IDrawingData
): e is IDrawingData => {
  return (
    (e as IDrawingData).room !== undefined &&
    (e as IDrawingData).scaleIndex !== undefined
  );
};

const updateMousePos = (
  e: MouseEvent<HTMLCanvasElement>,
  setMousePosX: Dispatch<SetStateAction<number>>,
  setMousePosY: Dispatch<SetStateAction<number>>
) => {
  const { offsetX, offsetY } = e.nativeEvent;
  setMousePosX(offsetX);
  setMousePosY(offsetY);
};

const startDrawing = (
  e:
    | TouchEvent<HTMLCanvasElement>
    | MouseEvent<HTMLCanvasElement>
    | IDrawingData,
  send: boolean,
  ctxRef: MutableRefObject<CanvasRenderingContext2D | null>,
  setIsDrawing: Dispatch<SetStateAction<boolean>>,
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  id = ""
) => {
  const { x, y } = getClickCoords(e);
  const room = isSentDrawingData(e) ? e.room : id;
  // if (e.defaultPrevented === false) e.preventDefault();
  setIsDrawing(true);
  if (ctxRef.current) {
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  }

  if (send && !isSentDrawingData(e)) sendStartDrawing(e, socket, room);
};

const finishDrawing = (
  e:
    | TouchEvent<HTMLCanvasElement>
    | MouseEvent<HTMLCanvasElement>
    | IDrawingData,
  send: boolean,
  ctxRef: MutableRefObject<CanvasRenderingContext2D | null>,
  setIsDrawing: Dispatch<SetStateAction<boolean>>,
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  id = ""
) => {
  const room = isSentDrawingData(e) ? e.room : id;
  if (!isSentDrawingData(e) && e.defaultPrevented === false) e.preventDefault();
  if (ctxRef.current) ctxRef.current.closePath();
  setIsDrawing(false);

  if (send && !isSentDrawingData(e)) sendFinishDrawing(e, socket, room);
};

const draw = (
  e:
    | TouchEvent<HTMLCanvasElement>
    | MouseEvent<HTMLCanvasElement>
    | IDrawingData,
  send: boolean,
  ctxRef: MutableRefObject<CanvasRenderingContext2D | null>,
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  id = ""
) => {
  const { x, y } = getClickCoords(e);
  const room = isSentDrawingData(e) ? e.room : id;
  // if (e.defaultPrevented === false) e.preventDefault();
  if (ctxRef.current) {
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  }

  if (send && !isSentDrawingData(e)) sendDrawing(e, socket, room);
};

const sendStartDrawing = (
  e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>,
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  id: string
) => {
  const drawingData = getDrawingData(e, id);
  socket.emit("send_startDrawing", drawingData);
};

const sendDrawing = (
  e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>,
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  id: string
) => {
  const drawingData = getDrawingData(e, id);
  socket.emit("send_drawing", drawingData);
};

const sendFinishDrawing = (
  e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>,
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  id: string
) => {
  const drawingData: IDrawingData = {
    target: {
      offsetLeft: 0,
      offsetTop: 0,
    },
    nativeEvent: {},
    room: id,
    scaleIndex: 0,
  };
  socket.emit("send_finishDrawing", drawingData);
};

const getClickCoords = (
  e:
    | TouchEvent<HTMLCanvasElement>
    | MouseEvent<HTMLCanvasElement>
    | IDrawingData
) => {
  let coords: ICoordsData = { x: 0, y: 0 };

  if ("changedTouches" in e.nativeEvent) {
    if (e.nativeEvent.changedTouches) {
      const { pageX, pageY } = e.nativeEvent.changedTouches[0];
      const target = e.target as HTMLCanvasElement;

      coords = {
        x: (pageX - target.offsetLeft) * scaleIndex,
        y: (pageY - target.offsetTop) * scaleIndex,
      };
    }
  } else {
    const { offsetX, offsetY } = e.nativeEvent;
    if (offsetX && offsetY) {
      coords = {
        x: offsetX,
        y: offsetY,
      };
    }
  }
  return coords;
};

const getDrawingData = (
  e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>,
  id: string
): IDrawingData => {
  const target = e.target as HTMLCanvasElement;
  const nativeEvent = e.nativeEvent;
  const data: IDrawingData = {
    target: {
      offsetLeft: target.offsetLeft,
      offsetTop: target.offsetTop,
    },
    nativeEvent:
      "changedTouches" in nativeEvent
        ? {
            changedTouches: [
              {
                pageX: nativeEvent.changedTouches[0].pageX,
                pageY: nativeEvent.changedTouches[0].pageY,
              },
            ],
          }
        : { offsetX: nativeEvent.offsetX, offsetY: nativeEvent.offsetY },
    room: id,
    scaleIndex,
  };

  // const insertEventBlock = () => {
  //   if ("touches" in e) {
  //     data.e["touches"] = [
  //       { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
  //     ];
  //   } else {
  //     const nativeEvent = e.nativeEvent;
  //     data.e["nativeEvent"] = {
  //       offsetX: nativeEvent.offsetX,
  //       offsetY: nativeEvent.offsetY,
  //     };
  //   }
  // };

  return data;
};

const clearCanvas = (
  ctxRef: MutableRefObject<CanvasRenderingContext2D | null>,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>
) => {
  if (ctxRef.current && canvasRef.current) {
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
  }
};

export {
  startDrawing,
  finishDrawing,
  draw,
  getSmallerScreenLength,
  updateMousePos,
  clearCanvas,
};
