const screens = [...document.querySelectorAll('.screen')];
const audio = document.getElementById('our-song');
const musicStatus = document.getElementById('music-status');
const musicToggle = document.getElementById('music-toggle');
const memoryImage = document.getElementById('memory-image');
const memoryFrame = document.getElementById('memory-frame');
const modal = document.getElementById('coupon-modal');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalEyebrow = document.getElementById('modal-eyebrow');
const modalAccept = document.getElementById('modal-accept');
const notificationStatus = document.getElementById('notification-status');
const hasAudioSource = Boolean(audio && audio.getAttribute('src'));

// Web3Forms принимает отправки с публичного статического сайта (GitHub Pages).
// Access Key специально предназначен для размещения во фронтенд-коде.
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY = '750a9ca1-ae59-4077-97c7-888461937cfc';
const NOTIFICATION_EMAIL = 'vladbudr@yandex.ru';
let selectedCoupon = null;
let isSendingGift = false;

function showAudioError(error) {
  setMusicPlaying(false);
  if (error && error.name === 'NotAllowedError') {
    musicStatus.textContent = 'Автозапуск заблокирован — нажми ▶';
  } else if (error && error.name === 'NotSupportedError') {
    musicStatus.textContent = 'Браузер не поддерживает этот аудиофайл';
  } else if (error && error.name === 'AbortError') {
    musicStatus.textContent = 'Загрузка прервалась — нажми ▶ ещё раз';
  } else {
    musicStatus.textContent = 'Не удалось запустить MP3 — проверь assets/our-song.mp3';
  }
}

function setMusicPlaying(isPlaying) {
  musicToggle.textContent = isPlaying ? 'Ⅱ' : '▶';
  musicToggle.setAttribute('aria-label', isPlaying ? 'Поставить музыку на паузу' : 'Включить музыку');
  if (isPlaying) musicStatus.textContent = 'Сейчас играет наша песня';
}

function playOurSong() {
  if (!hasAudioSource) {
    musicStatus.textContent = 'Музыкальный файл не найден';
    return;
  }
  musicToggle.disabled = false;
  musicStatus.textContent = 'Запускаем нашу песню…';
  let playAttempt;
  try {
    // play() вызывается прямо внутри пользовательского клика — это важно
    // для ограничений автозапуска Chrome, Edge, Firefox и Safari.
    playAttempt = audio.play();
  } catch (error) {
    showAudioError(error);
    return;
  }
  if (playAttempt && typeof playAttempt.then === 'function') {
    playAttempt.then(() => setMusicPlaying(true)).catch(showAudioError);
  } else {
    setMusicPlaying(true);
  }
}

const coupons = {
  ring: {
    eyebrow: 'КУПОН № 01 · ОСОБЕННЫЙ',
    title: 'Любое кольцо, которое пожелаешь',
    description: 'Выбираем вместе именно то кольцо, от которого у тебя загорятся глаза. Без спешки, сомнений и ограничений с моей стороны. Этот подарок — мой способ сказать «я бы выбрал тебя снова».',
    icon: '◇'
  },
  date: {
    eyebrow: 'КУПОН № 02 · ВПЕЧАТЛЕНИЯ',
    title: 'Свидание-сюрприз',
    description: 'Я полностью организую наш вечер: место, настроение, детали и маленький сюрприз. Тебе останется только красиво улыбаться и провести это время со мной.',
    icon: '✦'
  },
  rest: {
    eyebrow: 'КУПОН № 03 · ЗАБОТА',
    title: 'День полного отдыха',
    description: 'Один день без бытовых забот и обязательных дел. Я беру всё на себя, а ты отдыхаешь так, как хочется именно тебе.',
    icon: '☾'
  },
  massage: {
    eyebrow: 'КУПОН № 04 · НЕЖНОСТЬ',
    title: 'Массаж без спешки',
    description: 'Время для расслабления, заботы и внимания. Продолжительность и настроение выбираешь ты. Купон действует тогда, когда тебе захочется.',
    icon: '♡'
  },
  trip: {
    eyebrow: 'КУПОН № 05 · ПРИКЛЮЧЕНИЕ',
    title: 'Маленькое путешествие',
    description: 'Выбираем направление и устраиваем небольшое приключение для нас двоих. Новые места, совместные фотографии и ещё одно воспоминание в нашу копилку.',
    icon: '⌁'
  },
  wish: {
    eyebrow: 'КУПОН № 06 · ТВОЁ ЖЕЛАНИЕ',
    title: 'Исполнение одного желания',
    description: 'Одно твоё желание, которое я постараюсь исполнить с радостью. Главное условие — оно должно сделать тебя счастливее.',
    icon: '✧'
  }
};

function showScreen(id, shouldScroll = true) {
  screens.forEach((screen) => {
    const active = screen.id === id;
    screen.hidden = !active;
    screen.classList.toggle('is-active', active);
  });
  if (shouldScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('yes-button').addEventListener('click', () => {
  // Не переносить playOurSong в setTimeout: браузер должен видеть прямой жест.
  showScreen('yes-page', false);
  playOurSong();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  launchHeartMoment();
});

document.getElementById('no-button').addEventListener('click', () => showScreen('no-page'));
document.getElementById('gift-button').addEventListener('click', () => showScreen('gifts-page'));
document.querySelectorAll('[data-go]').forEach((button) => {
  button.addEventListener('click', () => showScreen(button.dataset.go));
});

memoryImage.addEventListener('load', () => memoryFrame.classList.add('has-image'));
memoryImage.addEventListener('error', () => memoryFrame.classList.remove('has-image'));
if (memoryImage.complete && memoryImage.naturalWidth > 0) memoryFrame.classList.add('has-image');

musicToggle.addEventListener('click', () => {
  if (audio.paused) {
    playOurSong();
  } else {
    audio.pause();
    setMusicPlaying(false);
    musicStatus.textContent = 'Музыка на паузе';
  }
});

audio.addEventListener('playing', () => setMusicPlaying(true));
audio.addEventListener('pause', () => {
  if (!audio.ended) setMusicPlaying(false);
});
audio.addEventListener('error', () => {
  musicToggle.disabled = false;
  setMusicPlaying(false);
  const code = audio.error ? audio.error.code : 0;
  const details = {
    1: 'загрузка прервана',
    2: 'сетевая ошибка',
    3: 'ошибка декодирования MP3',
    4: 'файл не найден или формат не поддерживается'
  };
  musicStatus.textContent = `Ошибка аудио (${code}: ${details[code] || 'неизвестная ошибка'}). Проверь assets/our-song.mp3`;
});

audio.addEventListener('ended', () => {
  setMusicPlaying(false);
  musicStatus.textContent = 'Наша песня закончилась';
});

function openCoupon(couponKey, button) {
  const coupon = coupons[couponKey];
  if (!coupon) return;
  selectedCoupon = { ...coupon, key: couponKey };
  modalEyebrow.textContent = coupon.eyebrow;
  modalTitle.textContent = coupon.title;
  modalDescription.textContent = coupon.description;
  notificationStatus.textContent = '';
  notificationStatus.className = 'notification-status';
  modalAccept.disabled = false;
  modalAccept.textContent = 'Забираю ♥';
  modal.dataset.openedFrom = button.dataset.coupon;
  modal.hidden = false;
  document.getElementById('modal-close').focus();
}

document.querySelectorAll('[data-coupon]').forEach((button) => {
  button.addEventListener('click', () => openCoupon(button.dataset.coupon, button));
});

async function sendGiftNotification(coupon) {
  if (!coupon || isSendingGift) return;
  isSendingGift = true;
  modalAccept.disabled = true;
  modalAccept.textContent = 'Отправляем…';
  notificationStatus.textContent = 'Отправляю твой выбор…';
  notificationStatus.className = 'notification-status is-pending';

  const submittedAt = new Date().toLocaleString('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short'
  });
  const message = [
    'Она выбрала подарок на годовщину ♥',
    '',
    `Подарок: ${coupon.title}`,
    `Купон: ${coupon.eyebrow}`,
    `Описание: ${coupon.description}`,
    `Время выбора: ${submittedAt}`,
    `Страница: ${window.location.href}`
  ].join('\n');

  // Web3Forms ожидает access_key и данные формы. Поле email здесь указывает
  // адрес для ответа на уведомление; само письмо направляется на почту,
  // привязанную к этому Access Key в Web3Forms.
  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    name: 'Выбор подарка на годовщину',
    email: NOTIFICATION_EMAIL,
    message,
    subject: `Она выбрала подарок: ${coupon.title} ♥`,
    from_name: 'Наш юбилейный сайт',
    gift: coupon.title,
    coupon: coupon.eyebrow,
    details: coupon.description,
    submitted_at: submittedAt,
    page: window.location.href,
    botcheck: ''
  };

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let result = {};
    const responseText = await response.text();
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch (_) {
      result = { message: responseText };
    }

    // Web3Forms подтверждает успешную обработку полем success: true.
    if (!response.ok || result.success !== true) {
      const apiMessage = result.error || result.message || result.body?.message;
      const error = new Error(apiMessage || `Web3Forms вернул HTTP ${response.status}`);
      error.status = response.status;
      error.apiCode = result.code || result.error_code || '';
      throw error;
    }

    notificationStatus.textContent = 'Готово! Твой выбор отправлен. ♥';
    notificationStatus.className = 'notification-status is-success';
    modalAccept.textContent = 'Выбрано ♥';
    document.querySelectorAll('[data-coupon]').forEach((button) => {
      button.classList.toggle('is-chosen', button.dataset.coupon === coupon.key);
      const cue = button.querySelector('.coupon-bottom span:last-child');
      if (cue && button.dataset.coupon === coupon.key) cue.textContent = 'ВЫБРАНО ♥';
    });
  } catch (error) {
    console.error('Не удалось отправить уведомление о подарке через Web3Forms:', error);
    const reason = String(error && error.message ? error.message : error);
    const lowerReason = reason.toLowerCase();

    if (error instanceof TypeError || lowerReason.includes('failed to fetch') || lowerReason.includes('networkerror')) {
      notificationStatus.textContent = 'Не удалось связаться с Web3Forms. Проверь интернет и попробуй ещё раз.';
    } else if (lowerReason.includes('invalid') && (lowerReason.includes('key') || lowerReason.includes('access'))) {
      notificationStatus.textContent = 'Web3Forms не принял Access Key. Проверь, что в проект вставлен ключ из твоей формы Web3Forms.';
    } else if (lowerReason.includes('domain') && (lowerReason.includes('allow') || lowerReason.includes('restrict'))) {
      notificationStatus.textContent = 'Web3Forms отклонил домен сайта. Проверь настройки формы и разрешённые домены в Web3Forms.';
    } else if (error.status === 429 || lowerReason.includes('too many requests') || lowerReason.includes('rate limit')) {
      notificationStatus.textContent = 'Слишком много попыток подряд. Подожди немного и попробуй ещё раз.';
    } else if (lowerReason.includes('quota') || lowerReason.includes('limit exceeded')) {
      notificationStatus.textContent = 'У формы Web3Forms закончился лимит отправок. Проверь лимит в личном кабинете сервиса.';
    } else {
      notificationStatus.textContent = `Web3Forms не отправил письмо: ${reason}`;
    }
    notificationStatus.className = 'notification-status is-error';
    modalAccept.disabled = false;
    modalAccept.textContent = 'Повторить отправку';
  } finally {
    isSendingGift = false;
  }
}

modalAccept.addEventListener('click', () => {
  if (selectedCoupon) sendGiftNotification(selectedCoupon);
});

function closeModal() {
  if (isSendingGift) return;
  modal.hidden = true;
}
document.getElementById('modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) closeModal();
});

function launchHeartMoment() {
  const count = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 9;
  const container = document.createElement('div');
  container.className = 'heart-moment';
  container.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement('span');
    heart.textContent = i % 3 === 0 ? '✦' : '♥';
    heart.style.setProperty('--drift', `${(Math.random() - 0.5) * 180}px`);
    heart.style.setProperty('--delay', `${Math.random() * 280}ms`);
    container.appendChild(heart);
  }
  document.body.appendChild(container);
  window.setTimeout(() => container.remove(), 1900);
}
