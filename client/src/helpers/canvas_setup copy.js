import { MOBILE_BREAKPOINT, MAX_CANVAS_SIZE } from "../styles/_constants";

const getSmallerScreenLength = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  let smaller = null;

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

const updateMousePos = (e, setMousePosX, setMousePosY) => {
  const { offsetX, offsetY } = e.nativeEvent;
  setMousePosX(offsetX);
  setMousePosY(offsetY);
};

const startDrawing = (
  e,
  send,
  ctxRef,
  setIsDrawing,
  socket,
  id,
  sendScaleIndex = 1
) => {
  const { x, y } = getClickCoords(e);
  console.log(x, y);
  console.log("scale", sendScaleIndex);

  ctxRef.current.beginPath();
  // ctxRef.current.moveTo(x * sendScaleIndex, y * sendScaleIndex);
  ctxRef.current.moveTo(x, y);
  ctxRef.current.stroke();
  setIsDrawing(true);

  if (send) sendStartDrawing(e, socket, id);
};

const finishDrawing = (e, send, ctxRef, setIsDrawing, socket, id) => {
  if (e.defaultPrevented === false) e.preventDefault();
  ctxRef.current.closePath();
  setIsDrawing(false);

  if (send) sendFinishDrawing(e, socket, id);
};

const draw = (e, send, ctxRef, socket, id, sendScaleIndex = 1) => {
  const { x, y } = getClickCoords(e);
  // ctxRef.current.moveTo(x * sendScaleIndex, y * sendScaleIndex);
  ctxRef.current.moveTo(x, y);
  ctxRef.current.stroke();

  // console.log(x, y);

  if (send) sendDrawing(e, socket, id);
};

const sendStartDrawing = async (e, socket, id) => {
  const drawingData = getDrawingData(e, id);
  await socket.emit("send_startDrawing", drawingData);
};

const sendDrawing = async (e, socket, id) => {
  const drawingData = getDrawingData(e, id);
  await socket.emit("send_drawing", drawingData);
};

const sendFinishDrawing = async (e, socket, id) => {
  const drawingData = {
    e: {
      type: e.type,
    },
    room: id,
  };
  await socket.emit("send_finishDrawing", drawingData);
};

const getClickCoords = (e) => {
  let coords = { x: 0, y: 0 };

  if (e.type === "touchstart" || e.type === "touchmove") {
    const { pageX, pageY } = e.nativeEvent.changedTouches[0];
    coords = {
      // x: (pageX - e.target.offsetLeft) * scaleIndex,
      // y: (pageY - e.target.offsetTop) * scaleIndex,
      x: pageX - e.target.offsetLeft,
      y: pageY - e.target.offsetTop,
    };
  } else {
    const { offsetX, offsetY } = e.nativeEvent;

    coords = {
      x: offsetX,
      y: offsetY,
    };
  }
  return coords;
};

const getDrawingData = (e, id) => {
  const nativeEvent = e.nativeEvent;
  const canvasSize = getSmallerScreenLength();
  const scaleIndex =
    canvasSize < MAX_CANVAS_SIZE ? MAX_CANVAS_SIZE / canvasSize : 1;

  return {
    e: {
      type: e.type,

      target: {
        offsetLeft: e.target.offsetLeft,
        offsetTop: e.target.offsetTop,
      },
      nativeEvent: nativeEvent.changedTouches
        ? {
            changedTouches: [
              {
                pageX: nativeEvent.changedTouches[0].pageX,
                pageY: nativeEvent.changedTouches[0].pageY,
              },
            ],
          }
        : { offsetX: nativeEvent.offsetX, offsetY: nativeEvent.offsetY },
    },
    room: id,
    scaleIndex,
  };
};

export {
  startDrawing,
  finishDrawing,
  draw,
  getSmallerScreenLength,
  updateMousePos,
};
