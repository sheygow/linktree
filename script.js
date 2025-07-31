const CONFIG = {
    email: 'sheygo.contact.pro@gmail.com',
    discordUsername: 'sheygo'
};

document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeLinkCards();
    initializeContactModal();
    initializeNetworkBackground();
});

function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, {
        threshold: 0.1
    });

    const linkCards = document.querySelectorAll('.link-card');
    linkCards.forEach(card => {
        observer.observe(card);
    });
}

function initializeLinkCards() {
    const linkCards = document.querySelectorAll('.link-card');
    
    linkCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            this.style.transform = 'translateY(2px) scale(0.98)';
            
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            const linkType = this.getAttribute('data-link');
            
            handleLinkClick(linkType, this);
            
            createClickEffect(e);
        });
        
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.link-icon');
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.link-icon');
            icon.style.transform = '';
        });
    });
}

function handleLinkClick(linkType, element) {
    switch(linkType) {
        case 'portfolio':
        case 'github':
        case 'services':
            const url = element.getAttribute('data-url');
            if (url) {
                window.open(url, '_blank');
            }
            break;
            
        case 'discord':
            const username = element.getAttribute('data-username') || CONFIG.discordUsername;
            copyToClipboard(username);
            showNotification(`Discord username "${username}" copied to clipboard!`, 'discord');
            break;
            
        case 'contact':
            openContactModal();
            break;
            
        default:
            console.log('Unknown link type:', linkType);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            textArea.remove();
            return Promise.resolve();
        } catch (error) {
            textArea.remove();
            return Promise.reject(error);
        }
    }
}

function showNotification(message, type = 'default') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let icon = 'fas fa-check-circle';
    let bgColor = 'rgba(139, 92, 246, 0.9)';
    
    if (type === 'discord') {
        icon = 'fab fa-discord';
        bgColor = 'rgba(88, 101, 242, 0.9)';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 1500;
        animation: slideInRight 0.3s ease-out;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        max-width: 300px;
    `;
    
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function initializeContactModal() {
    const modal = document.getElementById('contact-modal');
    const closeBtn = document.getElementById('close-modal');
    const emailText = document.getElementById('email-text');
    const gmailBtn = document.getElementById('open-gmail');
    const outlookBtn = document.getElementById('open-outlook');
    
    emailText.textContent = CONFIG.email;
    
    closeBtn.addEventListener('click', closeContactModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeContactModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeContactModal();
        }
    });
    
    gmailBtn.addEventListener('click', () => openEmailClient('gmail'));
    outlookBtn.addEventListener('click', () => openEmailClient('outlook'));
}

function openContactModal() {
    const modal = document.getElementById('contact-modal');
    
    copyToClipboard(CONFIG.email);
    
    modal.classList.add('show');
    
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    const modal = document.getElementById('contact-modal');
    
    modal.classList.remove('show');
    
    document.body.style.overflow = '';
}

function openEmailClient(type) {
    const email = CONFIG.email;
    const subject = encodeURIComponent('Contact from Linktree');
    const body = encodeURIComponent('Hello Sheygo,\n\nI found your linktree and would like to get in touch.\n\nBest regards');
    
    let url;
    
    switch(type) {
        case 'gmail':
            url = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
            break;
        case 'outlook':
            url = `https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${subject}&body=${body}`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank');
        
        setTimeout(() => {
            closeContactModal();
        }, 500);
    }
}

function initializeProfileEffects() {
    const profileImage = document.querySelector('.profile-image img');
    
    profileImage.addEventListener('mouseenter', function() {
        this.style.transform = 'rotate(5deg)';
    });
    
    profileImage.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
}

function createClickEffect(e) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    effect.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: #8B5CF6;
        border-radius: 50%;
        pointer-events: none;
        animation: clickRipple 0.6s ease-out;
        z-index: 10;
    `;
    
    if (!document.querySelector('#click-effect-styles')) {
        const styles = document.createElement('style');
        styles.id = 'click-effect-styles';
        styles.textContent = `
            @keyframes clickRipple {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                100% {
                    transform: scale(20);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    e.currentTarget.appendChild(effect);
    
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 600);
}

function initializeNetworkBackground() {
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    
    let nodes = [];
    let mouse = { x: null, y: null };
    let animationId;
    
    const config = {
        nodeCount: 120,
        maxDistance: 200,
        nodeRadius: 2,
        nodeSpeed: 0.5,
        mouseInfluence: 100,
        mousePushStrength: 30,
        colors: {
            node: 'rgba(139, 92, 246, 0.6)',
            line: 'rgba(139, 92, 246, 0.2)',
            mouseInfluence: 'rgba(168, 85, 247, 0.4)'
        }
    };
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function createNodes() {
        nodes = [];
        for (let i = 0; i < config.nodeCount; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * config.nodeSpeed,
                vy: (Math.random() - 0.5) * config.nodeSpeed,
                originalVx: (Math.random() - 0.5) * config.nodeSpeed,
                originalVy: (Math.random() - 0.5) * config.nodeSpeed
            });
        }
    }
    
    function distance(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }
    
    function updateNodes() {
        nodes.forEach(node => {
            if (mouse.x !== null && mouse.y !== null) {
                const mouseDistance = distance(node, mouse);
                if (mouseDistance < config.mouseInfluence) {
                    const force = (config.mouseInfluence - mouseDistance) / config.mouseInfluence;
                    const angle = Math.atan2(node.y - mouse.y, node.x - mouse.x);
                    
                    node.vx = node.originalVx + Math.cos(angle) * force * config.mousePushStrength;
                    node.vy = node.originalVy + Math.sin(angle) * force * config.mousePushStrength;
                } else {
                    node.vx += (node.originalVx - node.vx) * 0.02;
                    node.vy += (node.originalVy - node.vy) * 0.02;
                }
            }
            
            node.x += node.vx;
            node.y += node.vy;
            
            if (node.x < 0 || node.x > canvas.width) {
                node.vx *= -1;
                node.originalVx *= -1;
            }
            if (node.y < 0 || node.y > canvas.height) {
                node.vy *= -1;
                node.originalVy *= -1;
            }
            
            node.x = Math.max(0, Math.min(canvas.width, node.x));
            node.y = Math.max(0, Math.min(canvas.height, node.y));
        });
    }
    
    function drawConnections() {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = distance(nodes[i], nodes[j]);
                
                if (dist < config.maxDistance) {
                    const opacity = (config.maxDistance - dist) / config.maxDistance;
                    
                    ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    function drawNodes() {
        nodes.forEach(node => {
            ctx.fillStyle = config.colors.node;
            ctx.beginPath();
            ctx.arc(node.x, node.y, config.nodeRadius, 0, Math.PI * 2);
            ctx.fill();
            
            if (mouse.x !== null && mouse.y !== null) {
                const mouseDistance = distance(node, mouse);
                if (mouseDistance < config.mouseInfluence) {
                    const intensity = (config.mouseInfluence - mouseDistance) / config.mouseInfluence;
                    ctx.fillStyle = `rgba(168, 85, 247, ${intensity * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, config.nodeRadius + intensity * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        updateNodes();
        drawConnections();
        drawNodes();
        
        animationId = requestAnimationFrame(animate);
    }
    
    function handleMouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }
    
    function handleMouseLeave() {
        mouse.x = null;
        mouse.y = null;
    }
    
    function handleResize() {
        resizeCanvas();
        createNodes();
    }
    
    resizeCanvas();
    createNodes();
    animate();
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    
    return () => {
        cancelAnimationFrame(animationId);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('resize', handleResize);
    };
}
