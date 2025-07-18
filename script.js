const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

const BASE_URL = window.BACKEND_URL;
let currentLogId = null;

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '') return;

    appendMessage(userText, 'user');
    userInput.value = '';
    hideFeedbackButtons(); // Yeni mesajda önceki geri bildirim gizlenir

    const loadingMessage = appendMessage('...', 'bot', true);

    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userText })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        updateLastBotMessage(loadingMessage, data.answer || "Cevap alınamadı.");
        currentLogId = data.log_id || null;

        if (currentLogId) showFeedbackButtons();

    } catch (err) {
        console.error('Hata:', err);
        updateLastBotMessage(loadingMessage, "Bir hata oluştu, lütfen tekrar deneyin.");
    }
}

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

function updateLastBotMessage(messageElement, newText) {
    if (messageElement && messageElement.classList.contains('loading')) {
        const p = messageElement.querySelector('p');
        p.innerHTML = '';
        p.textContent = newText;
        messageElement.classList.remove('loading');
    }
}

function sendFeedback(type) {
    if (!currentLogId) return;

    fetch(BASE_URL + '/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            log_id: currentLogId,
            feedback: type
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Feedback gönderilemedi.");
        return res.json();
    })
    .then(() => {
        const statusEl = document.getElementById("feedback-status");
        statusEl.innerText = "Teşekkürler!";
        statusEl.style.display = "inline";
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
