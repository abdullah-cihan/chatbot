// Elementleri seç
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

const CLOUD_FUNCTION_URL = 'https://uzem-chatbot-backend-745649787653.us-central1.run.app';

let currentLogId = null; // Her mesaj sonrası gelen log ID burada tutulacak

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Mesaj gönderme
async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '') return;

    appendMessage(userText, 'user');
    userInput.value = '';
    hideFeedbackButtons(); // Yeni mesaj gelince önceki geri bildirim butonlarını gizle

    const loadingMessage = appendMessage('...', 'bot', true);

    try {
        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userText })
        });

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();

        updateLastBotMessage(loadingMessage, data.answer || "Bir hata oluştu.");
        currentLogId = data.log_id || null; // Backend log_id döndürmeli
        showFeedbackButtons();

    } catch (error) {
        console.error('Fetch Error:', error);
        updateLastBotMessage(loadingMessage, "Üzgünüm, bağlantı hatası oluştu.");
    }
}

// Mesajları ekrana ekler
function appendMessage(text, sender, isLoading = false) {
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message', sender);

    const messageParagraph = document.createElement('p');
    if (isLoading) {
        messageWrapper.classList.add('loading');
        messageParagraph.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    } else {
        messageParagraph.textContent = text;
    }

    messageWrapper.appendChild(messageParagraph);
    chatMessages.appendChild(messageWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageWrapper;
}

// "..." mesajını gerçek cevapla günceller
function updateLastBotMessage(messageElement, newText) {
    if (messageElement && messageElement.classList.contains('loading')) {
        const p = messageElement.querySelector('p');
        p.innerHTML = '';
        p.textContent = newText;
        messageElement.classList.remove('loading');
    }
}

// Geri bildirim gönderme
function sendFeedback(type) {
    if (!currentLogId) return;

    fetch(CLOUD_FUNCTION_URL + '/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            log_id: currentLogId,
            feedback: type
        })
    })
    .then(res => res.json())
    .then(() => {
        document.getElementById("feedback-status").innerText = "Teşekkürler!";
        hideFeedbackButtons();
    })
    .catch(err => {
        console.error("Geri bildirim hatası:", err);
        document.getElementById("feedback-status").innerText = "Gönderilemedi.";
    });
}

function showFeedbackButtons() {
    document.getElementById("feedback-container").style.display = "block";
    document.getElementById("feedback-status").innerText = "";
}

function hideFeedbackButtons() {
    document.getElementById("feedback-container").style.display = "none";
}
