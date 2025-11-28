// components/ChatBox.tsx
import React, { useState, useRef, useEffect } from 'react';
import http from "../api/http";

interface ChatStep {
  step_key: string;
  step_type: 'message' | 'options' | 'input' | 'api_call';
  message_text: string;
  options: string[];
  validation_rules: any;
  next_step_map: { [key: string]: string };
  api_config: any;
  is_initial?: boolean;
  sort_order: number;
}

interface ChatFlow {
  id?: number;
  name: string;
  description: string;
  is_active: boolean;
  steps: ChatStep[];
  created_at?: string;
  step_count?: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'option' | 'input' | 'message';
  options?: string[];
}

interface ChatSession {
  session_token: string;
  session_id: number;
}

interface UserData {
  [key: string]: any;
}

const ChatBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentFlow, setCurrentFlow] = useState<ChatFlow | null>(null);
  const [currentStep, setCurrentStep] = useState<ChatStep | null>(null);
  const [userData, setUserData] = useState<UserData>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen]);

  // Load active chat flow from backend
 // In ChatBox.tsx - Update the loadActiveFlow function
const loadActiveFlow = async () => {
  try {
    setIsLoading(true);
    const response = await http.get('/api/chat/flows/active');
    setCurrentFlow(response.data);
    
    console.log('🔍 Active Flow Steps:', response.data.steps);
    
    // Find and set initial step
    const initialStep = response.data.steps.find((step: ChatStep) => step.is_initial);
    if (initialStep) {
      setCurrentStep(initialStep);
      addBotMessage(initialStep.message_text, initialStep.options, initialStep.step_type);
    }
  } catch (error) {
    console.error('Failed to load active flow:', error);
    setError('Failed to load chat service. Please try again later.');
    // Fallback to default message
    addBotMessage("Welcome! Our chat service is currently unavailable. Please contact support directly.", [], 'message');
  } finally {
    setIsLoading(false);
  }
};

  const initializeChat = async () => {
    try {
      // Start chat session
      const sessionResponse = await http.post('/api/chat/session/start', {
        phone: null,
        user_id: null
      });

      if (sessionResponse.data.success) {
        setChatSession({
          session_token: sessionResponse.data.session_token,
          session_id: sessionResponse.data.session_id
        });
      }

      // Load active flow
      await loadActiveFlow();
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      // Fallback to loading flow without session
      await loadActiveFlow();
    }
  };

// In ChatBox.tsx - Update the saveMessageToBackend function
const saveMessageToBackend = async (message: Omit<Message, 'id' | 'timestamp'>, stepKey: string) => {
  if (!chatSession) {
    console.log('❌ No chat session available for saving message');
    return;
  }

  try {
    console.log('💾 Saving message to backend:', {
      stepKey,
      messageType: message.sender,
      content: message.text.substring(0, 30) + '...'
    });

    const payload = {
      session_token: chatSession.session_token,
      message_type: message.sender,
      content: message.text,
      message_data: {
        type: message.type,
        options: message.options,
        step: stepKey, // Ensure step is included here too
        user_data: userData
      },
      step: stepKey // This is the main step parameter
    };

    console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

    const response = await http.post('/api/chat/message/save', payload);
    
    console.log('✅ Message saved successfully:', response.data);
  } catch (error) {
    console.error('❌ Failed to save message:', error);
  }
};

const executeApiCall = async (step: ChatStep, userInput: string) => {
  if (!step.api_config?.endpoint) return null;

  try {
    // SPECIAL: Ticket creation
    if (step.api_config.endpoint === "/api/chat/ticket/create") {
      const response = await http.post(step.api_config.endpoint, {
        session_token: chatSession?.session_token,
        user_data: userData,
        issue_type: userData.issue_type || userInput,
        sub_issue: userData.sub_issue,
        description: userData.description,
        priority: userData.priority || "medium"
      });
      return response.data;
    }

    // NORMAL API STEPS
    const response = await http.post(step.api_config.endpoint, {
      user_input: userInput,
      user_data: userData,
      step_data: step
    });

    return response.data;
  } catch (error) {
    console.error("API call failed:", error);
    return null;
  }
};


  const addBotMessage = async (text: string, options?: string[], stepType?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      type: stepType === 'options' ? 'option' : 'message',
      options
    };
    setMessages(prev => [...prev, newMessage]);

    // Save to backend if we have a current step
    if (currentStep) {
      await saveMessageToBackend({
        text,
        sender: 'bot',
        type: stepType === 'options' ? 'option' : 'message',
        options
      }, currentStep.step_key);
    }
  };

  const addUserMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type: 'message'
    };
    setMessages(prev => [...prev, newMessage]);

    // Save to backend if we have a current step
    if (currentStep) {
      await saveMessageToBackend({
        text,
        sender: 'user',
        type: 'message'
      }, currentStep.step_key);
    }
  };

  const validateInput = (input: string, validationRules: any): boolean => {
    if (!validationRules?.pattern) return true;
    
    try {
      const regex = new RegExp(validationRules.pattern);
      return regex.test(input);
    } catch (error) {
      console.error('Invalid regex pattern:', validationRules.pattern);
      return true;
    }
  };

  // In ChatBox.tsx - Add debug logging to handleOptionClick
const handleOptionClick = async (option: string) => {
  if (!currentStep || !currentFlow) {
    console.log('❌ No current step or flow available');
    return;
  }

  console.log('🔍 handleOptionClick DETAILED:', {
    currentStepKey: currentStep.step_key,
    currentStepType: currentStep.step_type,
    userInput: option,
    isPhoneStep: currentStep.step_key === 'phone',
    stepKeyInUserData: currentStep.step_key
  });

  await addUserMessage(option);
  setIsTyping(true);

  // Store user input in user data
  setUserData(prev => ({
    ...prev,
    [currentStep.step_key]: option
  }));

  
  // Handle API calls if step type is api_call
// Handle API calls if step type is api_call
if (currentStep.step_type === 'api_call') {
  const apiResponse = await executeApiCall(currentStep, option);

  // ❗ TICKET CREATED -> STOP flow
  if (apiResponse?.ticket_number) {
    setIsTyping(false);

    await addBotMessage(
      `🎫 *Support Ticket Created Successfully!*\n\nYour ticket number is: *${apiResponse.ticket_number}*.\nOur team will contact you soon.`,
      [],
      "message"
    );

    return; // VERY IMPORTANT — END FLOW HERE
  }

  // PHONE INVALID
  if (apiResponse?.user_data?.phone_valid === false) {
    setIsTyping(false);
    await addBotMessage(apiResponse.user_data.error_message || "Invalid number.");
    return;
  }

  // EMAIL INVALID
  if (apiResponse?.user_data?.email_valid === false) {
    setIsTyping(false);
    await addBotMessage(apiResponse.user_data.error_message || "Invalid email.");
    return;
  }
}


  // Find next step
  let nextStepKey = currentStep.next_step_map[option] || currentStep.next_step_map['default'];
  
  console.log('🔄 Next step calculation:', {
    option,
    nextStepMap: currentStep.next_step_map,
    calculatedNextStep: nextStepKey
  });

  // Dynamic next step resolution based on API response or conditions
  if (currentStep.step_type === 'api_call' && currentStep.api_config?.next_step_logic) {
    nextStepKey = resolveNextStep(currentStep, option);
  }

  setTimeout(() => {
    if (nextStepKey) {
      navigateToStep(nextStepKey);
    } else {
      console.log('🏁 No next step found - end of flow');
    }
    setIsTyping(false);
  }, 1000);
};
  const resolveNextStep = (currentStep: ChatStep, userInput: string): string => {
    // Implement dynamic next step resolution logic
    if (currentStep.api_config?.next_step_logic) {
      const logic = currentStep.api_config.next_step_logic;
      for (const condition of logic.conditions) {
        if (condition.field && userData[condition.field] === condition.value) {
          return condition.next_step;
        }
      }
    }
    
    // Fallback to static mapping
    return currentStep.next_step_map[userInput] || currentStep.next_step_map['default'];
  };

  const navigateToStep = (stepKey: string) => {
    if (!currentFlow) return;

    const nextStep = currentFlow.steps.find(step => step.step_key === stepKey);
    if (nextStep) {
      setCurrentStep(nextStep);
      addBotMessage(nextStep.message_text, nextStep.options, nextStep.step_type);
    } else {
      // End of flow or step not found
      addBotMessage("Thank you for chatting with us! If you need further assistance, please contact our support team.", [], 'message');
    }
  };

const handleSendMessage = async () => {
  if (!inputValue.trim() || !currentStep) return;

  const text = inputValue.trim();

  // Input is saved same as option click
  await handleOptionClick(text);

  setInputValue('');
};


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const createSupportTicket = async (issueData: any) => {
    if (!chatSession) return null;

    try {
      const response = await http.post('/api/chat/ticket/create', {
        session_token: chatSession.session_token,
        ...issueData
      });
      return response.data.ticket_number;
    } catch (error) {
      console.error('Failed to create ticket:', error);
      return 'BZ' + Date.now().toString().slice(-6); // Fallback
    }
  };

  // Helper function to safely parse JSON fields
  const safeJsonParse = (str: any, defaultValue: any = {}) => {
    if (!str) return defaultValue;
    if (typeof str === 'object') return str;
    try {
      return JSON.parse(str);
    } catch (error) {
      return defaultValue;
    }
  };

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 transition-transform duration-300 hover:scale-105 flex flex-col items-center"
        >
          <div className="relative">
            <img 
              src="chatlogo.png"
              alt="Chat with us"
              className="w-[150px] h-[160px] object-contain" 
            />
            <div className="absolute top-4 right-4 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
              Hi, I'm your Bizz Assist
            </p>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#e76458] to-[#f09188] text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="chatlogo.png"
                alt="BizAssist"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h3 className="font-semibold">
                  {currentFlow?.name || 'BizAssist Support'}
                </h3>
                <p className="text-white/90 text-sm">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/90 hover:text-white transition-colors bg-black/20 rounded-full p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border-b border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e76458] mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading chat...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block max-w-[80%] rounded-2xl px-4 py-2 whitespace-pre-line ${
                        message.sender === 'user'
                          ? 'bg-[#e76458] text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Options */}
                    {message.type === 'option' && message.options && (
                      <div className="mt-3 space-y-2">
                        {message.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleOptionClick(option)}
                            className="block w-full text-left bg-white border border-gray-300 hover:border-[#e76458] hover:bg-[#e76458]/5 rounded-xl px-4 py-3 text-sm text-gray-700 hover:text-[#e76458] transition-all duration-200"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center space-x-2 text-gray-500 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>BizAssist is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
    {(currentStep?.step_type === 'input' || currentStep?.step_type === 'api_call') && (
  <div className="p-4 border-t border-gray-200 bg-white">
    <div className="flex space-x-2">
      <input
        type={currentStep.step_key === 'phone' ? 'tel' : 'text'}
        inputMode={currentStep.step_key === 'phone' ? 'numeric' : 'text'}
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value;

          if (currentStep.step_key === 'phone') {
            if (/^\d*$/.test(val) && val.length <= 10) {
              setInputValue(val);
            }
          } else {
            setInputValue(val);
          }
        }}
        onKeyPress={handleKeyPress}
        placeholder={currentStep?.validation_rules?.placeholder || "Type your response..."}
        className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
          inputValue && !validateInput(inputValue, currentStep.validation_rules)
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-[#e76458] focus:ring-[#e76458]'
        }`}
      />

      <button
        onClick={handleSendMessage}
        disabled={!inputValue.trim()}
        className="bg-[#e76458] text-white rounded-xl px-6 py-3 hover:bg-[#e76458]/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  </div>
)}


          {/* No active flow message */}
          {!currentFlow && !isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="mt-2">Chat service unavailable</p>
                <button
                  onClick={initializeChat}
                  className="mt-2 text-[#e76458] hover:text-[#e76458]/80 text-sm"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBox;