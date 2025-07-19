// === Ayarlar ===
const BASE_URL = 'https://uzem-chatbot-backend-745649787653.us-central1.run.app';

// === Elementler ===
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const rateLimitWarning = document.getElementById("rate-limit-warning");
const countdownSpan = document.getElementById("countdown");

let currentLogId = null;

// === Event Dinleyiciler ===
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// === Mesaj Gönderme Fonksiyonu ===
async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '') return;

    appendMessage(userText, 'user');
    userInput.value = '';
    clearFeedbackUI(); // feedback alanını sıfırla

    const loadingMessage = appendMessage('...', 'bot', true);

    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userText })
        });

        if (!response.ok) {
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
        currentLogId = data.log_id || null;
        if (currentLogId) renderFeedbackButtons(currentLogId);
    } catch (error) {
        console.error('Fetch Error:', error);
        updateLastBotMessage(loadingMessage, "Üzgünüm, bir bağlantı hatası oluştu.");
    }
}

// === Mesaj Ekleme ===
function appendMessage(text, sender, isLoading = false) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('messag
