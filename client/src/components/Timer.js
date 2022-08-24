import { useEffect, useState } from "react";
import { useRounds } from "../contexts/RoundContext";
import { makeDoubleDigits } from "../helpers/miscellaneous";
import styles from "./Timer.module.scss";

const Timer = () => {
  const { roundDuration, roundEnd, setRoundEnd } = useRounds();
  const [minutes, setMinutes] = useState(roundDuration);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (roundEnd) {
      setMinutes(roundDuration);
      setSeconds(0);
    }
  }, [roundEnd]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSecond) => prevSecond - 1);
    }, 1000);

    if (seconds === -1 && minutes > 0) {
      setMinutes((prevMinute) => prevMinute - 1);
      setSeconds(59);
    } else if ((seconds === 0 && minutes === 0) || roundEnd) {
      clearInterval(timer);
      if (!roundEnd) {
        setRoundEnd({ type: "timeout" });
      }
      console.log(roundEnd);
    }

    return () => clearInterval(timer);
  }, [minutes, seconds, roundEnd]);

  return (
    <div className={styles.timer}>
      Time Remaining: {makeDoubleDigits(minutes)}:{makeDoubleDigits(seconds)}
    </div>
  );
};
export default Timer;
