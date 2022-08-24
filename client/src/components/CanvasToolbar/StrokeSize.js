import { useCanvas } from "../../contexts/CanvasProperties";
import { useEffect, useState } from "react";
import styles from "./StrokeSize.module.scss";

const StrokeSize = () => {
  const { color, strokeSize, setStrokeSize } = useCanvas();

  const handleStrokeSizeChange = (e) => {
    const value = parseInt(e.target.value);
    setStrokeSize([value, `0.${value}`]);
  };

  return (
    <span className={styles["toolbar-stroke-size"]}>
      <span className={styles["stroke-size-display-container"]}>
        <span
          className={styles["stroke-size-display"]}
          style={{
            width: `${strokeSize[1]}rem`,
            height: `${strokeSize[1]}rem`,
            background: color,
          }}
        />
      </span>
      <input
        className={styles["stroke-size-slider"]}
        type="range"
        min="1"
        max="8"
        value={strokeSize[0]}
        step="1"
        onChange={(e) => handleStrokeSizeChange(e)}
      />
    </span>
  );
};
export default StrokeSize;
