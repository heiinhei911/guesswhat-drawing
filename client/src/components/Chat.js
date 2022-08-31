import { useEffect, useRef, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useRounds } from "../contexts/RoundContext";
import { useRoom } from "../contexts/RoomContext";
import { useName } from "../contexts/NameContext";
import { makeDoubleDigits } from "../helpers/miscellaneous";
import { BsPersonCircle } from "react-icons/bs";
import styles from "./Chat.module.scss";
import { v4 as uuid } from "uuid";

const timeStamp = () => {
  const date = new Date(Date.now());
  const hours = date.getHours();
  const mins = makeDoubleDigits(date.getMinutes());
  const sec = makeDoubleDigits(date.getSeconds());

  return `${
    hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  }:${mins}:${sec} ${hours < 12 ? "AM" : "PM"}`;
};

const Chat = ({ type, check = false }) => {
  const socket = useSocket();
  const { room } = useRoom();
  const { user } = useName();
  const { currentRound, word, isTurn } = useRounds();
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const chatRef = useRef(null);

  useEffect(() => {
    socket.on(
      type === "guesses" ? "receive_guess" : "receive_chat",
      (messageData) => {
        setMessageList((prevMessageList) => [...prevMessageList, messageData]);
      }
    );
  }, [socket]);

  useEffect(() => {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messageList]);

  const checkMessage = () => {
    if (message.toLowerCase() === word.word.toLowerCase()) {
      const matchedWordData = {
        room,
        user,
        type: "guessed",
      };
      socket.emit("matched_word", matchedWordData);
    }
  };

  useEffect(() => {
    if (!check) {
      setMessageList([]);
    }
  }, [currentRound]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message !== "") {
      const messageData = {
        room,
        author: user,
        message,
        time: timeStamp(),
        type,
      };

      await socket.emit(
        type === "guesses" ? "send_guess" : "send_chat",
        messageData
      );
      setMessageList((prevMessageList) => [...prevMessageList, messageData]);
      if (check) checkMessage();
      setMessage("");
    }
  };

  const messageDisplay = messageList.map((message) => (
    <div
      className={styles[`message${message.author === user ? "-self" : ""}`]}
      key={uuid()}
    >
      <span className={styles["message-author"]}>
        {message.author === user ? "You" : message.author}
      </span>
      <span
        className={
          styles[`message-avatar-msg${message.author === user ? "-self" : ""}`]
        }
      >
        <span
          className={styles["message-avatar"]}
          // style={{ order: message.author === user ? 2 : 1 }}
        >
          <BsPersonCircle size="1.5rem" />
        </span>
        <p
          className={
            styles[`message-msg${message.author === user ? "-self" : ""}`]
          }
        >
          {message.message}
        </p>
      </span>
      <span className={styles["message-timestamp"]}>{message.time}</span>
    </div>
  ));

  return (
    <div className={styles.chat}>
      <span>{type === "guesses" ? "Guesses" : "Chat Room"}</span>
      <div className={styles.messages} ref={chatRef}>
        {messageDisplay}
      </div>
      <form className={styles["chat-input"]} onSubmit={(e) => sendMessage(e)}>
        <input
          type="text"
          placeholder="Type in your message..."
          value={message}
          disabled={check && isTurn}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={check && isTurn}
        >
          Send
        </button>
      </form>
    </div>
  );
};
export default Chat;
