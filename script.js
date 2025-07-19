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

    let loadingMessage = null;

    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userText })
        });

        if (!response.ok) {
            if (response.status === 429) {
                const errData = await response.json();

                // 🔔 Sayaçlı uyarıyı göster
                showRateLimitCountdown(5);
                return;
            }

            throw new Error(`HTTP error: ${response.status}`);
        }

        // ✅ Sadece başarılıysa loading göster (ve güncelle)
        loadingMessage = appendMessage('...', 'bot', true);

        const data = await response.json();
        updateLastBotMessage(loadingMessage, data.answer || "Yanıt alınamadı.");
    } catch (error) {
        console.error('Fetch Error:', error);

        if (loadingMessage === null) {
            // Hata oluştuysa ve loading hiç yoksa yeni mesaj göster
            loadingMessage = appendMessage('', 'bot');
        }

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
