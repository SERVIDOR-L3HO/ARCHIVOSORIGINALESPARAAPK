// Chat Global con Firebase - UltraGol
console.log('🚀 Chat Global inicializando...');

class ChatGlobal {
    constructor() {
        this.messagesContainer = document.getElementById('globalChatMessages');
        this.messageInput = document.getElementById('globalChatInput');
        this.sendButton = document.getElementById('globalSendBtn');
        this.currentChannel = 'general';
        this.unsubscribe = null;
        
        this.init();
    }

    init() {
        // Wait for Firebase to be ready
        if (typeof firebase === 'undefined' || !window.db) {
            console.log('⏳ Esperando Firebase...');
            setTimeout(() => this.init(), 1000);
            return;
        }

        console.log('✅ Firebase listo para chat');
        this.setupEventListeners();
        this.loadMessages();
        this.setupAuthObserver();
    }

    setupAuthObserver() {
        if (window.auth) {
            window.auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('👤 Usuario autenticado en chat:', user.displayName);
                    this.enableChat();
                } else {
                    console.log('⚠️ Usuario no autenticado');
                    this.disableChat();
                }
            });
        }
    }

    enableChat() {
        if (this.messageInput) {
            this.messageInput.disabled = false;
            this.messageInput.placeholder = 'Escribe tu mensaje...';
        }
        if (this.sendButton) {
            this.sendButton.disabled = false;
        }
    }

    disableChat() {
        if (this.messageInput) {
            this.messageInput.disabled = true;
            this.messageInput.placeholder = 'Inicia sesión para chatear...';
        }
        if (this.sendButton) {
            this.sendButton.disabled = true;
        }
    }

    setupEventListeners() {
        // Send message on button click
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Send message on Enter key
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Channel selection
        document.querySelectorAll('.room-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const channel = e.currentTarget.dataset.room;
                if (channel) {
                    this.switchChannel(channel);
                }
            });
        });
    }

    switchChannel(channel) {
        this.currentChannel = channel;
        
        // Update active button
        document.querySelectorAll('.room-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-room="${channel}"]`)?.classList.add('active');

        // Reload messages for new channel
        this.loadMessages();
    }

    async loadMessages() {
        if (!window.db) {
            console.error('❌ Firestore no disponible');
            return;
        }

        // Unsubscribe from previous listener
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Listen to messages in real-time
        this.unsubscribe = window.db
            .collection('chats')
            .doc('ligamx')
            .collection(this.currentChannel)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot((snapshot) => {
                const messages = [];
                snapshot.forEach((doc) => {
                    messages.push({ id: doc.id, ...doc.data() });
                });
                
                // Reverse to show oldest first
                messages.reverse();
                this.displayMessages(messages);
            }, (error) => {
                console.error('❌ Error loading messages:', error);
            });
    }

    displayMessages(messages) {
        if (!this.messagesContainer) return;

        this.messagesContainer.innerHTML = '';
        
        messages.forEach(msg => {
            const messageEl = this.createMessageElement(msg);
            this.messagesContainer.appendChild(messageEl);
        });

        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    createMessageElement(msg) {
        const div = document.createElement('div');
        div.className = 'chat-message';
        
        const currentUser = window.auth?.currentUser;
        if (currentUser && msg.userId === currentUser.uid) {
            div.classList.add('own-message');
        }

        const time = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit'
        }) : '';

        div.innerHTML = `
            <div class="message-header">
                <img src="${msg.userPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(msg.userName)}" 
                     alt="${msg.userName}" class="user-avatar">
                <span class="user-name">${msg.userName}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-content">${this.escapeHtml(msg.message)}</div>
        `;

        return div;
    }

    async sendMessage() {
        if (!this.messageInput || !window.auth || !window.db) return;

        const message = this.messageInput.value.trim();
        if (!message) return;

        const user = window.auth.currentUser;
        if (!user) {
            alert('Debes iniciar sesión para enviar mensajes');
            return;
        }

        try {
            await window.db
                .collection('chats')
                .doc('ligamx')
                .collection(this.currentChannel)
                .add({
                    message: message,
                    userName: user.displayName || 'Usuario',
                    userPhoto: user.photoURL || '',
                    userId: user.uid,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

            // Clear input
            this.messageInput.value = '';
            console.log('✅ Mensaje enviado');
        } catch (error) {
            console.error('❌ Error sending message:', error);
            alert('Error al enviar mensaje: ' + error.message);
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize when DOM is ready
let chatInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    chatInstance = new ChatGlobal();
    console.log('💬 Chat Global inicializado');
});

// Global function for send button
window.sendGlobalMessage = function() {
    if (chatInstance) {
        chatInstance.sendMessage();
    }
};
