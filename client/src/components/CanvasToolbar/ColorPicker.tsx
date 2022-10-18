import { FC, useState } from "react";
import { useCanvas } from "../../contexts/CanvasProperties";
import styles from "./ColorPicker.module.scss";
import { nanoid } from "nanoid";

const Color: FC<{ color: string }> = ({ color }) => {
  return (
    <span
      className={styles.tile}
      style={{ backgroundColor: color }}
      data-testid="color-picker"
    />
  );
};

const ColorPicker = () => {
  const { color, setColor } = useCanvas();
  const [colorMenu, setColorMenu] = useState<boolean>(false);

  const toggleColorMenu = () => {
    setColorMenu((prevColorMenu) => !prevColorMenu);
  };

  const changeColor = (color: string) => {
    setColor(color);
    // toggleColorMenu();
  };

  return (
    <span className={styles.picker} onClick={toggleColorMenu}>
      <Color color={color} />
      {colorMenu && (
        <div className={styles.menu}>
          <ul className={styles["menu-list"]}>
            {[
              "#000000", // Black
              "#008000", // Green
              "#ff0000", // Red
              "#ffa500", // Orange
              "#ffff00", // Yellow
              "#0000ff", // Blue
            ].map((color) => (
              <li key={nanoid()} onClick={() => changeColor(color)}>
                <Color color={color} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </span>
  );
};
export default ColorPicker;
