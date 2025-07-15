// Elementleri seç
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Cloud Function'ınızın URL'si
const CLOUD_FUNCTION_URL = 'https://uzem-chatbot-backend-745649787653.us-central1.run.app';

// Olay dinleyicileri
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Mesaj gönderme fonksiyonu
async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '') return;

    // Kullanıcının mesajını ekrana ekle
    appendMessage(userText, 'user');
    userInput.value = '';

    // Botun "yazıyor..." animasyonunu göster
    const loadingMessage = appendMessage('...', 'bot', true);

    try {
        // Cloud Function'a istek gönder
        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: userText
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // "yazıyor..." animasyonunu gerçek cevapla güncelle
        updateLastBotMessage(loadingMessage, data.answer || "Bir hata oluştu.");

    } catch (error) {
        console.error('Fetch Error:', error);
        updateLastBotMessage(loadingMessage, "Üzgünüm, bir bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    }
}

// Mesajları ekrana ekleyen yardımcı fonksiyon
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

    // Otomatik olarak en alta kaydır
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageWrapper; // Güncelleme için mesaj elementini geri döndür
}

// Son bot mesajını (yükleniyor animasyonunu) güncelleyen fonksiyon
function updateLastBotMessage(messageElement, newText) {
    if (messageElement && messageElement.classList.contains('loading')) {
        const p = messageElement.querySelector('p');
        p.innerHTML = ''; // "..." noktalarını temizle
        p.textContent = newText;
        messageElement.classList.remove('loading');
    }
}