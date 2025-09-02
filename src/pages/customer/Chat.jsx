import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaSearch,
  FaPaperPlane,
  FaTimes,
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

  const messagesEndRef = useRef(null);
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  const formatMessagesToChats = (chats, currentUserId) => {
    if (!chats) return [];

    return chats.map((chat) => {
      const { chatId, opponent, latestMessage } = chat;
      // Determine if the latest message was sent by the current user
      const isMyMessage = latestMessage.role === "user";

      // The message content to display in the chat list
      const lastMessageContent = latestMessage.content;
      const displayMessage = isMyMessage
        ? `You: ${lastMessageContent}`
        : lastMessageContent;

      return {
        id: chatId,
        punterId: opponent.id,
        userId: currentUserId,
        name: opponent.username,
        lastMessage: displayMessage,
        timestamp: new Date(latestMessage.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        unread: 0, // This logic needs to be handled by the backend
        avatar: null, // Placeholder for avatars
        messages: [], // We don't have the full message history from this endpoint
        isPunterLastMessage: !isMyMessage,
      };
    });
  };

  const fetchChats = useCallback(async () => {
    if (!user) return;
    setLoadingChats(true);
    try {
      const response = await axios.post(`${Api}/client/getMessages`, {
        id: user._id,
      });
      const formattedChats = formatMessagesToChats(
        response.data.chats,
        user._id
      );
      setChatList(formattedChats);
    } catch (err) {
      setChatError("Failed to fetch messages.");
    } finally {
      setLoadingChats(false);
    }
  }, [user]);

  const fetchChatMessages = useCallback(async (chatId) => {
    setLoadingChatMessages(true);
    try {
      const response = await axios.post(`${Api}/client/getMessagedetails`, {
        chatId,
      });
      const formattedMessages = response.data.messages.map((msg) => ({
        id: msg._id,
        text: msg.content,
        sender: msg.role === "user" ? "user" : "punter",
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
    if (user) {
      fetchChats();
      const interval = setInterval(() => {
        fetchChats();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user, fetchChats]);

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

  const filteredChats = chatList.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (message.trim() === "" || !selectedChat || !user) return;

    const tempNewMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
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
      let response;
      if (selectedChat.id.startsWith("new-")) {
        const punterId = selectedChat.id.replace("new-", "");
        response = await axios.post(`${Api}/client/createMessage`, {
          userId: user._id,
          punterId,
          message: tempNewMessage.text,
          role: "user",
        });
        const newChatId = response.data.chatId;
        setChatList((prevChatList) =>
          prevChatList.map((chat) =>
            chat.id === selectedChat.id ? { ...chat, id: newChatId } : chat
          )
        );
      } else {
        response = await axios.post(`${Api}/client/sendMessage`, {
          chatId: selectedChat.id,
          role: "user",
          content: tempNewMessage.text,
        });
      }
      fetchChats();
      fetchChatMessages(
        selectedChat.id.startsWith("new-")
          ? response.data.chatId
          : selectedChat.id
      );
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

  const handleSelectPunter = (punter) => {
    const existingChat = chatList.find((chat) => chat.punterId === punter._id);
    if (existingChat) {
      setSelectedChat(existingChat);
      fetchChatMessages(existingChat.id);
    } else {
      const newChat = {
        id: `new-${punter._id}`,
        punterId: punter._id,
        userId: user._id,
        name: punter.username,
        lastMessage: "Start the conversation...",
        timestamp: "Just now",
        unread: 0,
        avatar: punter.avatar,
        messages: [],
      };
      setChatList((prevChats) => [newChat, ...prevChats]);
      setSelectedChat(newChat);
    }
    setShowPuntersModal(false);
  };

  const handleSelectExistingChat = (chat) => {
    setSelectedChat(chat);
    fetchChatMessages(chat.id);
  };

  const getInitials = (username) => {
    if (!username) return "";
    const nameParts = username.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return username.charAt(0).toUpperCase();
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
                      alt={chat.username}
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
                      color: chat.isPunterLastMessage ? "#18ffc8" : "#376553",
                    }}
                  >
                    {chat.isPunterLastMessage && (
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
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-[#18ffc8] text-[#09100d] rounded-br-sm rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                        : "bg-[#376553] text-[#efefef] rounded-bl-sm rounded-tr-xl rounded-tl-xl rounded-br-xl"
                    }`}
                  >
                    <p className="m-0">{msg.text}</p>
                    <div
                      className={`text-xs text-right mt-1 ${
                        msg.sender === "user"
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

      {showPuntersModal && <PuntersScreenModal />}
    </div>
  );
};

export default ChatInterface;
