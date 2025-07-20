const BASE_URL = 'https://uzem-chatbot-backend-745649787653.us-central1.run.app';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const rateLimitWarning = document.getElementById("rate-limit-warning");
const countdownSpan = document.getElementById("countdown");
const remainingInfo = document.getElementById("remaining-info");

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage(inputText = null) {
    const userText = inputText || userInput.value.trim();
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

        const data = await response.json();

        if (typeof data.remaining !== "undefined") {
            updateRemainingInfo(data.remaining);
        }

        if (!response.ok) {
            const errorMsg = data.error || "Çok sık istek gönderildi.";

            if (data.remaining === 0) {
                updateLastBotMessage(loadingMessage, "🛑 Günlük sorgu hakkınızı doldurdunuz. Lütfen yarın tekrar deneyiniz.");
            } else {
                updateLastBotMessage(loadingMessage, errorMsg);
                showRateLimitCountdown(5);
            }
            return;
        }

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

    // Düzenleme düğmesi sadece kullanıcı mesajlarında görünür
    if (sender === 'user' && !isLoading) {
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = '✏️';
        editBtn.onclick = () => enableEdit(wrapper, text);
        wrapper.appendChild(editBtn);
    }

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

function updateRemainingInfo(count) {
    remainingInfo.style.display = 'block';
    remainingInfo.textContent = `Kalan sorgu hakkınız: ${count}`;

    if (count <= 5) {
        remainingInfo.style.color = 'red';
        remainingInfo.style.fontWeight = 'bold';
    } else {
        remainingInfo.style.color = '#333';
        remainingInfo.style.fontWeight = 'normal';
    }
}

// Kullanıcı mesajını düzenleme işlemi
function enableEdit(messageDiv, oldText) {
    const p = messageDiv.querySelector("p");
    const editBtn = messageDiv.querySelector(".edit-btn");

    const input = document.createElement("input");
    input.type = "text";
    input.value = oldText;
    input.className = "edit-input";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Kaydet";
    saveBtn.onclick = () => {
        const newText = input.value.trim();
        if (newText && newText !== oldText) {
            p.textContent = newText;
            messageDiv.removeChild(input);
            messageDiv.removeChild(saveBtn);
            editBtn.style.display = "inline";
            userInput.value = newText;
            sendMessage(newText);
        } else {
            p.textContent = oldText;
            messageDiv.removeChild(input);
            messageDiv.removeChild(saveBtn);
            editBtn.style.display = "inline";
        }
    };

    // Düzenleme moduna geç
    p.textContent = "";
    editBtn.style.display = "none";
    messageDiv.appendChild(input);
    messageDiv.appendChild(saveBtn);
    input.focus();
}
