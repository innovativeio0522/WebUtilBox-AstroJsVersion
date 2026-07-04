// Temp Mail client-side logic using Mail.tm API
const API_URL = 'https://api.mail.tm';
let currentEmail = '';
let currentPassword = '';
let currentToken = '';
let currentAccountId = '';
let pollIntervalId = null;
let activeMessageId = null;

// DOM Elements
let emailAddressInput;
let btnCopyEmail;
let btnRefreshInbox;
let btnNewEmail;
let refreshSpinner;
let statusIndicator;
let statusText;
let messageList;
let readerBody;
let unreadBadge;

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM Elements
    emailAddressInput = document.getElementById('tempEmailAddress');
    btnCopyEmail = document.getElementById('btnCopyEmail');
    btnRefreshInbox = document.getElementById('btnRefreshInbox');
    btnNewEmail = document.getElementById('btnNewEmail');
    refreshSpinner = document.getElementById('refreshSpinner');
    statusIndicator = document.getElementById('statusIndicator');
    statusText = document.getElementById('statusText');
    messageList = document.getElementById('messageList');
    readerBody = document.getElementById('readerBody');
    unreadBadge = document.getElementById('unreadBadge');

    // Event Listeners
    btnCopyEmail.addEventListener('click', copyToClipboard);
    btnRefreshInbox.addEventListener('click', () => refreshInbox(true));
    btnNewEmail.addEventListener('click', generateNewEmail);

    // Initial setup
    loadSession();
});

// Load active session from localStorage or generate new
async function loadSession() {
    currentEmail = localStorage.getItem('temp_mail_address');
    currentPassword = localStorage.getItem('temp_mail_password');
    currentToken = localStorage.getItem('temp_mail_token');
    currentAccountId = localStorage.getItem('temp_mail_account_id');

    if (currentEmail && currentPassword && currentToken && currentAccountId) {
        emailAddressInput.value = currentEmail;
        updateStatus('loading', 'Logging in...');
        
        // Verify credentials by fetching inbox
        const success = await refreshInbox(false);
        if (success) {
            updateStatus('active', 'Connected. Waiting for emails...');
            startPolling();
        } else {
            // If token expired or account was deleted from server
            updateStatus('loading', 'Active session expired. Creating a new inbox...');
            generateNewEmail();
        }
    } else {
        generateNewEmail();
    }
}

// Generate new temporary email account
async function generateNewEmail() {
    stopPolling();
    activeMessageId = null;
    emailAddressInput.value = 'Generating email...';
    updateStatus('loading', 'Fetching available domains...');
    resetInboxUI();

    try {
        // 1. Fetch domain list
        const domainsResponse = await fetch(`${API_URL}/domains`);
        if (!domainsResponse.ok) throw new Error('Failed to fetch email domains.');
        const domainsData = await domainsResponse.json();
        
        const domainsList = domainsData['hydra:member'] || domainsData;
        if (!domainsList || domainsList.length === 0) throw new Error('No temporary domains available.');
        
        const selectedDomain = domainsList[0].domain;

        // 2. Generate random address prefix & password
        const prefix = Math.random().toString(36).substring(2, 10);
        const password = Math.random().toString(36).substring(2, 15) + 'A1!';
        const address = `${prefix}@${selectedDomain}`;

        updateStatus('loading', 'Creating temporary account...');

        // 3. Create the account on Mail.tm
        const createResponse = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        if (!createResponse.ok) {
            const errData = await createResponse.json();
            throw new Error(errData.detail || 'Failed to create email account.');
        }
        const accountData = await createResponse.json();
        const accountId = accountData.id;

        updateStatus('loading', 'Authenticating...');

        // 4. Get the JWT access token
        const tokenResponse = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        if (!tokenResponse.ok) throw new Error('Authentication failed.');
        const tokenData = await tokenResponse.json();
        const token = tokenData.token;

        // 5. Store session locally
        currentEmail = address;
        currentPassword = password;
        currentToken = token;
        currentAccountId = accountId;

        localStorage.setItem('temp_mail_address', address);
        localStorage.setItem('temp_mail_password', password);
        localStorage.setItem('temp_mail_token', token);
        localStorage.setItem('temp_mail_account_id', accountId);

        emailAddressInput.value = address;
        updateStatus('active', 'Connected. Waiting for emails...');
        
        startPolling();
    } catch (e) {
        console.error(e);
        emailAddressInput.value = 'Generation failed';
        updateStatus('error', `Error: ${e.message}`);
    }
}

// Refresh Inbox (returns boolean success)
async function refreshInbox(showVisualFeedback = false) {
    if (!currentToken) return false;
    
    if (showVisualFeedback) {
        refreshSpinner.classList.add('spinning');
        updateStatus('loading', 'Checking for new messages...');
    }

    try {
        const response = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (response.status === 401) {
            // Token expired - try logging in again with stored credentials
            const loginSuccess = await reAuthenticate();
            if (loginSuccess) {
                return refreshInbox(showVisualFeedback);
            }
            return false;
        }

        if (!response.ok) throw new Error('Failed to retrieve messages');

        const messagesData = await response.json();
        const messages = messagesData['hydra:member'] || messagesData;

        renderMessageList(messages);
        
        if (showVisualFeedback) {
            setTimeout(() => {
                refreshSpinner.classList.remove('spinning');
                updateStatus('active', `Inbox updated. Last checked at ${getCurrentTime()}`);
            }, 500);
        } else {
            updateStatus('active', `Connected. Last checked at ${getCurrentTime()}`);
        }

        return true;
    } catch (e) {
        console.error(e);
        if (showVisualFeedback) {
            refreshSpinner.classList.remove('spinning');
            updateStatus('error', `Refresh failed: ${e.message}`);
        }
        return false;
    }
}

// Attempt to re-authenticate using stored username & password
async function reAuthenticate() {
    if (!currentEmail || !currentPassword) return false;
    try {
        const response = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: currentEmail, password: currentPassword })
        });
        if (!response.ok) return false;
        const data = await response.json();
        currentToken = data.token;
        localStorage.setItem('temp_mail_token', currentToken);
        return true;
    } catch (e) {
        return false;
    }
}

// Polling interval controls
function startPolling() {
    stopPolling();
    // Poll every 10 seconds
    pollIntervalId = setInterval(() => {
        refreshInbox(false);
    }, 10000);
}

function stopPolling() {
    if (pollIntervalId) {
        clearInterval(pollIntervalId);
        pollIntervalId = null;
    }
}

// Update Status Indicator
function updateStatus(type, text) {
    statusIndicator.className = `status-indicator ${type}`;
    statusText.textContent = text;
}

// Helper: Get Current Time string
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Format date into human-readable format
function formatMailDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Copy email address to clipboard
function copyToClipboard() {
    const address = emailAddressInput.value;
    if (!address || address.startsWith('Generating') || address.startsWith('Generation')) return;

    navigator.clipboard.writeText(address).then(() => {
        const origText = btnCopyEmail.textContent;
        btnCopyEmail.textContent = 'Copied!';
        btnCopyEmail.className = 'btn btn-success';
        
        setTimeout(() => {
            btnCopyEmail.textContent = origText;
            btnCopyEmail.className = 'btn btn-primary';
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Reset UI state to empty inbox
function resetInboxUI() {
    messageList.innerHTML = `
        <div class="empty-inbox">
            <span class="empty-icon">📥</span>
            <p>Waiting for incoming emails...</p>
            <p class="empty-subtext">Send an email to the address above and it will show up here automatically within a few seconds.</p>
        </div>
    `;
    readerBody.innerHTML = `
        <div class="no-selection">
            <span class="no-selection-icon">✉️</span>
            <p>Select an email from the inbox list to read it.</p>
        </div>
    `;
    unreadBadge.textContent = '0';
    unreadBadge.style.display = 'none';
}

// Render message cards
function renderMessageList(messages) {
    if (!messages || messages.length === 0) {
        resetInboxUI();
        return;
    }

    messageList.innerHTML = '';
    let unreadCount = 0;

    messages.forEach(msg => {
        if (!msg.seen) unreadCount++;

        const item = document.createElement('div');
        item.className = `message-item ${msg.seen ? '' : 'unread'} ${activeMessageId === msg.id ? 'active' : ''}`;
        item.dataset.id = msg.id;

        const dateFormatted = formatMailDate(msg.createdAt);
        const fromDisplayName = msg.from.name || msg.from.address.split('@')[0];
        const initials = getInitials(fromDisplayName);
        const avatarBg = getAvatarColor(fromDisplayName);
        const unreadDot = msg.seen ? '' : '<span class="unread-dot"></span>';

        item.innerHTML = `
            <div class="message-avatar" style="background-color: ${avatarBg}">${escapeHtml(initials)}</div>
            <div class="message-content">
                <div class="message-meta">
                    <span class="message-sender">${escapeHtml(fromDisplayName)}</span>
                    <span class="message-time">${dateFormatted}</span>
                </div>
                <div class="message-subject-row">
                    <span class="message-subject">${escapeHtml(msg.subject || '(No Subject)')}</span>
                    ${unreadDot}
                </div>
            </div>
        `;

        item.addEventListener('click', () => loadEmailDetails(msg.id, item));
        messageList.appendChild(item);
    });

    if (unreadCount > 0) {
        unreadBadge.textContent = unreadCount;
        unreadBadge.style.display = 'inline-block';
    } else {
        unreadBadge.style.display = 'none';
    }
}

// Load detail payload of a single message
async function loadEmailDetails(id, element) {
    // Set active element styling
    document.querySelectorAll('.message-item').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    activeMessageId = id;

    // Show loading state in reader
    readerBody.innerHTML = `
        <div class="no-selection">
            <span class="no-selection-icon spinning" style="font-size: 2.5rem;">🔄</span>
            <p>Loading email contents...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (!response.ok) throw new Error('Failed to load email details');
        const email = await response.json();

        // If message was unread, update read state locally and on server
        if (!email.seen) {
            markAsRead(id);
            if (element) element.classList.remove('unread');
            // update badge count
            const currentBadgeVal = parseInt(unreadBadge.textContent, 10) || 0;
            if (currentBadgeVal > 1) {
                unreadBadge.textContent = currentBadgeVal - 1;
            } else {
                unreadBadge.style.display = 'none';
            }
        }

        renderEmailReader(email);
    } catch (e) {
        console.error(e);
        readerBody.innerHTML = `
            <div class="no-selection" style="color: var(--danger);">
                <span class="no-selection-icon">⚠️</span>
                <p>Failed to load email: ${e.message}</p>
            </div>
        `;
    }
}

// Mark email as read on Mail.tm
function markAsRead(id) {
    fetch(`${API_URL}/messages/${id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/merge-patch+json'
        },
        body: JSON.stringify({ seen: true })
    }).catch(err => console.error('Failed to mark read', err));
}

// Render the details of an email in the viewer
function renderEmailReader(email) {
    const fromName = email.from.name ? `${email.from.name} <${email.from.address}>` : email.from.address;
    const fromDisplayName = email.from.name || email.from.address.split('@')[0];
    const toAddress = email.to.map(t => t.address).join(', ');
    const dateFormatted = new Date(email.createdAt).toLocaleString();
    const initials = getInitials(fromDisplayName);
    const avatarBg = getAvatarColor(fromDisplayName);

    let bodySectionHtml = '';
    if (email.html && email.html.length > 0) {
        // Load into a sandboxed iframe to keep it secure from execution and style leaks
        bodySectionHtml = `
            <div class="email-iframe-container">
                <iframe id="emailContentIframe" class="email-iframe" sandbox="allow-popups allow-popups-to-escape-sandbox"></iframe>
            </div>
        `;
    } else {
        // Fallback for plain text emails
        bodySectionHtml = `
            <div class="email-text-fallback">${escapeHtml(email.text || '(Empty Body)')}</div>
        `;
    }

    // Attachments
    let attachmentsHtml = '';
    if (email.attachments && email.attachments.length > 0) {
        attachmentsHtml = `
            <div class="attachments-container">
                <div class="attachments-title">📎 Attachments (${email.attachments.length})</div>
                <div class="attachments-list">
                    ${email.attachments.map(att => `
                        <button class="attachment-btn" onclick="downloadAttachmentFile('${email.id}', '${att.id}', '${escapeHtmlAttribute(att.filename)}', '${escapeHtmlAttribute(att.contentType)}')">
                            <span>📄</span> ${escapeHtml(att.filename)} (${formatBytes(att.size)})
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    readerBody.innerHTML = `
        <div class="email-details-header">
            <div class="email-details-avatar" style="background-color: ${avatarBg}">${escapeHtml(initials)}</div>
            <div class="email-details-info">
                <h2>${escapeHtml(email.subject || '(No Subject)')}</h2>
                <div class="email-details-meta">
                    <div><strong>From:</strong> ${escapeHtml(fromName)}</div>
                    <div><strong>To:</strong> ${escapeHtml(toAddress)}</div>
                    <div><strong>Date:</strong> ${dateFormatted}</div>
                </div>
            </div>
        </div>
        ${bodySectionHtml}
        ${attachmentsHtml}
    `;

    // If iframe exists, safely inject the HTML content
    if (email.html && email.html.length > 0) {
        const iframe = document.getElementById('emailContentIframe');
        if (iframe) {
            iframe.srcdoc = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                            font-size: 14px;
                            line-height: 1.6;
                            color: #333333;
                            margin: 15px;
                            word-wrap: break-word;
                            background-color: #ffffff;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    ${email.html}
                </body>
                </html>
            `;
        }
    }
}

// Download attachment file (triggered by onclick in attachment button)
// We expose this function globally so inline onClick works
window.downloadAttachmentFile = async function(messageId, attachmentId, filename, contentType) {
    try {
        updateStatus('loading', `Downloading ${filename}...`);
        const response = await fetch(`${API_URL}/messages/${messageId}/attachment/${attachmentId}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (!response.ok) throw new Error('Attachment download failed');
        const blob = await response.blob();
        
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        updateStatus('active', `Downloaded ${filename}`);
    } catch (e) {
        console.error(e);
        updateStatus('error', `Download failed: ${e.message}`);
    }
};

// Utilities
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

function escapeHtmlAttribute(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getInitials(name) {
    if (!name) return '✉️';
    const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(name) {
    const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#10b981', 
        '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
}
