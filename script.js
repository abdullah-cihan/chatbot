const BASE_URL = 'https://uzem-chatbot-backend-745649787653.us-central1.run.app';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const rateLimitWarning = document.getElementById("rate-limit-warning");
const countdownSpan = document.getElementById("countdown");
const remainingInfo = document.getElementById("remaining-info");

sendButton.addEventListener('click', () => sendMessage());
userInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});



function appendMessage(text, sender, isLoading = false, logId = null) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('message', sender);
    wrapper.dataset.prompt = text;  // prompt saklanıyor
    if (logId) wrapper.dataset.logId = logId;  // log_id saklanıyor

    const p = document.createElement('p');
    if (isLoading) {
        wrapper.classList.add('loading');
        p.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    } else {
        p.textContent = text;
    }

    wrapper.appendChild(p);

    if (sender === 'user' && !isLoading) {
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = '✏️';
        editBtn.onclick = () => enableEdit(wrapper);
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

function enableEdit(userDiv) {
    const p = userDiv.querySelector("p");
    const oldText = userDiv.dataset.prompt || p.textContent;
    const logId = userDiv.dataset.logId || null;
    const editBtn = userDiv.querySelector(".edit-btn");

    const input = document.createElement("input");
    input.type = "text";
    input.value = oldText;
    input.className = "edit-input";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Kaydet";
    saveBtn.className = "save-btn";

    saveBtn.onclick = () => {
        const newText = input.value.trim();

        // Eğer değişiklik yapıldıysa güncelle
        if (newText && newText !== oldText) {
            p.textContent = newText;
            userDiv.dataset.prompt = newText;
            editBtn.style.display = "inline";

            // input ve butonları temizle
            userDiv.removeChild(input);
            userDiv.removeChild(saveBtn);

            // Bot cevabını yeniden üretmek için mevcut bot mesajı alınır
            const botMsgEl = userDiv.nextElementSibling;
            sendMessage(newText, userDiv, botMsgEl, logId);
        } else {
            // Eski haline döndür
            userDiv.removeChild(input);
            userDiv.removeChild(saveBtn);
            p.textContent = oldText;
            editBtn.style.display = "inline";
        }
    };

    // Mevcut yazıyı temizle ve düzenleme alanını göster
    p.textContent = "";
    editBtn.style.display = "none";
    userDiv.appendChild(input);
    userDiv.appendChild(saveBtn);
    input.focus();
}

