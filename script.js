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
    .then(res => {
        if (!res.ok) throw new Error("Feedback isteği başarısız.");
        return res.json();
    })
    .then(() => {
        // TEŞEKKÜRLER MESAJINI GÖSTER
        const statusEl = document.getElementById("feedback-status");
        statusEl.innerText = "Teşekkürler!";
        statusEl.style.display = "inline";  // emin olmak için göster
        hideFeedbackButtons();              // butonları gizle
    })
    .catch(err => {
        console.error("Geri bildirim hatası:", err);
        document.getElementById("feedback-status").innerText = "Gönderilemedi.";
    });
}
