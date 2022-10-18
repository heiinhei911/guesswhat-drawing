import { FC, useState } from "react";
import { useCanvas } from "../../contexts/CanvasProperties";
import styles from "./LineStyle.module.scss";
import { MdArrowDropDown } from "react-icons/md";
import { v4 as uuid } from "uuid";

const Line: FC<{ style: string; color?: string }> = ({ style, color }) => {
  return (
    <hr
      className={styles.display}
      style={{
        borderStyle: style ? style : "solid",
        color: color ? color : "#000000",
      }}
    />
  );
};

const LineStyle = () => {
  const { color, lineStyle, setLineStyle } = useCanvas();
  const [lineMenu, setLineMenu] = useState<boolean>(false);

  const toggleLineMenu = () => {
    setLineMenu((prevLineMenu) => !prevLineMenu);
  };

  const updateLineStyle = (style: string) => {
    setLineStyle(style);
    toggleLineMenu();
  };

  return (
    <span className={styles.container} data-testid="line-style">
      <span className={styles["line-style"]}>
        <Line style={lineStyle} color={color} />
        <span className={styles["style-arrow"]} onClick={toggleLineMenu}>
          <MdArrowDropDown
            style={{ transform: `rotate(${lineMenu ? "180deg" : "0deg"})` }}
          />
        </span>
      </span>
      {lineMenu && (
        <div className={styles["menu"]}>
          <ul className={styles["menu-list"]}>
            {["solid", "dashed", "double"].map((style) => (
              <li key={uuid()} onClick={() => updateLineStyle(style)}>
                <Line style={style} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </span>
  );
};
export default LineStyle;
