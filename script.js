const BASE_URL = 'https://uzem-chatbot-backend-745649787653.us-central1.run.app';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const rateLimitWarning = document.getElementById("rate-limit-warning");
const countdownSpan = document.getElementById("countdown");

let currentLogId = null;

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
    clearFeedbackUI();

    let loadingMessage = null;

    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userText })
        });

        if (!response.ok) {
            if (response.status === 429) {
                showRateLimitCountdown(5);
                return; // Bot mesajı yazmasın
            }
            throw new Error(`HTTP error: ${response.status}`);
        }

        // Yalnızca başarılı yanıt sonrası loading mesajı göster
        loadingMessage = appendMessage('...', 'bot', true);

        const data = await response.json();
        updateLastBotMessage(loadingMessage, data.answer || "Bir hata oluştu.");
        currentLogId = data.log_id || null;

        if (currentLogId) renderFeedbackButtons(currentLogId);
    } catch (error) {
        console.error('Fetch Error:', error);

        if (!loadingMessage) {
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

function renderFeedbackButtons(logId) {
    if (localStorage.getItem(`voted_${logId}`)) return;

    const wrapper = document.createElement('div');
    wrapper.id = `feedback-${logId}`;
    wrapper.className = 'feedback-buttons';

    const upBtn = document.createElement('button');
    upBtn.textContent = '👍';
    upBtn.onclick = () => sendFeedback(logId, 'up');

    const downBtn = document.createElement('button');
    downBtn.textContent = '👎';
    downBtn.onclick = () => sendFeedback(logId, 'down');

    wrapper.appendChild(upBtn);
    wrapper.appendChild(downBtn);

    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendFeedback(logId, type) {
    fetch(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, feedback: type }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "ok") {
            const fb = document.getElementById(`feedback-${logId}`);
            if (fb) fb.textContent = "Teşekkürler!";
            localStorage.setItem(`voted_${logId}`, "1");
        } else {
            alert(data.error || "Zaten oy verdiniz.");
        }
    });
}

function clearFeedbackUI() {
    const elems = document.querySelectorAll(".feedback-buttons");
    elems.forEach(el => el.remove());
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
