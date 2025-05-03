// User Agent Detection and Display
function displayUserAgent() {
    const userAgent = navigator.userAgent;
    const displayElement = document.getElementById('userAgentDisplay');
    
    // Shorten the user agent string for display
    const shortenedAgent = userAgent.length > 60 
        ? userAgent.substring(0, 60) + '...' 
        : userAgent;
    
    displayElement.textContent = `Perangkat: ${shortenedAgent}`;
    displayElement.title = userAgent; // Show full string on hover
    
    // Add copy functionality
    document.getElementById('copyAgentBtn').addEventListener('click', function() {
        navigator.clipboard.writeText(userAgent).then(() => {
            const originalIcon = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.innerHTML = originalIcon;
            }, 2000);
        });
    });
    
    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    if (isMobile) {
        displayElement.textContent += ' 📱';
    } else {
        displayElement.textContent += ' 💻';
    }
}

// Call the function when DOM is loaded
document.addEventListener('DOMContentLoaded', displayUserAgent);