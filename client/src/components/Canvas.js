import { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useCanvas } from "../contexts/CanvasProperties";
import { useRoom } from "../contexts/RoomContext";
import { useRounds } from "../contexts/RoundContext";
import {
  getSmallerScreenLength,
  startDrawing,
  finishDrawing,
  draw,
  updateMousePos,
  clearCanvas,
} from "../helpers/canvas_setup";
import styles from "./Canvas.module.scss";
import { MAX_CANVAS_SIZE } from "../styles/_constants";
import variables from "../styles/_variables.scss";

const Canvas = () => {
  const socket = useSocket();
  const { room } = useRoom();
  const {
    color,
    setColor,
    strokeSize,
    setStrokeSize,
    lineStyle,
    setLineStyle,
    mode,
    setMode,
    clear,
    setClear,
  } = useCanvas();
  const { currentRound, isTurn } = useRounds();

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const cursorRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasSize = getSmallerScreenLength();

  const [inCanvas, setInCanvas] = useState(false);
  const [mouseX, setMouseX] = useState(null);
  const [mouseY, setMouseY] = useState(null);

  useEffect(() => {
    // socket.on("left_room", () => {
    //   clearCanvas(ctxRef, canvasRef);
    // });

    socket.on("receive_startDrawing", (drawingData) => {
      startDrawing(
        drawingData.e,
        false,
        ctxRef,
        setIsDrawing,
        socket,
        drawingData.room,
        drawingData.scaleIndex
      );
    });
    socket.on("receive_drawing", (drawingData) => {
      draw(
        drawingData.e,
        false,
        ctxRef,
        socket,
        drawingData.room,
        drawingData.scaleIndex
      );
    });
    socket.on("receive_finishDrawing", (drawingData) => {
      finishDrawing(
        drawingData.e,
        false,
        ctxRef,
        setIsDrawing,
        socket,
        drawingData.room
      );
    });

    socket.on("receive_canvasRef", (canvasData) => {
      if (canvasData.clear) {
        clearCanvas(ctxRef, canvasRef);
      } else {
        const newCtxRef = canvasData.ctxRef;
        if (mode !== canvasData.mode) setMode(canvasData.mode);
        ctxRef.current.strokeStyle = newCtxRef.strokeStyle;
        ctxRef.current.lineWidth = newCtxRef.lineWidth;
        if (newCtxRef.lineDash === "dashed") {
          ctxRef.current.setLineDash([8, 8]);
        } else {
          ctxRef.current.setLineDash([]);
        }
      }
    });
  }, [socket]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const scaleIndex =
      canvasSize < MAX_CANVAS_SIZE ? MAX_CANVAS_SIZE / canvasSize : 1;
    const scaledCanvasSize = canvasSize * scaleIndex;

    ctx.scale(scaleIndex, scaleIndex);
    canvas.width = scaledCanvasSize;
    canvas.height = scaledCanvasSize;

    // canvas.style.width = `${canvasSize}px`;
    // canvas.style.height = `${canvasSize}px`;

    ctx.lineCap = "round";
    ctxRef.current = ctx;
    // ctx.beginPath();
    // // ctx.fillStyle = "#000000";
    // ctx.arc(x, 100, 40, 0, 2 * Math.PI);
    // ctx.fill();
    // x++;
    // ctx.stroke();
    // requestAnimationFrame(render);
    // render();
  }, []);

  useEffect(() => {
    if (mode === "pen") {
      ctxRef.current.strokeStyle = color;
    } else {
      ctxRef.current.strokeStyle = variables.canvasBkgColor;
    }
  }, [color, mode]);

  useEffect(() => {
    ctxRef.current.lineWidth = strokeSize[0] + 2;
  }, [strokeSize]);

  useEffect(() => {
    if (lineStyle === "dashed") {
      ctxRef.current.setLineDash([8, 8]);
    } else {
      ctxRef.current.setLineDash([]);
    }
  }, [lineStyle]);

  useEffect(() => {
    if (clear) {
      const sendCanvasRef = async () => {
        const canvasData = { room, clear };
        await socket.emit("send_canvasRef", canvasData);
      };
      sendCanvasRef().catch((error) => console.error(error));
      clearCanvas(ctxRef, canvasRef);
      setClear(false);
    }
  }, [clear]);

  useEffect(() => {
    const sendCanvasRef = async () => {
      const current = ctxRef.current;
      const canvasData = {
        ctxRef: {
          strokeStyle: current.strokeStyle,
          lineWidth: current.lineWidth,
          lineDash: lineStyle,
        },
        mode,
        room,
      };
      await socket.emit("send_canvasRef", canvasData);
    };
    sendCanvasRef().catch((error) => console.error(error));
  }, [color, mode, strokeSize, lineStyle]);

  useEffect(() => {
    clearCanvas(ctxRef, canvasRef);

    setColor("black");
    setStrokeSize([3, 0.3]);
    setLineStyle("solid");
    setMode("pen");
    setClear(false);
    // setPrevColor(color);
    // setPrevLineStyle(lineStyle);
    // setPrevEraserSize([3, 0.3]);
  }, [currentRound]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={(e) => {
          startDrawing(e, true, ctxRef, setIsDrawing, socket, room);
        }}
        onMouseUp={(e) => {
          finishDrawing(e, true, ctxRef, setIsDrawing, socket, room);
        }}
        onMouseMove={(e) => {
          isDrawing && draw(e, true, ctxRef, socket, room);
          inCanvas && updateMousePos(e, setMouseX, setMouseY);
        }}
        onTouchStart={(e) => {
          startDrawing(e, true, ctxRef, setIsDrawing, socket, room);
        }}
        onTouchEnd={(e) => {
          finishDrawing(e, true, ctxRef, setIsDrawing, socket, room);
        }}
        onTouchMove={(e) => {
          isDrawing && draw(e, true, ctxRef, socket, room);
        }}
        onMouseEnter={(e) => {
          cursorRef.current = e;
          setInCanvas(true);
        }}
        onMouseLeave={(e) => {
          finishDrawing(e, true, ctxRef, setIsDrawing, socket, room);
          setInCanvas(false);
          cursorRef.current = null;
        }}
        style={{
          cursor: !isTurn ? "not-allowed" : "none",
          pointerEvents: !isTurn ? "none" : "auto",
        }}
        // width={canvasSize}
        // height={canvasSize}
      >
        Your browser does not support the HTML canvas tag.
      </canvas>
      {inCanvas && (
        <div
          className={styles["canvas-cursor"]}
          style={{
            top: mouseY + cursorRef.current.target.offsetTop,
            left: mouseX + cursorRef.current.target.offsetLeft,
            height: `${strokeSize[1]}rem`,
            width: `${strokeSize[1]}rem`,
            backgroundColor:
              mode === "eraser" ? variables.canvasBkgColor : color,
            border: mode === "eraser" ? "1px solid #000000" : "none",
          }}
        />
      )}
    </div>
  );
};
export default Canvas;
