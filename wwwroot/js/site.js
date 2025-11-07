/* -------------------------------------------------------------
   TempMail – клиентская часть (исправленная версия)
   ------------------------------------------------------------- */
class TempMail {
    constructor() {
        this.currentEmail = null;          // текущий e‑mail (пока пустой)
        this.timerInterval = null;         // ID setInterval
        this.timeLeft = 600;               // 10 минут = 600 сек
        this.emails = [];                  // список писем
        this.stats = { created: 0, received: 0, active: 0 };
        this.userId = this.getUserId();

        // 1️⃣ Навешиваем обработчики (они работают только после
        //    того, как страница уже отрисована)
        this.initializeEventListeners();

        // 2️⃣ Смотрим, пришёл ли уже готовый e‑mail от сервера
        this.checkServerGeneratedEmail();

        // 3️⃣ Остальные UI‑элементы (список писем, статистика)
        this.updateDisplay();
    }

    /* ---------- UID пользователя ---------- */
    getUserId() {
        let uid = localStorage.getItem('tempmail-user-id');
        if (!uid) {
            uid = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('tempmail-user-id', uid);
        }
        return uid;
    }

    /* ---------- ПРИМЕЧАНИЕ ----------
       Этот метод **не** генерирует e‑mail, а просто проверяет,
       существует ли уже готовый адрес, пришедший от сервера. */
    checkServerGeneratedEmail() {
        const input = document.getElementById('email-address');
        if (!input) return;

        // Если в input уже есть value – значит сервер отдал e‑mail
        if (input.value && input.value.trim() !== '') {
            this.currentEmail = input.value.trim();

            // Таймер стартует сразу (полные 10 минут)
            this.timeLeft = 600;
            this.startTimer();

            // Показываем таймер и активные кнопки
            this.toggleTimerVisibility(true);
            this.toggleControlsVisibility(true);
        } else {
            // Email ещё не создан – скрываем таймер и лишние кнопки
            this.toggleTimerVisibility(false);
            this.toggleControlsVisibility(false);
        }
    }

    /* ---------- Навешивание обработчиков ---------- */
    initializeEventListeners() {
        const genBtn = document.getElementById('generate-btn');
        if (genBtn) genBtn.addEventListener('click', () => {
            /* Кнопка «Создать email» отправляет форму,
               поэтому здесь ничего не делаем – действие происходит
               на сервере, а после перезагрузки страницы
               `checkServerGeneratedEmail()` обработает результат. */
        });

        const refBtn = document.getElementById('refresh-btn');
        if (refBtn) refBtn.addEventListener('click', () => this.refreshEmails());

        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) copyBtn.addEventListener('click', () => this.copyEmail());

        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetEmail());

        const deleteAllBtn = document.getElementById('delete-all');
        if (deleteAllBtn) deleteAllBtn.addEventListener('click', () => this.clearAll());

        const testEmailBtn = document.getElementById('test-email-btn');
        if (testEmailBtn) testEmailBtn.addEventListener('click', () => this.sendTestMail());
    }

    /* ---------- Перезапуск таймера (обновить email) ---------- */
    refreshEmails() {
        if (!this.currentEmail) {
            this.showNotification('Сначала создайте email', 'error');
            return;
        }

        // Сбрасываем время до новых 10 минут
        this.timeLeft = 600;
        this.updateTimerDisplay();

        // Имитируем запрос новых писем (можно заменить реальным fetch)
        const btn = document.getElementById('refresh-btn');
        if (btn) {
            btn.classList.add('loading');
            btn.innerHTML = '<span class="spinner"></span> Обновление...';
        }

        setTimeout(() => {
            this.checkForRealEmails();               // ваш метод проверки реальных писем
            if (btn) {
                btn.classList.remove('loading');
                btn.innerHTML = '<span class="btn-icon">🔄</span> Обновить email';
            }
            this.showNotification('Обновление завершено');
        }, 1000);
    }

    /* ---------- Удалить текущий ящик ---------- */
    resetEmail() {
        if (!this.currentEmail) {
            this.showNotification('Почты нет', 'error');
            return;
        }
        clearInterval(this.timerInterval);
        this.currentEmail = null;
        this.timeLeft = 0;
        this.emails = [];
        this.updateDisplay();
        this.saveToStorage();

        // Сразу скрываем таймер и управ.кнопки
        this.toggleTimerVisibility(false);
        this.toggleControlsVisibility(false);
        this.showNotification('Email удалён');
    }

    /* ---------- Запуск таймера ---------- */
    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) this.expireEmail();
        }, 1000);
    }

    /* ---------- Отображение таймера ---------- */
    updateTimerDisplay() {
        const timerValue = document.getElementById('timer-value');
        const timerBox   = document.getElementById('timer');

        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        timerValue.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // если осталось < 1 минута – визуальное предупреждение
        if (this.timeLeft < 60) timerBox.classList.add('warning');
        else timerBox.classList.remove('warning');
    }

    /* ---------- Истечение времени ---------- */
    expireEmail() {
        clearInterval(this.timerInterval);
        const input = document.getElementById('email-address');
        if (input) input.value = '';
        this.timeLeft = 0;
        this.updateTimerDisplay();   // покажет 00:00
        this.currentEmail = null;
        this.saveToStorage();

        this.toggleTimerVisibility(false);
        this.toggleControlsVisibility(false);
        this.showNotification('Время вашего email истекло', 'error');
    }

    /* ---------- Копировать в буфер ---------- */
    copyEmail() {
        if (!this.currentEmail) {
            this.showNotification('Сначала создайте email', 'error');
            return;
        }
        navigator.clipboard.writeText(this.currentEmail)
            .then(() => this.showNotification('Email скопирован в буфер обмена'))
            .catch(() => this.showNotification('Ошибка копирования', 'error'));
    }

    /* ---------- Удалить все письма ---------- */
    clearAll() {
        if (this.emails.length === 0) {
            this.showNotification('Писем нет', 'error');
            return;
        }
        if (confirm('Точно удалить все письма?')) {
            this.emails = [];
            this.updateEmailList();
            this.showNotification('Все письма удалены');
            this.saveToStorage();
        }
    }

    /* ---------- Тестовое письмо (имитация) ---------- */
    sendTestMail() {
        if (!this.currentEmail) {
            this.showNotification('Сначала создайте email', 'error');
            return;
        }

        const test = {
            id: Date.now(),
            from: 'test@example.com',
            subject: 'Тестовое письмо',
            preview: 'Это тестовое письмо, созданное для проверки работы TempMail.',
            time: new Date().toLocaleTimeString(),
            content: '<p>Привет! Это тестовое письмо.</p>',
            unread: true
        };

        this.emails.unshift(test);
        this.stats.received++;
        this.updateEmailList();
        this.updateDisplay();
        this.saveToStorage();
        this.showNotification('Тестовое письмо получено');
    }

    /* ---------- Проверка реальных писем (ваш код) ---------- */
    checkForRealEmails() {
        if (!this.currentEmail) return;

        const hasRealActivity = localStorage.getItem(`user-activity-${this.userId}`);

        if (hasRealActivity) {
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

    getRealEmails() {
        const realEmails = [];
        const activity = JSON.parse(localStorage.getItem(`user-activity-${this.userId}`) || '[]');

        activity.forEach(service => {
            realEmails.push({
                id: Date.now() + Math.random(),
                from: `${service}@service.com`,
                subject: `Подтверждение регистрации на ${service}`,
                preview: 'Для завершения регистрации перейдите по ссылке в письме...',
                time: new Date().toLocaleTimeString(),
                content: `<p>Спасибо за регистрацию на ${service}!</p>
                          <p>Для завершения регистрации перейдите по ссылке ниже:</p>
                          <p><a href="#">Подтвердить email</a></p>`,
                unread: true
            });
        });
        return realEmails;
    }

    /* ---------- Список писем ---------- */
    updateEmailList() {
        const list = document.getElementById('email-list');
        const count = document.getElementById('email-count');

        if (this.emails.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p>Пока нет входящих писем</p>
                    <small>Письма появятся здесь после использования вашего временного email</small>
                </div>`;
            if (count) count.textContent = '0';
            return;
        }

        if (count) count.textContent = this.emails.length;
        list.innerHTML = this.emails.map(email => `
            <div class="email-item ${email.unread ? 'unread' : ''}" data-email-id="${email.id}">
                <div class="email-header">
                    <div class="email-subject">${email.subject}</div>
                    <div class="email-time">${email.time}</div>
                </div>
                <div class="email-sender">От: ${email.from}</div>
                <div class="email-preview">${email.preview}</div>
            </div>
        `).join('');

        // привязываем к каждому письму открытие
        list.querySelectorAll('.email-item').forEach(item => {
            item.addEventListener('click', () => this.showEmailContent(item.dataset.emailId));
        });
    }

    /* ---------- Показ письма в правой части ---------- */
    showEmailContent(emailId) {
        const email = this.emails.find(e => e.id == emailId);
        if (!email) return;

        const content = document.getElementById('email-content');
        content.innerHTML = `
            <h3>${email.subject}</h3>
            <div style="color: var(--gray); margin:10px 0; font-size:0.9rem;">
                От: ${email.from}<br>
                Время: ${email.time}
            </div>
            <div style="margin-top:20px; line-height:1.6;">
                ${email.content}
            </div>
        `;
        content.classList.add('active');

        // помечаем как прочитанное и перерисовываем список
        email.unread = false;
        this.updateEmailList();
    }

    /* ---------- Уведомления ---------- */
    showNotification(message, type = 'success') {
        const n = document.createElement('div');
        n.className = `notification ${type === 'error' ? 'error' : ''}`;
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 3000);
    }

    /* ---------- Сохранить / загрузить состояние ---------- */
    loadFromStorage() {
        const raw = localStorage.getItem(`tempmail-data-${this.userId}`);
        if (!raw) return;

        const data = JSON.parse(raw);
        // **Не** восстанавливаем currentEmail и timeLeft – иначе email появится без нажатия.
        this.emails = data.emails || [];
        this.stats  = data.stats  || this.stats;
        this.updateEmailList();
    }

    saveToStorage() {
        const data = {
            currentEmail: this.currentEmail,
            timeLeft: this.timeLeft,
            emails: this.emails,
            stats: this.stats
        };
        localStorage.setItem(`tempmail-data-${this.userId}`, JSON.stringify(data));
    }

    /* ---------- Обновление UI (список, таймер, кнопки) ---------- */
    updateDisplay() {
        const input = document.getElementById('email-address');
        // если email ещё нет – оставляем пустым, чтобы отобразился placeholder
        if (input) input.value = this.currentEmail ? this.currentEmail : '';

        const sCreated  = document.getElementById('stats-created');
        const sReceived = document.getElementById('stats-received');
        const sActive   = document.getElementById('stats-active');
        if (sCreated)  sCreated.textContent  = this.stats.created;
        if (sReceived) sReceived.textContent = this.stats.received;
        if (sActive)   sActive.textContent   = this.currentEmail ? 1 : 0;

        this.updateEmailList();
    }

    /* ---------- Показ/скрытие таймера ---------- */
    toggleTimerVisibility(isVisible) {
        const timerBox = document.getElementById('timer');
        if (!timerBox) return;
        timerBox.style.display = isVisible ? 'flex' : 'none';
        if (isVisible) this.updateTimerDisplay(); // сразу обновим цифры
    }

    /* ---------- Показ/скрытие управ.кнопок ---------- */
    toggleControlsVisibility(isActive) {
        // Кнопка «Создать» показывается, когда email НЕ создан
        const genBtn    = document.getElementById('generate-btn');
        const copyBtn   = document.getElementById('copy-btn');
        const refreshBtn= document.getElementById('refresh-btn');
        const resetBtn  = document.getElementById('reset-btn');

        if (isActive) {
            if (genBtn)    genBtn.style.display    = 'none';
            if (copyBtn)   copyBtn.style.display   = 'inline-flex';
            if (refreshBtn)refreshBtn.style.display = 'inline-flex';
            if (resetBtn)  resetBtn.style.display   = 'inline-flex';
        } else {
            if (genBtn)    genBtn.style.display    = 'inline-flex';
            if (copyBtn)   copyBtn.style.display   = 'none';
            if (refreshBtn)refreshBtn.style.display = 'none';
            if (resetBtn)  resetBtn.style.display   = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.tempMail = new TempMail();   // создаём объект, он сразу проверит,
                                        // появился ли уже email от сервера
});