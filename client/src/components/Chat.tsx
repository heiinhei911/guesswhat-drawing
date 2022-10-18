import { FC, useEffect, useRef, useState, FormEvent } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useRounds } from "../contexts/RoundContext";
import { useRoom } from "../contexts/RoomContext";
import { useName } from "../contexts/NameContext";
import { makeDoubleDigits } from "../helpers/miscellaneous";
import { BsPersonCircle } from "react-icons/bs";
import styles from "./Chat.module.scss";
import { v4 as uuid } from "uuid";
import { IMessageData } from "@backend/interfaces";
import { ChatTypes } from "../enums";

const timeStamp = () => {
  const date = new Date(Date.now());
  const hours = date.getHours();
  const mins = makeDoubleDigits(date.getMinutes());
  const sec = makeDoubleDigits(date.getSeconds());

  return `${
    hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  }:${mins}:${sec} ${hours < 12 ? "AM" : "PM"}`;
};

const Chat: FC<{ type: ChatTypes; check?: boolean }> = ({
  type,
  check = false,
}) => {
  const socket = useSocket();
  const { room } = useRoom();
  const { user } = useName();
  const { currentRound, word, isTurn, turn } = useRounds();
  const [message, setMessage] = useState<string>("");
  const [messageList, setMessageList] = useState<IMessageData[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on(
      type === ChatTypes.guesses ? "receive_guess" : "receive_chat",
      (messageData) => {
        setMessageList((prevMessageList) => [...prevMessageList, messageData]);
      }
    );
  }, [socket]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messageList]);

  const checkMessage = () => {
    if (
      word.word &&
      message.toLowerCase() === word.word.toLowerCase() &&
      turn.id
    ) {
      const matchedWordData = {
        room,
        user,
        turn: turn.id,
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

  const sendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message !== "") {
      const messageData = {
        room,
        author: user,
        message,
        time: timeStamp(),
        type,
      };

      socket.emit(
        type === ChatTypes.guesses ? "send_guess" : "send_chat",
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
      <span>{type === ChatTypes.guesses ? "Guesses" : "Chat Room"}</span>
      <div className={styles.messages} ref={chatRef}>
        {messageDisplay}
      </div>
      <form className={styles["chat-input"]} onSubmit={(e) => sendMessage(e)}>
        <input
          type="text"
          placeholder={`Type in your ${
            type === ChatTypes.guesses ? "guesses" : "message"
          }...`}
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
