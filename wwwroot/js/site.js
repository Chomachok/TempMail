class TempMail {
    constructor() {
        this.currentEmail = null;
        this.timerInterval = null;
        this.timeLeft = 600; // 10 минут
        this.emails = [];
        this.stats = {
            created: 0,
            received: 0,
            active: 0
        };
        this.userId = this.getUserId();

        this.initializeEventListeners();
        this.loadFromStorage();
        this.updateDisplay();
    }

    // Генерируем уникальный ID пользователя
    getUserId() {
        let userId = localStorage.getItem('tempmail-user-id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('tempmail-user-id', userId);
        }
        return userId;
    }

    initializeEventListeners() {
        // Кнопки управления
        document.getElementById('generate-btn').addEventListener('click', () => this.generateEmail());
        document.getElementById('copy-btn').addEventListener('click', () => this.copyEmail());
        document.getElementById('refresh-btn').addEventListener('click', () => this.refreshEmails());
        document.getElementById('extend-btn').addEventListener('click', () => this.extendTimer());
        document.getElementById('save-btn').addEventListener('click', () => this.saveEmails());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearHistory());
        document.getElementById('new-email-btn').addEventListener('click', () => this.generateEmail());
        document.getElementById('history-btn').addEventListener('click', () => this.showHistory());
    }

    generateEmail() {
        // Проверяем, есть ли уже активная почта
        if (this.currentEmail && this.timeLeft > 0) {
            this.showNotification('У вас уже есть активный email адрес', 'error');
            return;
        }

        const domains = ['tempmail.com', 'mailtemp.net', 'spam4.me'];
        const randomId = Math.random().toString(36).substring(2, 10);
        const domain = domains[Math.floor(Math.random() * domains.length)];

        this.currentEmail = `${randomId}@${domain}`;
        this.timeLeft = 600;
        this.emails = [];
        this.stats.created++;

        this.startTimer();
        this.updateDisplay();
        this.saveToStorage();

        this.showNotification('Новый email создан!');
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.expireEmail();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timer = document.getElementById('timer');
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;

        timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Изменение цвета при малом времени
        if (this.timeLeft < 60) {
            timer.classList.add('warning');
        } else {
            timer.classList.remove('warning');
        }
    }

    expireEmail() {
        clearInterval(this.timerInterval);
        document.getElementById('email-address').value = 'Время истекло. Создайте новый email.';
        document.getElementById('timer').textContent = '00:00';
        this.currentEmail = null;
        this.saveToStorage();

        this.showNotification('Время вашего временного email истекло');
    }

    copyEmail() {
        if (!this.currentEmail) {
            this.showNotification('Сначала создайте email', 'error');
            return;
        }

        navigator.clipboard.writeText(this.currentEmail).then(() => {
            this.showNotification('Email скопирован в буфер обмена');
        });
    }

    refreshEmails() {
        if (!this.currentEmail) {
            this.showNotification('Сначала создайте email', 'error');
            return;
        }

        // Имитация обновления писем
        document.getElementById('refresh-btn').classList.add('loading');
        document.getElementById('refresh-btn').innerHTML = '<span class="spinner"></span> Обновление...';

        setTimeout(() => {
            // Только реальные письма, без спама
            this.checkForRealEmails();
            document.getElementById('refresh-btn').classList.remove('loading');
            document.getElementById('refresh-btn').innerHTML = '<span>Обновить</span>';
        }, 1000);
    }

    // Проверка реальных писем (без спама)
    checkForRealEmails() {
        if (!this.currentEmail) return;

        // Имитация получения реальных писем (только если пользователь действительно использовал email)
        const hasRealActivity = localStorage.getItem(`user-activity-${this.userId}`);

        if (hasRealActivity) {
            // Только реальные письма от сервисов, где пользователь зарегистрировался
            const realEmails = this.getRealEmails();
            if (realEmails.length > 0) {
                this.emails = [...realEmails, ...this.emails];
                this.stats.received += realEmails.length;
                this.updateDisplay();
                this.saveToStorage();
                this.showNotification(`Получено ${realEmails.length} новых писем`);
            } else {
                this.showNotification('Новых писем нет');
            }
        } else {
            this.showNotification('Новых писем нет');
        }
    }

    // Получение реальных писем (без спама)
    getRealEmails() {
        const realEmails = [];
        const activity = JSON.parse(localStorage.getItem(`user-activity-${this.userId}`) || '[]');

        activity.forEach(service => {
            realEmails.push({
                id: Date.now() + Math.random(),
                from: service + '@service.com',
                subject: `Подтверждение регистрации на ${service}`,
                preview: 'Для завершения регистрации перейдите по ссылке в письме...',
                time: new Date().toLocaleTimeString(),
                content: `<p>Спасибо за регистрацию на ${service}!</p><p>Для завершения регистрации перейдите по ссылке ниже:</p><p><a href="#">Подтвердить email</a></p>`,
                unread: true
            });
        });

        return realEmails;
    }

    extendTimer() {
        if (!this.currentEmail) {
            this.showNotification('Сначала создайте email', 'error');
            return;
        }

        this.timeLeft += 600; // +10 минут
        this.updateTimerDisplay();
        this.showNotification('Время увеличено на 10 минут');
    }

    saveEmails() {
        if (this.emails.length === 0) {
            this.showNotification('Нет писем для сохранения', 'error');
            return;
        }

        // Имитация сохранения
        this.showNotification('Письма сохранены в историю');
    }

    clearHistory() {
        if (confirm('Вы уверены, что хотите очистить историю писем?')) {
            this.emails = [];
            this.updateDisplay();
            this.showNotification('История писем очищена');
        }
    }

    showHistory() {
        this.showNotification('История временных адресов');
    }

    updateDisplay() {
        // Обновление email адреса
        const emailInput = document.getElementById('email-address');
        if (this.currentEmail) {
            emailInput.value = this.currentEmail;
        } else {
            emailInput.value = 'Нажмите "Создать email" для начала';
        }

        // Обновление статистики
        document.getElementById('stats-created').textContent = this.stats.created;
        document.getElementById('stats-received').textContent = this.stats.received;
        document.getElementById('stats-active').textContent = this.currentEmail ? 1 : 0;

        // Обновление списка писем
        this.updateEmailList();
    }

    updateEmailList() {
        const emailList = document.getElementById('email-list');
        const emailCount = document.getElementById('email-count');

        if (this.emails.length === 0) {
            emailList.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <p>Пока нет входящих писем</p>
                    <small>Письма появятся здесь после использования вашего временного email</small>
                </div>
            `;
            emailCount.textContent = '0';
            return;
        }

        emailCount.textContent = this.emails.length.toString();

        emailList.innerHTML = this.emails.map(email => `
            <div class="email-item ${email.unread ? 'unread' : ''}" data-email-id="${email.id}">
                <div class="email-header">
                    <div class="email-subject">${email.subject}</div>
                    <div class="email-time">${email.time}</div>
                </div>
                <div class="email-sender">От: ${email.from}</div>
                <div class="email-preview">${email.preview}</div>
            </div>
        `).join('');

        // Добавляем обработчики для писем
        emailList.querySelectorAll('.email-item').forEach(item => {
            item.addEventListener('click', () => this.showEmailContent(item.dataset.emailId));
        });
    }

    showEmailContent(emailId) {
        const email = this.emails.find(e => e.id == emailId);
        if (!email) return;

        const content = document.getElementById('email-content');
        content.innerHTML = `
            <h3>${email.subject}</h3>
            <div style="color: var(--gray); margin: 10px 0; font-size: 0.9rem;">
                От: ${email.from}<br>
                Время: ${email.time}
            </div>
            <div style="margin-top: 20px; line-height: 1.6;">
                ${email.content}
            </div>
        `;
        content.classList.add('active');

        // Помечаем как прочитанное
        email.unread = false;
        this.updateEmailList();
    }

    showNotification(message, type = 'success') {
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type === 'error' ? 'error' : ''}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    loadFromStorage() {
        // Загрузка из localStorage для текущего пользователя
        const saved = localStorage.getItem(`tempmail-data-${this.userId}`);
        if (saved) {
            const data = JSON.parse(saved);
            this.currentEmail = data.currentEmail;
            this.timeLeft = data.timeLeft;
            this.emails = data.emails || [];
            this.stats = data.stats || this.stats;

            if (this.currentEmail && this.timeLeft > 0) {
                this.startTimer();
            }
        }
    }

    saveToStorage() {
        // Сохранение в localStorage для текущего пользователя
        const data = {
            currentEmail: this.currentEmail,
            timeLeft: this.timeLeft,
            emails: this.emails,
            stats: this.stats
        };
        localStorage.setItem(`tempmail-data-${this.userId}`, JSON.stringify(data));
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.tempMail = new TempMail();
});

// Имитация использования email на других сайтах
function simulateEmailUsage(serviceName) {
    if (!window.tempMail || !window.tempMail.currentEmail) {
        alert('Сначала создайте временный email');
        return;
    }

    // Сохраняем активность пользователя
    let activity = JSON.parse(localStorage.getItem(`user-activity-${window.tempMail.userId}`) || '[]');
    if (!activity.includes(serviceName)) {
        activity.push(serviceName);
        localStorage.setItem(`user-activity-${window.tempMail.userId}`, JSON.stringify(activity));
    }

    alert(`Email ${window.tempMail.currentEmail} использован для регистрации на ${serviceName}`);
}