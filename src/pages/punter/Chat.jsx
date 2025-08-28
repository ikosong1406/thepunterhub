import React, { useState } from "react";
import {
  FaSearch,
  FaPaperPlane,
  FaTimes,
  FaUser,
  FaEllipsisV,
} from "react-icons/fa";
import Header from "./Header";

const ChatInterface = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample chat data
  const chats = [
    {
      id: 1,
      name: "Alex Johnson",
      lastMessage: "Hey, are we still meeting tomorrow?",
      timestamp: "2:30 PM",
      unread: 3,
      avatar: null,
      messages: [
        {
          id: 1,
          text: "Hi there! How's it going?",
          sender: "them",
          time: "2:15 PM",
        },
        {
          id: 2,
          text: "I'm doing well, thanks! How about you?",
          sender: "me",
          time: "2:16 PM",
        },
        {
          id: 3,
          text: "Pretty good. Are we still meeting tomorrow?",
          sender: "them",
          time: "2:30 PM",
        },
      ],
    },
    {
      id: 2,
      name: "Sarah Williams",
      lastMessage: "I sent you the documents",
      timestamp: "1:45 PM",
      unread: 0,
      avatar: null,
      messages: [
        {
          id: 1,
          text: "Did you get a chance to review the proposal?",
          sender: "them",
          time: "1:30 PM",
        },
        {
          id: 2,
          text: "Yes, I'll send my feedback shortly",
          sender: "me",
          time: "1:35 PM",
        },
        {
          id: 3,
          text: "Great! I sent you the documents we discussed",
          sender: "them",
          time: "1:45 PM",
        },
      ],
    },
    {
      id: 3,
      name: "Design Team",
      lastMessage: "Michael: The new mockups are ready",
      timestamp: "11:22 AM",
      unread: 7,
      avatar: null,
      messages: [
        {
          id: 1,
          text: "When will the designs be ready?",
          sender: "me",
          time: "10:00 AM",
        },
        {
          id: 2,
          text: "We're almost done with the final touches",
          sender: "them",
          time: "10:15 AM",
        },
        {
          id: 3,
          text: "The new mockups are ready for review",
          sender: "them",
          time: "11:22 AM",
        },
      ],
    },
    {
      id: 4,
      name: "Mom",
      lastMessage: "Don't forget to call me later",
      timestamp: "Yesterday",
      unread: 0,
      avatar: null,
      messages: [
        {
          id: 1,
          text: "How are you doing honey?",
          sender: "them",
          time: "Yesterday",
        },
        {
          id: 2,
          text: "I'm good mom, just busy with work",
          sender: "me",
          time: "Yesterday",
        },
        {
          id: 3,
          text: "Don't forget to call me later",
          sender: "them",
          time: "Yesterday",
        },
      ],
    },
    {
      id: 5,
      name: "David Miller",
      lastMessage: "The meeting is rescheduled to Friday",
      timestamp: "Wednesday",
      unread: 0,
      avatar: null,
      messages: [
        {
          id: 1,
          text: "Can we move our meeting?",
          sender: "them",
          time: "Wednesday",
        },
        {
          id: 2,
          text: "Sure, what time works for you?",
          sender: "me",
          time: "Wednesday",
        },
        {
          id: 3,
          text: "The meeting is rescheduled to Friday",
          sender: "them",
          time: "Wednesday",
        },
      ],
    },
  ];

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    // In a real app, you would send the message to the server
    // For this example, we'll just add it to the selected chat
    const newMessage = {
      id: selectedChat.messages.length + 1,
      text: message,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
    });

    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
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
          {filteredChats.map((chat) => (
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
                <p className={`m-0 mt-1 ${chat.unread > 0 ? "text-[#efefef] font-bold" : "text-[#376553]"}`}>
                  {chat.lastMessage}
                </p>
              </div>

              {chat.unread > 0 && (
                <div className="bg-[#fea92a] text-[#09100d] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold ml-3">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
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
                <p className="m-0 text-[#376553] text-sm">Online</p>
              </div>
            </div>

            <button className="bg-transparent border-none text-[#efefef] cursor-pointer">
              <FaEllipsisV />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto bg-[#09100d]">
            {selectedChat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-4 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
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
                      msg.sender === "me" ? "text-[#09100d]" : "text-[#c4c4c4]"
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
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