// Константы для авторизации
const CORRECT_USERNAME = 'admin';
const CORRECT_PASSWORD = '12345';

// Элементы DOM
const loginModal = document.getElementById('loginModal');
const app = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link[data-page]');
const pages = document.querySelectorAll('.page');
const filterBtns = document.querySelectorAll('.filter-btn');
const requestCards = document.querySelectorAll('.request-card');
const serviceBtns = document.querySelectorAll('[data-service]');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Обработчики событий
    setupEventListeners();
    
    // Проверка авторизации
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';
    if (isAuthenticated) {
        showApp();
    } else {
        showLogin();
        // Загрузка сохраненных данных
        loadSavedCredentials();
    }
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Форма авторизации
    loginForm.addEventListener('submit', handleLogin);

    // Переключение видимости пароля (делегирование событий)
    document.addEventListener('click', (e) => {
        const passwordToggle = e.target.closest('#passwordToggle');
        if (passwordToggle) {
            e.preventDefault();
            e.stopPropagation();
            togglePasswordVisibility();
        }
    });


    // Выход
    logoutBtn.addEventListener('click', handleLogout);

    // Навигация
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            switchPage(pageId);
            closeMobileMenu();
        });
    });

    // Мобильное меню
    navToggle.addEventListener('click', toggleMobileMenu);

    // Фильтры заявок
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterRequests(btn.getAttribute('data-filter'));
        });
    });

    // Кнопки услуг
    serviceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const service = btn.getAttribute('data-service');
            handleServiceClick(service);
        });
    });

    // Закрытие мобильного меню при клике на затемненный фон
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('active')) {
            // Если клик не на меню и не на кнопку бургера
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });
}

// Обработка авторизации
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    loginError.textContent = '';

    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
        localStorage.setItem('authenticated', 'true');
        
        // Сохранение данных, если включен чекбокс
        if (rememberMe) {
            localStorage.setItem('savedUsername', username);
            localStorage.setItem('savedPassword', password);
            localStorage.setItem('rememberMe', 'true');
        } else {
            // Удаление сохраненных данных, если чекбокс выключен
            localStorage.removeItem('savedUsername');
            localStorage.removeItem('savedPassword');
            localStorage.removeItem('rememberMe');
        }
        
        showApp();
    } else {
        loginError.textContent = 'Неверный логин или пароль';
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);
    }
}

// Переключение видимости пароля
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    
    if (!passwordInput) {
        return;
    }
    
    const passwordToggle = document.getElementById('passwordToggle');
    if (!passwordToggle) {
        return;
    }
    
    const eyeOpen = passwordToggle.querySelector('.eye-open');
    const eyeClosed = passwordToggle.querySelector('.eye-closed');
    
    // Переключение типа поля
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        // Переключение иконок
        if (eyeOpen) {
            eyeOpen.style.display = 'none';
        }
        if (eyeClosed) {
            eyeClosed.style.display = 'block';
        }
        passwordToggle.setAttribute('aria-label', 'Скрыть пароль');
    } else {
        passwordInput.type = 'password';
        // Переключение иконок
        if (eyeOpen) {
            eyeOpen.style.display = 'block';
        }
        if (eyeClosed) {
            eyeClosed.style.display = 'none';
        }
        passwordToggle.setAttribute('aria-label', 'Показать пароль');
    }
}

// Загрузка сохраненных данных
function loadSavedCredentials() {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (rememberMe) {
        const savedUsername = localStorage.getItem('savedUsername');
        const savedPassword = localStorage.getItem('savedPassword');
        
        if (savedUsername && savedPassword) {
            document.getElementById('username').value = savedUsername;
            document.getElementById('password').value = savedPassword;
            document.getElementById('rememberMe').checked = true;
        }
    }
}

// Обработка выхода
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('authenticated');
    showLogin();
    // Очистка формы (но сохраняем данные, если был включен чекбокс)
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (!rememberMe) {
        loginForm.reset();
    } else {
        // Восстанавливаем сохраненные данные
        loadSavedCredentials();
    }
    loginError.textContent = '';
    // Возвращаем тип поля пароля к password
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.type = 'password';
        const eyeOpen = document.querySelector('.eye-icon.eye-open');
        const eyeClosed = document.querySelector('.eye-icon.eye-closed');
        if (eyeOpen) eyeOpen.style.display = 'block';
        if (eyeClosed) eyeClosed.style.display = 'none';
    }
}

// Показать форму авторизации
function showLogin() {
    loginModal.classList.add('active');
    app.classList.add('hidden');
}

// Показать приложение
function showApp() {
    loginModal.classList.remove('active');
    app.classList.remove('hidden');
    // Активируем первую страницу
    switchPage('dashboard');
}

// Переключение страниц
function switchPage(pageId) {
    // Скрыть все страницы
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // Показать выбранную страницу
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Обновить активную ссылку в навигации
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
}

// Мобильное меню
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    // Блокируем скролл при открытом меню
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMobileMenu() {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
}

// Закрытие меню при клике на затемненный фон (обработчик уже добавлен в setupEventListeners)

// Фильтрация заявок
function filterRequests(filter) {
    requestCards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'block';
        } else {
            const status = card.getAttribute('data-status');
            if (status === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// Обработка клика по услуге
function handleServiceClick(service) {
    // Переключаемся на страницу заявок
    switchPage('requests');
    
    // Показываем уведомление
    showNotification(`Заявка на услугу "${getServiceName(service)}" создана`, 'success');
    
    // Прокручиваем к началу страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Получить название услуги
function getServiceName(service) {
    const names = {
        'create-vm': 'Создание ВМ',
        'modify-vm': 'Изменение ресурсов',
        'extend-vm': 'Продление аренды',
        'delete-vm': 'Списание ВМ',
        'snapshot-vm': 'Снимок состояния',
        'clone-vm': 'Клонирование ВМ'
    };
    return names[service] || service;
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Удаляем существующие уведомления
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Добавляем стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 24px;
        background: ${type === 'success' ? '#10b981' : '#dc2626'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Добавляем CSS анимации для уведомлений
const style = document.createElement('style');
style.textContent = `
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
    
    .shake {
        animation: shake 0.5s ease;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Анимация появления элементов при загрузке
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Наблюдаем за карточками
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.stat-card, .service-card, .request-card, .vm-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});


// Обработка Enter в полях формы
document.getElementById('username').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('password').focus();
    }
});

document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginForm.dispatchEvent(new Event('submit'));
    }
});

