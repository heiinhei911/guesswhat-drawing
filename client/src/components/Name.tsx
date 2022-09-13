import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { useName } from "../contexts/NameContext";
import styles from "./Name.module.scss";

const Name: FC<{
  isEmpty?: (field: string) => boolean | void;
  homeUserError?: boolean;
  setHomeUserError?: Dispatch<SetStateAction<boolean>>;
  btn?: boolean;
}> = ({ isEmpty, homeUserError, setHomeUserError, btn = false }) => {
  const { user, setUser } = useName();
  const [name, setName] = useState("");
  const [userError, setUserError] = useState(false);
  const fromHome = typeof homeUserError === "boolean";

  useEffect(() => {
    if (fromHome && isEmpty) {
      isEmpty(user);
      window.localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  const onSubmitName = () => {
    if (name.length === 0) {
      return setUserError(true);
    }
    setUser(name);
    window.localStorage.setItem("user", JSON.stringify(user));
  };

  return (
    <div className={styles.container}>
      <label className={styles.name}>
        Enter your name:
        <input
          type="text"
          className={styles.input}
          required
          value={fromHome ? user : name}
          placeholder="Your name..."
          onChange={(e) => {
            if (userError) setUserError(false);
            if (homeUserError && setHomeUserError) setHomeUserError(false);
            if (fromHome) {
              setUser(e.target.value);
            } else {
              setName(e.target.value);
            }
          }}
        />
      </label>
      {(userError || homeUserError) && (
        <p className={styles.error}>Name can't be empty</p>
      )}
      {btn && (
        <button className={styles.button} onClick={onSubmitName}>
          Join
        </button>
      )}
    </div>
  );
};
export default Name;
