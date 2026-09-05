const CONFIG = {
    email: 'sheygo.contact.pro@gmail.com',
    discordUsername: 'sheygo',

    // ⚠️ Remplacez par votre véritable ID Discord (17-19 chiffres).
    // Clic droit sur votre profil dans Discord → "Copier l'identifiant utilisateur"
    // (le mode développeur doit être activé : Paramètres > Avancés > Mode développeur)
    discordId: '941428422482227240',

    // Intervalle de rafraîchissement de la présence Discord (en ms)
    presenceRefreshInterval: 20000
};


document.addEventListener('DOMContentLoaded', function () {
    initializeLinkCards();
    initializeContactModal();
    initializeDiscordPresence();
});


// =========================================================
// LIENS
// =========================================================

function initializeLinkCards() {

    const linkCards = document.querySelectorAll('.link-card');

    linkCards.forEach(card => {

        card.addEventListener('click', function (e) {

            e.preventDefault();

            this.style.transform = 'translateY(1px) scale(0.98)';

            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            handleLinkClick(this.getAttribute('data-link'), this);
        });
    });
}


function handleLinkClick(linkType, element) {

    switch (linkType) {

        case 'valorant-api':
        case 'guns':
        case 'name-mc':{

            const url = element.getAttribute('data-url');

            if (url) {
                window.open(url, '_blank', 'noopener');
            }

            break;
        }

        case 'discord': {

            const username = element.getAttribute('data-username') || CONFIG.discordUsername;

            copyToClipboard(username);
            showNotification(`Discord username "${username}" copied to clipboard!`, 'discord');

            break;
        }

        case 'contact':

            openContactModal();

            break;

        default:

            console.log('Unknown link type:', linkType);
    }
}


// =========================================================
// CLIPBOARD
// =========================================================

function copyToClipboard(text) {

    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

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


// =========================================================
// NOTIFICATIONS
// =========================================================

function showNotification(message, type = 'default') {

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    let icon = 'fas fa-check-circle';
    let bgColor = 'rgba(139, 92, 246, 0.92)';

    if (type === 'discord') {
        icon = 'fab fa-discord';
        bgColor = 'rgba(88, 101, 242, 0.92)';
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
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        z-index: 2500;
        animation: slideInRight 0.3s ease-out;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.style.animation = 'slideOutRight 0.3s ease-out';

        setTimeout(() => {
            notification.remove();
        }, 300);

    }, 3500);
}


// =========================================================
// MODAL CONTACT
// =========================================================

function initializeContactModal() {

    const modal = document.getElementById('contact-modal');
    const closeBtn = document.getElementById('close-modal');
    const emailText = document.getElementById('email-text');
    const gmailBtn = document.getElementById('open-gmail');
    const outlookBtn = document.getElementById('open-outlook');

    emailText.textContent = CONFIG.email;

    closeBtn.addEventListener('click', closeContactModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeContactModal();
        }
    });

    document.addEventListener('keydown', (e) => {
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

    if (type === 'gmail') {
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
    } else if (type === 'outlook') {
        url = `https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${subject}&body=${body}`;
    }

    if (url) {

        window.open(url, '_blank', 'noopener');

        setTimeout(() => {
            closeContactModal();
        }, 400);
    }
}


// =========================================================
// PRÉSENCE DISCORD (via Lanyard)
//
// ⚠️ IMPORTANT : Lanyard ne peut suivre QUE les comptes membres
// de son propre serveur Discord (il utilise ce serveur pour
// écouter les événements de présence). Sans ça, l'API renvoie
// success:false / "user not found", même si l'ID est correct.
//
// -> Rejoins https://discord.gg/lanyard (lien officiel du repo
//    github.com/Phineas/lanyard) avec le compte 941428422482227240,
//    sinon rien ne pourra jamais s'afficher.
// =========================================================

function initializeDiscordPresence() {

    if (!CONFIG.discordId || CONFIG.discordId === 'YOUR_DISCORD_ID_HERE') {

        setPresenceText('Discord ID not configured');
        return;
    }

    fetchDiscordPresence();

    setInterval(fetchDiscordPresence, CONFIG.presenceRefreshInterval);
}


async function fetchDiscordPresence() {

    try {

        const response = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.discordId}`);

        if (!response.ok) {
            throw new Error(`http_${response.status}`);
        }

        const payload = await response.json();

        if (!payload.success || !payload.data) {

            // Cas le plus fréquent : le compte n'est pas membre
            // du serveur Discord de Lanyard (voir note ci-dessus).
            setPresenceText('Join the Lanyard Discord server to enable this');
            return;
        }

        applyDiscordPresence(payload.data);

    } catch (err) {

        console.error('Lanyard fetch failed:', err);
        setPresenceText('Presence unavailable');
    }
}


function applyDiscordPresence(data) {

    // --- Avatar ---
    // On utilise le raccourci officiel Lanyard (https://api.lanyard.rest/<id>.png),
    // qui sert directement l'avatar Discord sans qu'on ait à reconstruire
    // l'URL nous-mêmes (et il gère aussi le cas "pas d'avatar" tout seul).
    const avatarImg = document.getElementById('profile-pic');
    avatarImg.src = `https://api.lanyard.rest/${CONFIG.discordId}.png`;

    // --- Statut (en ligne / inactif / ne pas déranger / hors ligne) ---

    const statusDot = document.getElementById('status-dot');
    const status = data.discord_status || 'offline';

    statusDot.className = 'status-dot ' + status;

    // --- Activité en cours ---

    setPresenceText(buildPresenceText(data));
}


function buildPresenceText(data) {

    const status = data.discord_status || 'offline';

    if (data.listening_to_spotify && data.spotify) {

        return `Listening to ${data.spotify.song} — ${data.spotify.artist}`;
    }

    const activity = (data.activities || []).find(a => a.type !== 4);

    if (activity) {

        const typeLabels = {
            0: 'Playing',
            1: 'Streaming',
            2: 'Listening to',
            3: 'Watching',
            5: 'Competing in'
        };

        const label = typeLabels[activity.type] || 'Playing';
        let text = `${label} ${activity.name}`;

        if (activity.details) {
            text += ` — ${activity.details}`;
        }

        return text;
    }

    const customStatus = (data.activities || []).find(a => a.type === 4);

    if (customStatus && customStatus.state) {
        return customStatus.state;
    }

    const statusLabels = {
        online: 'Online',
        idle: 'Idle',
        dnd: 'Do Not Disturb',
        offline: 'Offline'
    };

    return statusLabels[status] || 'Offline';
}


function setPresenceText(text) {

    const chip = document.getElementById('presence-chip');
    const textEl = document.getElementById('presence-text');
    const icon = chip.querySelector('i');

    icon.className = 'fas fa-circle';
    textEl.textContent = text;
}
