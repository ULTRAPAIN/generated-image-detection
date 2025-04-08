import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCommentDots, FaTimes } from "react-icons/fa";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi, how can I help you with AI-Image Detective?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simple responses based on keyword matching
    let botReply = "Sorry, I didn't understand that.";
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("dataset")) {
      botReply = "Our dataset consists of 70,000 real facial images and corresponding GAN-generated images.";
    } else if (lowerInput.includes("performance")) {
      botReply = "We evaluate the models using Accuracy, Precision, Recall, F1 score, and ROC-AUC metrics.";
    } else if (lowerInput.includes("how it works")) {
      botReply = "Our image detection uses advanced GANs (WGAN, ProGAN) and fine-tuned discriminators to spot AI-generated images.";
    }
    // Add more cases as needed

    setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 text-white p-3 rounded-full shadow-lg"
        >
          <FaCommentDots size={24} />
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col"
        >
          <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
            <span className="font-bold text-gray-800 dark:text-gray-200">ChatBot</span>
            <button onClick={() => setIsOpen(false)}>
              <FaTimes className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-sm ${
                  msg.sender === "bot"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100"
                    : "bg-green-200 dark:bg-green-700 text-gray-900"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="p-3 border-t dark:border-gray-700">
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatBot;