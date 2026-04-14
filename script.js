const USERS_KEY = 'lernaPeopleUsers';
const SESSION_KEY = 'lernaPeopleSession';
const APP_NAME = 'LernaPeople';

const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W_]{8,}$/;
const cyrillicPattern = /[А-Яа-яЁё]/;

const getUsers = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
const getSession = () => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
const saveSession = (session) => localStorage.setItem(SESSION_KEY, JSON.stringify(session));
const clearSession = () => localStorage.removeItem(SESSION_KEY);

const sendEmailNotification = (email, eventType) => {
  const subject = encodeURIComponent(`${APP_NAME}: уведомление`);
  const body = encodeURIComponent(
    `Привет! Вы ${eventType} на сайте ${APP_NAME}.\n\nЭто демонстрационное письмо. Для реальной отправки нужен серверный почтовый сервис.`,
  );
  console.info(`Email notification (${eventType}) for ${email}`);
  return `mailto:${email}?subject=${subject}&body=${body}`;
};

const redirectToHome = () => {
  window.location.href = 'home.html';
};

const initAuthPage = () => {
  const session = getSession();
  if (session?.email) {
    redirectToHome();
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialMode = params.get('mode') === 'login' ? 'login' : params.get('mode') === 'register' ? 'register' : '';

  const chooser = document.querySelector('#auth-chooser');
  const goRegister = document.querySelector('#go-register');
  const goLogin = document.querySelector('#go-login');

  const form = document.querySelector('#auth-form');
  const formTitle = document.querySelector('#auth-title');
  const emailInput = document.querySelector('#email');
  const passwordInput = document.querySelector('#password');
  const submitButton = document.querySelector('#auth-submit');
  const errorBox = document.querySelector('#auth-error');
  const successBox = document.querySelector('#auth-success');

  if (
    !chooser ||
    !goRegister ||
    !goLogin ||
    !form ||
    !formTitle ||
    !emailInput ||
    !passwordInput ||
    !submitButton ||
    !errorBox ||
    !successBox
  ) {
    return;
  }

  let mode = initialMode;

  const updateMode = (nextMode) => {
    mode = nextMode;

    if (!mode) {
      chooser.style.display = 'grid';
      form.classList.add('auth-form--hidden');
      return;
    }

    chooser.style.display = 'none';
    form.classList.remove('auth-form--hidden');

    const isRegister = mode === 'register';
    formTitle.textContent = isRegister ? 'Придумайте:' : 'Войдите:';
    submitButton.textContent = isRegister ? 'Зарегистрироваться' : 'Войти';

    errorBox.textContent = '';
    successBox.textContent = '';
  };

  const goToModePage = (nextMode) => {
    window.location.href = `index.html?mode=${nextMode}`;
  };

  goRegister.addEventListener('click', () => goToModePage('register'));
  goLogin.addEventListener('click', () => goToModePage('login'));

  updateMode(initialMode);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!mode) {
      return;
    }

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    errorBox.textContent = '';
    successBox.textContent = '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorBox.textContent = 'Введите корректную почту в формате name@company.com.';
      return;
    }

    if (cyrillicPattern.test(password)) {
      errorBox.textContent = 'Пароль должен содержать только латинские символы.';
      return;
    }

    if (!passwordPattern.test(password)) {
      errorBox.textContent =
        'Пароль должен быть не менее 8 символов и содержать минимум 1 заглавную латинскую букву и 1 цифру.';
      return;
    }

    const users = getUsers();
    const existingUser = users.find((user) => user.email === email);

    if (mode === 'register') {
      if (existingUser) {
        errorBox.textContent = 'Пользователь с такой почтой уже зарегистрирован. Используйте вход.';
        return;
      }

      users.push({ email, password, createdAt: new Date().toISOString() });
      saveUsers(users);
      saveSession({ email, loggedInAt: new Date().toISOString() });

      const mailto = sendEmailNotification(email, 'зарегистрировались');
      successBox.innerHTML = `Регистрация успешна. Письмо отправлено на ${email}. <a href="${mailto}">Открыть письмо</a>.`;

      setTimeout(redirectToHome, 700);
      return;
    }

    if (!existingUser || existingUser.password !== password) {
      errorBox.textContent = 'Неверная почта или пароль.';
      return;
    }

    saveSession({ email, loggedInAt: new Date().toISOString() });
    const mailto = sendEmailNotification(email, 'вошли');
    successBox.innerHTML = `Вход выполнен. Письмо отправлено на ${email}. <a href="${mailto}">Открыть письмо</a>.`;
    setTimeout(redirectToHome, 700);
  });
};

const initHomePage = () => {
  const session = getSession();
  if (!session?.email) {
    window.location.href = 'index.html';
    return;
  }

  const greeting = document.querySelector('.eyebrow');
  const today = new Date();
  const hour = today.getHours();

  let partOfDay = 'Добрый день';

  if (hour < 12) {
    partOfDay = 'Доброе утро';
  } else if (hour >= 18) {
    partOfDay = 'Добрый вечер';
  }

  if (greeting) {
    greeting.textContent = `${partOfDay}!`;
  }

  const shortcuts = document.querySelectorAll('.shortcut-tile');
  shortcuts.forEach((tile) => {
    tile.addEventListener('click', () => {
      shortcuts.forEach((button) => button.classList.remove('shortcut-tile--selected'));
      tile.classList.add('shortcut-tile--selected');
    });
  });

  const logoutButton = document.querySelector('#logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearSession();
      window.location.href = 'index.html';
    });
  }
};

if (document.body.classList.contains('auth-page')) {
  initAuthPage();
} else {
  initHomePage();
}
