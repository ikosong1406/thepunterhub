import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaSearch,
  FaPaperPlane,
  FaTimes,
  FaEllipsisV,
  FaArrowLeft,
} from "react-icons/fa";
import Header from "./Header";
import axios from "axios";
import Api from "../../components/Api";
import localforage from "localforage";

const ChatInterface = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [punter, setPunter] = useState(null);
  const [loadingPunter, setLoadingPunter] = useState(true);
  const [punterError, setPunterError] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [chatError, setChatError] = useState(null);

  const messagesEndRef = useRef(null);
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchPunterData = async () => {
      try {
        const token = await localforage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found.");
        }
        const response = await axios.post(`${Api}/client/getUser`, { token });
        setPunter(response.data.data);
        setLoadingPunter(false);
      } catch (err) {
        setPunterError(err.message);
        setLoadingPunter(false);
      }
    };
    fetchPunterData();
  }, []);

  const formatMessagesToChats = (chats, currentPunterId) => {
    if (!chats) return [];

    return chats.map((chat) => {
      const { chatId, opponent, latestMessage } = chat;
      const isMyMessage = latestMessage.role === "punter";

      const lastMessageContent = latestMessage.content;
      const displayMessage = isMyMessage
        ? `You: ${lastMessageContent}`
        : lastMessageContent;

      return {
        id: chatId,
        opponentId: opponent.id,
        punterId: currentPunterId,
        name: opponent.fullname,
        lastMessage: displayMessage,
        timestamp: new Date(latestMessage.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        unread: 0,
        avatar: null,
        messages: [],
        isOpponentLastMessage: !isMyMessage,
      };
    });
  };

  const fetchChats = useCallback(async () => {
    if (!punter) return;
    setLoadingChats(true);
    try {
      const response = await axios.post(`${Api}/client/getMessages`, {
        id: punter._id,
      });
      const formattedChats = formatMessagesToChats(
        response.data.chats,
        punter._id
      );
      setChatList(formattedChats);
    } catch (err) {
      setChatError("Failed to fetch messages.");
    } finally {
      setLoadingChats(false);
    }
  }, [punter]);

  const fetchChatMessages = useCallback(async (chatId) => {
    setLoadingChatMessages(true);
    try {
      const response = await axios.post(`${Api}/client/getMessagedetails`, {
        chatId,
      });
      const formattedMessages = response.data.messages.map((msg) => ({
        id: msg._id,
        text: msg.content,
        sender: msg.role === "punter" ? "punter" : "opponent",
        time: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setSelectedChat((prevChat) => ({
        ...prevChat,
        messages: formattedMessages,
      }));
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    } finally {
      setLoadingChatMessages(false);
    }
  }, []);

  useEffect(() => {
    if (punter) {
      fetchChats();
      const interval = setInterval(() => {
        fetchChats();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [punter, fetchChats]);

  // New useEffect to periodically fetch chat messages
  useEffect(() => {
    if (selectedChat) {
      fetchChatMessages(selectedChat.id);
      const interval = setInterval(() => {
        fetchChatMessages(selectedChat.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat, fetchChatMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const filteredChats = chatList.filter(
    (chat) =>
      chat.name && chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (message.trim() === "" || !selectedChat || !punter) return;

    const tempNewMessage = {
      id: Date.now(),
      text: message,
      sender: "punter",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setSelectedChat((prevChat) => ({
      ...prevChat,
      messages: [...(prevChat.messages || []), tempNewMessage],
    }));
    setMessage("");

    try {
      await axios.post(`${Api}/client/sendMessage`, {
        chatId: selectedChat.id,
        role: "punter",
        content: tempNewMessage.text,
      });

      fetchChats();
      fetchChatMessages(selectedChat.id);
    } catch (err) {
      console.error("Failed to send message:", err);
      setSelectedChat((prevChat) => ({
        ...prevChat,
        messages: prevChat.messages.filter(
          (msg) => msg.id !== tempNewMessage.id
        ),
      }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectExistingChat = (chat) => {
    setSelectedChat(chat);
    fetchChatMessages(chat.id);
  };

  const getInitials = (fullname) => {
    if (!fullname) return "";
    const nameParts = fullname.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return fullname.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-[#09100d] min-h-screen text-[#efefef]">
      {/* Chat List */}
      <div className="max-w-4xl mx-auto p-4">
        <Header />

        {/* Search Bar */}
        <div className="bg-[#162821] rounded-xl p-3 mb-5 flex items-center mt-1">
          <FaSearch className="text-[#376553] mr-3" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-[#efefef] w-full outline-none"
          />
        </div>

        {/* Chat List */}
        <div className="bg-[#162821] rounded-xl overflow-hidden">
          {loadingChats && chatList.length === 0 ? (
            <div className="p-8 text-center">
              <p style={{ color: "#efefef" }}>Loading messages...</p>
            </div>
          ) : chatError ? (
            <div className="p-8 text-center">
              <p style={{ color: "#f57cff" }}>{chatError}</p>
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectExistingChat(chat)}
                className="p-4 border-b border-[#376553] cursor-pointer flex items-center transition-colors hover:bg-[#1e3029]"
              >
                <div className="w-12 h-12 rounded-full bg-[#376553] flex items-center justify-center mr-4 text-[#efefef] text-lg font-bold">
                  {chat.avatar ? (
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    getInitials(chat.name)
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="m-0 text-[#efefef]">{chat.name}</h3>
                    <span className="text-[#376553] text-xs">
                      {chat.timestamp}
                    </span>
                  </div>
                  <p
                    className="m-0 mt-1"
                    style={{
                      color: chat.isOpponentLastMessage ? "#18ffc8" : "#376553",
                    }}
                  >
                    {chat.isOpponentLastMessage && (
                      <span className="text-xl inline-block mr-2 leading-none align-middle">
                        •
                      </span>
                    )}
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unread > 0 && (
                  <div className="bg-[#fea92a] text-[#09100d] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold ml-3">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p style={{ color: "#efefef" }}>
                No messages found. Start a new chat!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-[#09100d] z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#376553] flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => setSelectedChat(null)}
                className="bg-transparent border-none text-[#efefef] cursor-pointer mr-4"
              >
                <FaArrowLeft size={20} />
              </button>

              <div className="w-10 h-10 rounded-full bg-[#376553] flex items-center justify-center mr-4 text-[#efefef] text-base font-bold">
                {selectedChat.avatar ? (
                  <img
                    src={selectedChat.avatar}
                    alt={selectedChat.name}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  getInitials(selectedChat.name)
                )}
              </div>

              <div>
                <h3 className="m-0 text-[#efefef]">{selectedChat.name}</h3>
              </div>
            </div>

            <button className="bg-transparent border-none text-[#efefef] cursor-pointer">
              <FaEllipsisV />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto bg-[#09100d]">
            {selectedChat.messages.length > 0 ? (
              selectedChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex mb-4 ${
                    msg.sender === "punter" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === "punter"
                        ? "bg-[#18ffc8] text-[#09100d] rounded-br-sm rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                        : "bg-[#376553] text-[#efefef] rounded-bl-sm rounded-tr-xl rounded-tl-xl rounded-br-xl"
                    }`}
                  >
                    <p className="m-0">{msg.text}</p>
                    <div
                      className={`text-xs text-right mt-1 ${
                        msg.sender === "punter"
                          ? "text-[#09100d]"
                          : "text-[#c4c4c4]"
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#376553]">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-[#376553] flex items-center bg-[#162821]">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-[#09100d] border border-[#376553] rounded-full py-2 px-4 text-[#efefef] outline-none"
            />

            <button
              onClick={handleSendMessage}
              disabled={message.trim() === ""}
              className={`rounded-full w-10 h-10 flex items-center justify-center ml-3 ${
                message.trim() === ""
                  ? "bg-[#376553] text-[#7a8c85] cursor-not-allowed"
                  : "bg-[#fea92a] text-[#09100d] cursor-pointer"
              }`}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
