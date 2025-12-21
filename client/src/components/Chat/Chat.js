import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import Messages from "../Messages/Messages";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";

import "./Chat.css";

const ENDPOINT = "https://chat-server2-eb0g.onrender.com";
let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showUsers, setShowUsers] = useState(false); // ✅ MOVED HERE

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setRoom(room);
    setName(name);

    socket.emit("join", { name, room }, (error) => {
      if (error) alert(error);
    });

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [location.search]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((msgs) => [...msgs, message]);
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  return (
    <div className="outerContainer">
      <div className="container">

        {/* TOP BAR WITH HAMBURGER */}
        <div className="topBar">
          <div
            className="hamburger"
            onClick={() => setShowUsers(!showUsers)}
          >
            ☰
            <span className="userCount">{users.length}</span>
          </div>
        </div>

        {/* USERS DROPDOWN */}
        {showUsers && (
          <div className="usersDropdown">
            <h4>People chatting</h4>
            {users.map((user) => (
              <div
                key={user.name}
                className={`userItem ${
                  user.name === name ? "you" : ""
                }`}
              >
                🟢 {user.name}
                {user.name === name && " (You)"}
              </div>
            ))}
          </div>
        )}

        {/* CHAT AREA */}
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
};

export default Chat;
