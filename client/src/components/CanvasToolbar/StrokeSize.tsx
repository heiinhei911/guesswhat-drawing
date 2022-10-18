import { ChangeEvent } from "react";
import { useCanvas } from "../../contexts/CanvasProperties";
import styles from "./StrokeSize.module.scss";

const StrokeSize = () => {
  const { color, strokeSize, setStrokeSize } = useCanvas();

  const handleStrokeSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setStrokeSize([value, parseInt(`0.${value}`)]);
  };

  return (
    <span className={styles["stroke-size"]} data-testid="stroke-size">
      <span className={styles["display-container"]}>
        <span
          className={styles.display}
          style={{
            width: `${strokeSize[1]}rem`,
            height: `${strokeSize[1]}rem`,
            background: color,
          }}
        />
      </span>
      <input
        className={styles.slider}
        type="range"
        min="1"
        max="8"
        value={strokeSize[0]}
        step="1"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleStrokeSizeChange(e)
        }
      />
    </span>
  );
};
export default StrokeSize;
