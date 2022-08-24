import { useState } from "react";
import { useCanvas } from "../contexts/CanvasProperties";
import ColorPicker from "./CanvasToolbar/ColorPicker";
import StrokeSize from "./CanvasToolbar/StrokeSize";
import LineStyle from "./CanvasToolbar/LineStyle";
import { AiFillDelete } from "react-icons/ai";
import { BsFillEraserFill } from "react-icons/bs";
import { ImPencil2 } from "react-icons/im";
import styles from "./CanvasToolbar.module.scss";

const CanvasToolbar = () => {
  const { toggleMode, setClear, mode } = useCanvas();
  // const [popoverOpened, setPopoverOpened] = useState(false);

  return (
    <ul className={styles["canvas-toolbar"]}>
      <li>
        <ColorPicker />
      </li>
      <li>
        <StrokeSize />
      </li>
      <li>
        <LineStyle />
      </li>
      <li
        className={styles.icon}
        onClick={() => toggleMode("pen")}
        style={{ backgroundColor: mode === "pen" ? "lightblue" : "whitesmoke" }}
      >
        <ImPencil2 />
      </li>
      <li
        className={styles.icon}
        onClick={() => toggleMode("eraser")}
        style={{
          backgroundColor: mode === "eraser" ? "lightblue" : "whitesmoke",
        }}
      >
        <BsFillEraserFill />
      </li>
      <li className={styles.icon} onClick={() => setClear(true)}>
        <AiFillDelete color="#C2181A" size="1.5rem" />
      </li>
    </ul>
  );
};
export default CanvasToolbar;
