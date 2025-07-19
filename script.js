let countdownActive = false;

function showRateLimitCountdown(seconds = 5) {
    if (countdownActive) return; // tekrar sayaç başlatma
    countdownActive = true;

    rateLimitWarning.style.display = 'block';
    countdownSpan.textContent = seconds;

    let remaining = seconds;
    const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(interval);
            rateLimitWarning.style.display = 'none';
            countdownActive = false;
        } else {
            countdownSpan.textContent = remaining;
        }
    }, 1000);
}
