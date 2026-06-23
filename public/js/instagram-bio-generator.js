// Dynamic font generator helper function
const fonts = (() => {
    const bold = {};
    for (let i = 0; i < 26; i++) {
        bold[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D41A + i);
        bold[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D400 + i);
    }
    
    const italic = {};
    for (let i = 0; i < 26; i++) {
        const char = String.fromCharCode(97 + i);
        italic[char] = char === 'h' ? 'ℎ' : String.fromCodePoint(0x1D44E + i);
        italic[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D434 + i);
    }
    
    const script = {};
    for (let i = 0; i < 26; i++) {
        script[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D4EA + i);
        script[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D4D0 + i);
    }
    
    return { bold, italic, script };
})();

const templates = [
    "✨ [Name] | [Title]\n📍 [Location]\n💻 [What you do]\n📩 DM for collabs",
    "🎨 Creative Soul\n☕ Coffee Addict\n📸 Capturing moments\n👇 Check my work",
    "🚀 Entrepreneur | CEO\n🛠️ Building the future\n📈 Growth mindset\n🔗 Link below",
    "✨ Influencer | Content Creator\n🌸 Spreading positivity\n📩 Collabs: [email]\n🎥 New video",
    "🎓 Student | Dreamer\n🌱 Learning & Growing\n✈️ Travel enthusiast\n👋 Say hi!",
    "💪 Fitness Coach\n🥗 Transform your body\n🏃‍♂️ Nutrition tips\n📥 DM for programs",
    "📷 Photographer\n🌅 Chasing golden hours\n✈️ Travel & Adventure\n📅 Bookings open",
    "🎵 Music Lover\n🎸 Guitar & Vocals\n🎤 Live performances\n🎧 Listen below",
    "🥞 Food Blogger\n👩‍🍳 Recipe creator\n📍 [City] eats\n👇 Latest review",
    "💻 Developer | Tech\n🛠️ Building cool stuff\n🐍 Python | JS\n🔗 Portfolio"
];

const emojis = [
    '✨', '⭐', '🌟', '💫', '🔥', '💥', '💯', '❤️', '💖', '💙', '💜', '🖤', '🤍', '👑', '💎',
    '🎨', '🎭', '🎬', '🎤', '🎧', '🎸', '🎹', '🎵', '🎶', '📷', '📸', '📹', '🎥', '💻', '⌨️',
    '🚀', '🛸', '🛰️', '✈️', '🌍', '🌎', '🗺️', '📍', '🧭', '🏁', '🏆', '🏅', '🥇', '🥈',
    '💪', '🏃‍♂️', '🏃‍♀️', '🚴‍♂️', '🚴‍♀️', '🧘‍♂️', '🧘‍♀️', '🏋️‍♂️', '🏋️‍♀️', '⚽', '🏀', '🏈', '🎾', '🎮', '👾',
    '💼', '📅', '📈', '📉', '📊', '📋', '📌', '🔍', '💡', '🔑', '🔓', '🛡️', '⚙️', '🛠️', '✉️',
    '📩', '📤', '📥', '📣', '🔔', '💬', '💭', '🎓', '📚', '🖋️', '✏️', '🍕', '🥞',
    '🍔', '🍟', '🍣', '🍰', '🍩', '🍪', '☕', '🍵', '🍺', '🍷', '🥂', '🥃', '🥤', '🥥', '🍇',
    '🌸', '🌹', '🌺', '🌻', '🌱', '🌿', '☘️', '🍀', '🍂', '🍁', '🍄', '🐾', '🐶', '🐱', '🦄'
];

function convertFont(text, style) {
    return text.split('').map(c => fonts[style] && fonts[style][c] || c).join('');
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    ['editorTab', 'templatesTab', 'fontsTab', 'emojisTab'].forEach(t => document.getElementById(t).style.display = 'none');
    document.getElementById(tab + 'Tab').style.display = 'block';
    if (tab === 'templates') loadTemplates();
    if (tab === 'fonts') loadFonts();
    if (tab === 'emojis') loadEmojis();
}

function updatePreview() {
    const text = document.getElementById('bioText').value;
    document.getElementById('preview').textContent = text || 'Your bio preview will appear here...';
    const len = text.length;
    const count = document.getElementById('charCount');
    count.textContent = `${len} / 150 characters`;
    count.className = 'char-count' + (len > 150 ? ' error' : len > 130 ? ' warning' : '');
}

function copyBio() {
    const text = document.getElementById('bioText').value;
    if (!text) {
        showToast('Please write a bio first', true);
        return;
    }
    navigator.clipboard.writeText(text).then(() => showToast('Bio copied to clipboard!'));
}

function clearBio() {
    document.getElementById('bioText').value = '';
    updatePreview();
    showToast('Cleared');
}

function addLineBreak() {
    const textarea = document.getElementById('bioText');
    const pos = textarea.selectionStart;
    const text = textarea.value;
    textarea.value = text.substring(0, pos) + '\n' + text.substring(pos);
    textarea.selectionStart = textarea.selectionEnd = pos + 1;
    textarea.focus();
    updatePreview();
}

function loadTemplates() {
    document.getElementById('templateList').innerHTML = templates.map((t, i) => `<div class="template-card" onclick="useTemplate(${i})"><pre style="margin:0;white-space:pre-wrap;font-family:inherit">${t}</pre></div>`).join('');
}

function useTemplate(i) {
    document.getElementById('bioText').value = templates[i];
    updatePreview();
    switchTab('editor');
    showToast('Template loaded!');
}

function loadFonts() {
    const input = document.getElementById('fontInput');
    input.oninput = () => {
        const text = input.value || 'Sample Text';
        document.getElementById('fontGrid').innerHTML = ['bold', 'italic', 'script'].map(style => `<div class="font-btn" onclick="insertFont('${style}')"><div style="margin-bottom:5px;font-weight:600;color:var(--primary)">${style}</div><div>${convertFont(text, style)}</div></div>`).join('');
    };
    input.oninput();
}

function insertFont(style) {
    const text = document.getElementById('fontInput').value;
    if (!text) {
        showToast('Type text first', true);
        return;
    }
    const converted = convertFont(text, style);
    document.getElementById('bioText').value += converted;
    updatePreview();
    showToast('Font added!');
}

function loadEmojis() {
    document.getElementById('emojiGrid').innerHTML = emojis.map(e => `<div class="emoji-btn" onclick="insertEmoji('${e}')">${e}</div>`).join('');
}

function insertEmoji(emoji) {
    document.getElementById('bioText').value += emoji;
    updatePreview();
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toastMessage');
    msg.textContent = message;
    toast.className = 'toast show' + (isError ? ' error' : '');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Initialize
requestIdleCallback(() => {
    updatePreview();
}, { timeout: 2000 });