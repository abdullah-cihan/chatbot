// === Ayarlar ===
const BASE_URL = 'https://uzem-chatbot-backend-745649787653.us-central1.run.app';

// === Elementler ===
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const feedbackContainer = document.getElementById("feedback-container");
const feedbackStatus = document.getElementById("feedback-status");

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
    hideFeedbackButtons(); // Yeni mesaj gelince önceki geri bildirim butonlarını gizle

    const loadingMessage = appendMessage('...', 'bot', true);

    try {
        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userText })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 429) {
                updateLastBotMessage(loadingMessage, data.error || "Çok sık istek gönderildi. Lütfen biraz bekleyin.");
            } else {
                updateLastBotMessage(loadingMessage, data.error || "Bir hata oluştu.");
            }
            return;
        }

        updateLastBotMessage(loadingMessage, data.answer || "Bir hata oluştu.");
        currentLogId = data.log_id || null;
        showFeedbackButtons();

    } catch (error) {
        console.error('Fetch Error:', error);
        updateLastBotMessage(loadingMessage, "Üzgünüm, bir bağlantı hatası oluştu.");
    }
}


// === Mesaj Ekleme ===
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

// === Bot Mesajını Güncelle ===
function updateLastBotMessage(msgEl, newText) {
    if (msgEl && msgEl.classList.contains('loading')) {
        const p = msgEl.querySelector('p');
        p.innerHTML = '';
        p.textContent = newText;
        msgEl.classList.remove('loading');
    }
}

// === Feedback Gönder ===
function sendFeedback(type) {
    if (!currentLogId) return;

    fetch(BASE_URL + '/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: currentLogId, feedback: type })
    })
    .then(res => res.json())
    .then(() => {
        feedbackStatus.innerText = "Teşekkürler!";
        hideFeedbackButtons();
    })
    .catch(err => {
        console.error("Geri bildirim hatası:", err);
        feedbackStatus.innerText = "Gönderilemedi.";
    });
}

// === Geri Bildirim UI ===
function showFeedbackButtons() {
    feedbackContainer.style.display = "block";
    feedbackStatus.innerText = "";
}

function hideFeedbackButtons() {
    feedbackContainer.style.display = "none";
    feedbackStatus.innerText = "";
}
