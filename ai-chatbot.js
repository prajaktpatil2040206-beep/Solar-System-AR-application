// ai-chatbot.js – AI Chatbot for Space Exploration (Gemini API)

(function() {
    const API_KEY = 'AIzaSyA2pNbhgkjz4qzKKnuzxCUx6wq2ugRqEms';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    // Inject styles
    const style = document.createElement('style');
    style.innerHTML = `
        .ai-chatbot-button {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 2px solid #fff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            cursor: pointer;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s;
            font-size: 30px;
            color: white;
        }
        .ai-chatbot-button:hover {
            transform: scale(1.1);
        }
        .ai-chatbot-panel {
            position: fixed;
            top: 100px;
            right: 30px;
            width: 350px;
            height: 500px;
            background: rgba(20, 30, 50, 0.95);
            backdrop-filter: blur(10px);
            border: 2px solid #3a6ea5;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 10000;
            display: none;
            flex-direction: column;
            overflow: hidden;
            color: white;
            font-family: Arial, sans-serif;
        }
        .ai-chatbot-panel.open {
            display: flex;
        }
        .ai-chatbot-header {
            background: #2a4a7a;
            padding: 15px;
            text-align: center;
            font-weight: bold;
            border-bottom: 1px solid #3a6ea5;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .ai-chatbot-close {
            cursor: pointer;
            font-size: 20px;
            background: none;
            border: none;
            color: white;
        }
        .ai-chatbot-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .message {
            padding: 10px;
            border-radius: 15px;
            max-width: 80%;
            word-wrap: break-word;
        }
        .user-message {
            background: #3a6ea5;
            align-self: flex-end;
        }
        .bot-message {
            background: #2a3a5a;
            align-self: flex-start;
        }
        .ai-chatbot-input-area {
            display: flex;
            padding: 10px;
            border-top: 1px solid #3a6ea5;
            background: #1a2a3a;
        }
        .ai-chatbot-input {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 20px;
            background: #2a3a5a;
            color: white;
            outline: none;
        }
        .ai-chatbot-send, .ai-chatbot-mic {
            background: #3a6ea5;
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-left: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        }
        .ai-chatbot-mic.listening {
            background: #ff4444;
            animation: pulse 1s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        .speaker-btn {
            background: none;
            border: none;
            color: #8ab3ff;
            cursor: pointer;
            margin-left: 5px;
            font-size: 14px;
        }
        .message-wrapper {
            display: flex;
            align-items: center;
        }
        .bot-message + .speaker-btn {
            margin-left: 5px;
        }
    `;
    document.head.appendChild(style);

    // Create elements
    const button = document.createElement('div');
    button.className = 'ai-chatbot-button';
    button.innerHTML = '🤖';
    button.title = 'Ask AI about space';

    const panel = document.createElement('div');
    panel.className = 'ai-chatbot-panel';
    panel.innerHTML = `
        <div class="ai-chatbot-header">
            <span>🚀 Space AI Assistant</span>
            <button class="ai-chatbot-close">✕</button>
        </div>
        <div class="ai-chatbot-messages" id="chatMessages"></div>
        <div class="ai-chatbot-input-area">
            <input type="text" class="ai-chatbot-input" placeholder="Ask about planets, moons, space..." id="chatInput">
            <button class="ai-chatbot-send" id="sendBtn">➤</button>
            <button class="ai-chatbot-mic" id="micBtn">🎤</button>
        </div>
    `;

    document.body.appendChild(button);
    document.body.appendChild(panel);

    // References
    const closeBtn = panel.querySelector('.ai-chatbot-close');
    const messagesDiv = document.getElementById('chatMessages');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');

    // Toggle panel
    button.addEventListener('click', () => {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
            input.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
    });

    // Speech recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isListening = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('listening');
        };

        recognition.onend = () => {
            isListening = false;
            micBtn.classList.remove('listening');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            input.value = transcript;
            sendMessage(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            isListening = false;
            micBtn.classList.remove('listening');
            addMessage('bot', 'Sorry, I could not understand. Please try again.');
        };
    }

    micBtn.addEventListener('click', () => {
        if (!recognition) {
            addMessage('bot', 'Voice input is not supported in your browser.');
            return;
        }
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    // Send message on Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(input.value);
        }
    });

    sendBtn.addEventListener('click', () => {
        sendMessage(input.value);
    });

    async function sendMessage(text) {
        if (!text.trim()) return;
        addMessage('user', text);
        input.value = '';
        addMessage('bot', 'Thinking...', true); // temporary thinking message

        try {
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are a helpful space and astronomy expert. Answer questions about planets, moons, solar system, stars, and space exploration. Keep answers informative but concise (max 100 words). Question: ${text}`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.candidates[0].content.parts[0].text;

            // Remove the "Thinking..." message and add real reply
            removeLastBotMessage();
            addMessage('bot', reply, false, true);
        } catch (error) {
            console.error('Gemini API error:', error);
            removeLastBotMessage();
            addMessage('bot', 'Sorry, I encountered an error. Please try again later.');
        }
    }

    function addMessage(sender, text, isTemporary = false, withSpeaker = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        if (isTemporary) msgDiv.id = 'temp-message';
        msgDiv.textContent = text;

        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';
        wrapper.appendChild(msgDiv);

        if (sender === 'bot' && !isTemporary && withSpeaker) {
            const speaker = document.createElement('button');
            speaker.className = 'speaker-btn';
            speaker.innerHTML = '🔊';
            speaker.onclick = () => speakText(text);
            wrapper.appendChild(speaker);
        }

        messagesDiv.appendChild(wrapper);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function removeLastBotMessage() {
        const temp = document.getElementById('temp-message');
        if (temp) {
            const wrapper = temp.parentElement;
            wrapper.remove();
        }
    }

    function speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            window.speechSynthesis.cancel(); // stop any current speech
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech not supported in your browser.');
        }
    }

    // Welcome message
    addMessage('bot', 'Hello! I am your space AI assistant. Ask me anything about planets, moons, stars, or the solar system!', false, true);
})();