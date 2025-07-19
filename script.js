const BASE_URL = 'https://uzem-chatbot-backend-745649787653.us-central1.run.app';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const rateLimitWarning = document.getElementById("rate-limit-warning");
const countdownSpan = document.getElementById("countdown");

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '') return;

    appendMessage(userText, 'user');
    userInput.value = '';

    const loadingMessage = appendMessage('...', 'bot', true);

    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userText })
        });


        if (response.status === 429) {
            const errData = await response.json();
            updateLastBotMessage(loadingMessage, errData.error || "Çok sık istek gönderildi.");
            showRateLimitCountdown(5);
            return;
        }


            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        updateLastBotMessage(loadingMessage, data.answer || "Bir hata oluştu.");
    } catch (error) {
        console.error('Fetch Error:', error);
        updateLastBotMessage(loadingMessage, "Üzgünüm, bir bağlantı hatası oluştu.");
    }
}

function appendMessage(text, sender, isLoading = false) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('message', sender);

    const p = document.createElement('p');
    if (isLoading) {
        wrapper.classList.add('loading');
        p.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    } else {
        p.textContent = text;
    }

    wrapper.appendChild(p);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return wrapper;
}

function updateLastBotMessage(msgEl, newText) {
    if (msgEl && msgEl.classList.contains('loading')) {
        const p = msgEl.querySelector('p');
        p.innerHTML = '';
        p.textContent = newText;
        msgEl.classList.remove('loading');
    }
}

function showRateLimitCountdown(seconds = 5) {
    rateLimitWarning.style.display = 'block';
    countdownSpan.textContent = seconds;

    let remaining = seconds;
    const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(interval);
            rateLimitWarning.style.display = 'none';
        } else {
            countdownSpan.textContent = remaining;
        }
    }, 1000);
}
