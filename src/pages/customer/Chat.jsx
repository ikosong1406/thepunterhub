import React, { useState, useEffect, useCallback } from "react";
import {
  FaSearch,
  FaPaperPlane,
  FaTimes,
  FaUser,
  FaEllipsisV,
  FaArrowLeft,
} from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import Header from "./Header";
import axios from "axios";
import Api from "../../components/Api";
import localforage from "localforage";

const ChatInterface = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPuntersModal, setShowPuntersModal] = useState(false);
  const [subscribedPunters, setSubscribedPunters] = useState([]);
  const [loadingPunters, setLoadingPunters] = useState(false);
  const [error, setError] = useState(null);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [chatError, setChatError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await localforage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found.");
        }
        const response = await axios.post(`${Api}/client/getUser`, { token });
        setUser(response.data.data);
        setLoadingUser(false);
      } catch (err) {
        setUserError(err.message);
        setLoadingUser(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchChats = async () => {
        setLoadingChats(true);
        try {
          const response = await axios.post(`${Api}/client/getMessages`, {
            id: user._id,
          });
          const formattedChats = formatMessagesToChats(
            response.data.messages,
            user._id
          );
          setChatList(formattedChats);
        } catch (err) {
          setChatError("Failed to fetch messages.");
        } finally {
          setLoadingChats(false);
        }
      };
      fetchChats();
    }
  }, [user]);

  const formatMessagesToChats = (messages, currentUserId) => {
    const chatsMap = {};
    messages.forEach((msg) => {
      const isMyMessage = msg.sender === currentUserId;
      const otherPartyId = isMyMessage ? msg.punterId : msg.userId;
      const otherPartyName = isMyMessage ? msg.punterName : "Me"; // Assuming punterName is available

      if (!chatsMap[otherPartyId]) {
        chatsMap[otherPartyId] = {
          id: otherPartyId,
          name: otherPartyName,
          lastMessage: msg.message,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          unread: 0, // This needs to be managed on the backend
          avatar: null, // Placeholder
          messages: [],
        };
      } else {
        chatsMap[otherPartyId].lastMessage = msg.message;
        chatsMap[otherPartyId].timestamp = new Date(
          msg.timestamp
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      chatsMap[otherPartyId].messages.push({
        id: msg._id,
        text: msg.message,
        sender: isMyMessage ? "me" : "them",
        time: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    });

    return Object.values(chatsMap);
  };

  const filteredChats = chatList.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (message.trim() === "" || !selectedChat || !user) return;

    const newMessage = {
      punterId: selectedChat.id,
      userId: user._id,
      message: message,
      role: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const tempNewMessage = {
      id: Date.now(),
      text: message,
      sender: "me",
      time: newMessage.time,
    };

    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, tempNewMessage],
    });
    setMessage("");

    try {
      await axios.post(`${Api}/createMessage`, newMessage);
      // Re-fetch messages to get the latest state from the server
      const response = await axios.post(`${Api}/client/getMessages`, {
        id: user._id,
      });
      const updatedChats = formatMessagesToChats(
        response.data.messages,
        user._id
      );
      setChatList(updatedChats);
      setSelectedChat(updatedChats.find((chat) => chat.id === selectedChat.id));
    } catch (err) {
      console.error("Failed to send message:", err);
      // Revert the optimistic update if it fails
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
      handleSendMessage();
    }
  };

  const fetchSubscribedPunters = useCallback(async () => {
    if (!user) {
      setError("User not authenticated.");
      return;
    }
    setLoadingPunters(true);
    setError(null);
    try {
      const response = await axios.post(`${Api}/client/getSubscribedpunter`, {
        userId: user._id,
      });
      setSubscribedPunters(response.data.punters);
    } catch (err) {
      setError("Failed to fetch subscribed punters.");
    } finally {
      setLoadingPunters(false);
    }
  }, [user]);

  const handleOpenPuntersModal = () => {
    setShowPuntersModal(true);
    fetchSubscribedPunters();
  };

  const handleSelectPunter = async (punter) => {
    try {
      // Find or create a chat object for this punter
      const existingChat = chatList.find((chat) => chat.id === punter._id);

      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        // Create a new, empty chat for a new conversation
        const newChat = {
          id: punter._id,
          name: punter.username,
          lastMessage: "Start the conversation...",
          timestamp: "Just now",
          unread: 0,
          avatar: punter.avatar,
          messages: [],
        };
        setChatList((prevChats) => [...prevChats, newChat]);
        setSelectedChat(newChat);
      }
      setShowPuntersModal(false);
    } catch (err) {
      console.error("Failed to select punter and fetch chat:", err);
    }
  };

  const getInitials = (username) => {
    const fInitial = username ? username.charAt(0) : "";
    return `${fInitial}`.toUpperCase();
  };

  const PuntersScreenModal = () => (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "#09100d" }}
    >
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center border-b"
          style={{ borderColor: "#376553" }}
        >
          <button
            onClick={() => setShowPuntersModal(false)}
            className="p-1 rounded-full mr-4"
            style={{ color: "#efefef" }}
          >
            <FaArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold" style={{ color: "#efefef" }}>
            New Chat
          </h2>
        </div>
        {/* Search Bar */}
        <div className="px-6 py-4">
          <div
            className="relative rounded-lg overflow-hidden"
            style={{ backgroundColor: "#162821" }}
          >
            <input
              type="text"
              placeholder="Search punters..."
              className="w-full py-3 px-4 pr-10 focus:outline-none"
              style={{ backgroundColor: "#162821", color: "#efefef" }}
            />
            <div
              className="absolute right-3 top-3"
              style={{ color: "#f57cff" }}
            >
              <FaSearch size={16} />
            </div>
          </div>
        </div>
        {/* Main Content (Punter List) */}
        <div className="flex-1 px-6 py-2 overflow-y-auto">
          {loadingPunters ? (
            <div className="p-8 text-center" style={{ color: "#efefef" }}>
              <p>Loading punters...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center" style={{ color: "#f57cff" }}>
              <p>{error}</p>
            </div>
          ) : subscribedPunters.length > 0 ? (
            <div className="space-y-3">
              {subscribedPunters.map((punter) => (
                <div
                  key={punter._id}
                  onClick={() => handleSelectPunter(punter)}
                  className="p-4 rounded-lg cursor-pointer transition-colors"
                  style={{ backgroundColor: "#162821" }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#18ffc8]/20 text-[#18ffc8] text-md font-bold border-2 border-[#18ffc8]">
                      {getInitials(punter.username)}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium" style={{ color: "#efefef" }}>
                        {punter.username}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-8 text-center rounded-lg"
              style={{ backgroundColor: "#162821" }}
            >
              <p style={{ color: "#efefef" }}>No subscribed punters found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loadingUser) {
    return (
      <div className="text-center p-10 text-[#efefef]">
        Loading user data...
      </div>
    );
  }

  if (userError) {
    return (
      <div className="text-center p-10 text-[#f57cff]">Error: {userError}</div>
    );
  }

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
          {loadingChats ? (
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
                onClick={() => setSelectedChat(chat)}
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
                    chat.name.charAt(0)
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
                    className={`m-0 mt-1 ${
                      chat.unread > 0
                        ? "text-[#efefef] font-bold"
                        : "text-[#376553]"
                    }`}
                  >
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

      {/* Floating Action Button */}
      <button
        className="fixed bottom-30 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#fea92a] to-[#855391] flex items-center justify-center shadow-lg hover:shadow-xl transition-all group z-40"
        onClick={handleOpenPuntersModal}
      >
        <FiPlus className="text-2xl text-[#09100d] group-hover:rotate-90 transition-transform" />
      </button>

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
                <FaTimes size={20} />
              </button>

              <div className="w-10 h-10 rounded-full bg-[#376553] flex items-center justify-center mr-4 text-[#efefef] text-base font-bold">
                {selectedChat.avatar ? (
                  <img
                    src={selectedChat.avatar}
                    alt={selectedChat.name}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  selectedChat.name.charAt(0)
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
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === "me"
                        ? "bg-[#18ffc8] text-[#09100d] rounded-br-sm rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                        : "bg-[#376553] text-[#efefef] rounded-bl-sm rounded-tr-xl rounded-tl-xl rounded-br-xl"
                    }`}
                  >
                    <p className="m-0">{msg.text}</p>
                    <div
                      className={`text-xs text-right mt-1 ${
                        msg.sender === "me"
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

      {showPuntersModal && <PuntersScreenModal />}
    </div>
  );
};

export default ChatInterface;
