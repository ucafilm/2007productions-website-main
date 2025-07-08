        if (heroDescriptor) {
           heroDescriptor.textContent = mode === 'agency' ? 'Creating Legendary Experiences' : 'Where Stories Get Weird';
        }
        document.querySelectorAll('.member-label').forEach((label, i) => {
            if(labels[i]) label.textContent = labels[i];
        });
    }, 300);
}

function initializeInteractions() {
    // Add magnetic attribute to interactive elements
    document.querySelectorAll('button, .nav-link, .skill-tag, .contact-link').forEach(el => {
        if (!el.hasAttribute('data-magnetic')) {
            el.setAttribute('data-magnetic', '');
        }
    });
    
    // Add reveal attributes to text elements
    document.querySelectorAll('.member-bio, .member-role, .skills-title').forEach(el => {
        if (!el.hasAttribute('data-reveal')) {
            el.setAttribute('data-reveal', '');
        }
    });
}

function initializeMobileMenu() { 
    // Mobile menu implementation would go here
    console.log('Mobile menu initialized');
}

function initializeEasterEggs() {
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let konamiCode = [];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.code);
        konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            document.body.classList.toggle('konami-mode');
            console.log('Konami code activated! 🎮');
        }
    });
}

function createChaosElement() {
    const symbols = ['◊', '∆', '○', '□', '◈', '⬟', '⬢', '⬡'];
    const element = document.createElement('div');
    element.className = 'chaos-element';
    element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    element.style.left = Math.random() * 100 + 'vw';
    element.style.top = '-50px';
    element.style.animationDuration = (Math.random() * 10 + 10) + 's';
    element.style.fontSize = (Math.random() * 2 + 1) + 'rem';
    element.style.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    document.body.appendChild(element);
    
    setTimeout(() => element.remove(), 20000);
}

// Enhanced AI CHATBOT LOGIC
const advancedAI = {
    isTyping: false,
    async getAIResponse(userMessage) {
        if (this.isTyping) return;
        this.isTyping = true;
        const typingIndicator = showTypingIndicator();
        try {
            const response = await fetch('/.netlify/functions/get-ai-response', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            });
            if (!response.ok) throw new Error('Network error.');
            const data = await response.json();
            addAIMessage(data.reply, 'bot');
        } catch (error) {
            console.error('AI Response Error:', error);
            addAIMessage("My circuits are tangled. Try again!", 'bot');
        } finally {
            this.isTyping = false;
            typingIndicator.remove();
        }
    }
};

function toggleAI() {
    const aiChat = document.getElementById('aiChat');
    aiChat.classList.toggle('active');
    if (aiChat.classList.contains('active')) {
        setTimeout(() => aiChat.querySelector('.ai-input').focus(), 400);
    }
}

function handleAIInput(event) { 
    if (event.key === 'Enter') sendAIMessage(); 
}

function sendAIMessage() {
    const input = document.querySelector('.ai-input');
    const message = input.value.trim();
    if (!message || advancedAI.isTyping) return;
    addAIMessage(message, 'user');
    input.value = '';
    advancedAI.getAIResponse(message);
}

function addAIMessage(text, type) {
    const messagesContainer = document.getElementById('aiMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${type}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'ai-message bot';
    indicator.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    document.getElementById('aiMessages').appendChild(indicator);
    return indicator;
}