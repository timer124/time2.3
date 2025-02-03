// المتغيرات العامة للبومودورو
let timeLeft;
let timerId = null;
let workTime = 25 * 60;
let shortBreakTime = 10 * 60;
let longBreakTime = 15 * 60;
let completedPomodoros = 0;
let pomodorosUntilLongBreak = 4;

// تعريف الألوان وعتبات التحذير
const COLOR_CODES = {
  alert: {
    color: 'timer-path-alert',
    threshold: 33,
  },
  warning: {
    color: 'timer-path-warning',
    threshold: 66,
  },
};

// عناصر البومودورو
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const toggleButton = document.getElementById('toggle-timer');
const resetButton = document.getElementById('reset');
const pomodoroButton = document.getElementById('pomodoro');
const shortBreakButton = document.getElementById('short-break');
const longBreakButton = document.getElementById('long-break');

// عناصر القائمة الجانبية
const toggleSidebarButton = document.getElementById('toggle-sidebar');
const showSidebarButton = document.getElementById('show-sidebar');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const sectionHeaders = document.querySelectorAll('.section-header');
const workTimeInput = document.getElementById('work-time');
const shortBreakTimeInput = document.getElementById('short-break-time');
const longBreakTimeInput = document.getElementById('long-break-time');

// عناصر قائمة المهام
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const tasksPopup = document.getElementById('tasks-popup');
const showTasksButton = document.getElementById('show-tasks');
const closeTasksPopup = document.getElementById('close-tasks-popup');

// عناصر إعدادات المظهر
const lightThemeBtn = document.getElementById('light-theme');
const darkThemeBtn = document.getElementById('dark-theme');

// عناصر إعدادات اللغة
const arabicLangBtn = document.getElementById('arabic-lang');
const englishLangBtn = document.getElementById('english-lang');

// متغيرات المؤقت
const timeLeftDisplay = document.querySelector('.time-left');
const timerLabel = document.querySelector('.timer-label');
const timerPathRemaining = document.querySelector('.timer-path-remaining');
const timerPathElapsed = document.querySelector('.timer-path-elapsed');
const timerTypeButtons = document.querySelectorAll('.timer-type-button');

// حساب محيط الدائرة (2 * π * r)
const FULL_DASH_ARRAY = 2 * Math.PI * 45;

let currentTimer = 'work';
let isTimerRunning = false;
const toggleIcon = toggleButton.querySelector('i');

// تهيئة المؤقت
function initializeTimer(seconds) {
  clearInterval(timerId);
  timeLeft = seconds;
  currentDuration = seconds;
  updateTimer();
  setCircleDasharray();
  setRemainingPathColor();
}

// تحديث المؤقت
function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timeLeftDisplay.textContent = `${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  setCircleDasharray();
  setRemainingPathColor();
}

// تبديل حالة المؤقت
function toggleTimer() {
  if (isTimerRunning) {
    pauseTimer();
    toggleIcon.classList.remove('fa-pause');
    toggleIcon.classList.add('fa-play');
    isTimerRunning = false;
  } else {
    startTimer();
    toggleIcon.classList.remove('fa-play');
    toggleIcon.classList.add('fa-pause');
    isTimerRunning = true;
  }
}

// تشغيل المؤقت
function startTimer() {
  if (timerId === null) {
    timerId = setInterval(() => {
      timeLeft--;
      if (timeLeft < 0) {
        clearInterval(timerId);
        timerId = null;
        isTimerRunning = false;
        toggleIcon.classList.remove('fa-pause');
        toggleIcon.classList.add('fa-play');
        playAlarm();
        if (currentTimer === 'work') {
          if (++completedPomodoros % pomodorosUntilLongBreak === 0) {
            setTimer('longBreak');
          } else {
            setTimer('shortBreak');
          }
        } else {
          setTimer('work');
        }
        return;
      }
      updateTimer();
    }, 1000);
  }
}

// إيقاف المؤقت مؤقتاً
function pauseTimer() {
  clearInterval(timerId);
  timerId = null;
}

// إعادة ضبط المؤقت
function resetTimer() {
  clearInterval(timerId);
  timerId = null;
  isTimerRunning = false;
  toggleIcon.classList.remove('fa-pause');
  toggleIcon.classList.add('fa-play');
  initializeTimer(currentDuration);
}

// حساب النسبة المئوية للوقت المتبقي
function calculateTimePercentage() {
  return (timeLeft / currentDuration) * 100;
}

// تحديث طول المسار المتبقي
function setCircleDasharray() {
  const percentage = calculateTimePercentage();
  const dashoffset = ((100 - percentage) / 100) * FULL_DASH_ARRAY;

  // تعيين طول المسار الكامل والجزء المتبقي
  timerPathRemaining.style.strokeDasharray = `${FULL_DASH_ARRAY} ${FULL_DASH_ARRAY}`;
  timerPathRemaining.style.strokeDashoffset = dashoffset;
}

// تحديث لون المسار المتبقي
function setRemainingPathColor() {
  const { alert, warning } = COLOR_CODES;
  const timeLeft = timeLeftDisplay.textContent;
  const [minutes] = timeLeft.split(':').map(Number);
  const percentage = (minutes / (currentDuration / 60)) * 100;

  if (percentage <= alert.threshold) {
    timerPathRemaining.classList.remove(warning.color);
    timerPathRemaining.classList.add(alert.color);
  } else if (percentage <= warning.threshold) {
    timerPathRemaining.classList.remove(alert.color);
    timerPathRemaining.classList.add(warning.color);
  } else {
    timerPathRemaining.classList.remove(warning.color, alert.color);
  }
}

// تهيئة الدائرة
function initializeCircle() {
  // تعيين القيم الأولية
  timerPathRemaining.style.strokeDasharray = `${FULL_DASH_ARRAY} ${FULL_DASH_ARRAY}`;
  timerPathRemaining.style.strokeDashoffset = 0;

  // تعيين الألوان الأولية
  timerPathRemaining.style.stroke = 'var(--timer-color)';
  timerPathElapsed.style.stroke = 'var(--timer-background)';
}

// تعيين نوع المؤقت
function setTimer(type) {
  currentTimer = type;
  // إزالة الفئة النشطة من جميع الأزرار
  timerTypeButtons.forEach((button) => button.classList.remove('active'));

  switch (type) {
    case 'work':
      currentDuration = workTime;
      timerLabel.textContent = 'العمل';
      document.getElementById('pomodoro').classList.add('active');
      break;
    case 'shortBreak':
      currentDuration = shortBreakTime;
      timerLabel.textContent = 'استراحة قصيرة';
      document.getElementById('short-break').classList.add('active');
      break;
    case 'longBreak':
      currentDuration = longBreakTime;
      timerLabel.textContent = 'استراحة طويلة';
      document.getElementById('long-break').classList.add('active');
      break;
  }
  initializeTimer(currentDuration);
}

// إضافة مستمعي الأحداث لأزرار نوع المؤقت
timerTypeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const timerType =
      button.id === 'pomodoro'
        ? 'work'
        : button.id === 'short-break'
        ? 'shortBreak'
        : 'longBreak';
    switchTimerType(timerType);
  });
});

// تشغيل صوت التنبيه
function playAlarm() {
  const audio = new Audio(
    'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
  );
  audio.play();
}

// تحديث نوع المؤقت مع الحركة الانتقالية
function switchTimerType(type) {
  const timerContainer = document.querySelector('.timer-container');
  const timerDisplay = document.querySelector('.timer-display');
  const timerCircle = document.querySelector('.timer-circle');
  const activeButton = document.querySelector('.timer-type-button.active');
  const targetButton = document.getElementById(type);
  const timerLabel = document.querySelector('.timer-label');

  // التحقق من وجود العناصر المطلوبة
  if (!timerContainer || !timerDisplay || !timerCircle || !timerLabel) {
    console.error('لم يتم العثور على عناصر المؤقت المطلوبة');
    return;
  }

  // التحقق من وجود الزر المستهدف
  if (!targetButton) {
    console.error(`لم يتم العثور على زر بمعرف "${type}"`);
    return;
  }

  // إزالة فئات الحركة الانتقالية أولاً
  timerContainer.classList.remove('changing');
  timerDisplay.classList.remove('switching');
  timerCircle.classList.remove('switching');

  // تأخير قصير قبل إضافة الفئات مرة أخرى
  setTimeout(() => {
    // إضافة فئات الحركة الانتقالية
    timerContainer.classList.add('changing');
    timerDisplay.classList.add('switching');
    timerCircle.classList.add('switching');

    // تحديث نوع المؤقت في الحاوية
    timerContainer.dataset.timerType = type;

    // إزالة الفئة النشطة من الزر الحالي
    if (activeButton) {
      activeButton.classList.remove('active');
    }

    // إضافة الفئة النشطة للزر الجديد
    targetButton.classList.add('active');

    // تأخير تحديث المؤقت للسماح بالحركة الانتقالية
    setTimeout(() => {
      switch (type) {
        case 'pomodoro':
          currentTimer = 'work';
          currentDuration = workTime;
          timerLabel.setAttribute('data-translate', 'timer-work');
          timerLabel.textContent = translations[currentLang]['timer-work'];
          break;
        case 'short-break':
          currentTimer = 'shortBreak';
          currentDuration = shortBreakTime;
          const labelKey2 = `timer-${type}`;
          timerLabel.setAttribute('data-translate', labelKey2);
          timerLabel.textContent = translations[currentLang][labelKey2];
          break;
        case 'long-break':
          currentTimer = 'longBreak';
          currentDuration = longBreakTime;
          const labelKey3 = `timer-${type}`;
          timerLabel.setAttribute('data-translate', labelKey3);
          timerLabel.textContent = translations[currentLang][labelKey3];
          break;
      }

      // إعادة تعيين المؤقت
      initializeTimer(currentDuration);

      // إزالة فئات الحركة الانتقالية
      setTimeout(() => {
        timerContainer.classList.remove('changing');
        timerDisplay.classList.remove('switching');
        timerCircle.classList.remove('switching');
      }, 300);
    }, 150);
  }, 50);
}

// تبديل حالة قسم في القائمة الجانبية
function toggleSection(header) {
  const section = header.closest('.sidebar-section');
  const content = section.querySelector('.section-content');
  const chevronIcon = header.querySelector('.fa-chevron-down');
  const isCollapsed = header.classList.contains('collapsed');

  // إغلاق جميع الأقسام الأخرى
  sectionHeaders.forEach((otherHeader) => {
    if (
      otherHeader !== header &&
      !otherHeader.classList.contains('collapsed')
    ) {
      const otherSection = otherHeader.closest('.sidebar-section');
      const otherContent = otherSection.querySelector('.section-content');
      const otherChevron = otherHeader.querySelector('.fa-chevron-down');

      otherHeader.classList.add('collapsed');
      otherContent.classList.add('collapsed');
      otherChevron.style.transform = 'rotate(-180deg)';
    }
  });

  // تبديل حالة القسم الحالي
  header.classList.toggle('collapsed');
  content.classList.toggle('collapsed');

  // تحريك الأيقونة
  if (isCollapsed) {
    chevronIcon.style.transform = 'rotate(0deg)';
  } else {
    chevronIcon.style.transform = 'rotate(-180deg)';
  }

  // حفظ حالة الأقسام
  const sectionStates = {};
  sectionHeaders.forEach((h) => {
    sectionStates[h.dataset.section] = h.classList.contains('collapsed');
  });
  localStorage.setItem('sectionStates', JSON.stringify(sectionStates));
}

// تحديث إعدادات المؤقت
function updateTimerSettings() {
  workTime = workTimeInput.value * 60;
  shortBreakTime = shortBreakTimeInput.value * 60;
  longBreakTime = longBreakTimeInput.value * 60;

  // إذا كان المؤقت الحالي هو نفس النوع الذي تم تحديثه، قم بتحديث الوقت المتبقي
  if (pomodoroButton.classList.contains('active')) {
    initializeTimer(workTime);
  } else if (shortBreakButton.classList.contains('active')) {
    initializeTimer(shortBreakTime);
  } else if (longBreakButton.classList.contains('active')) {
    initializeTimer(longBreakTime);
  }

  // حفظ الإعدادات في التخزين المحلي
  saveSettings();
}

// حفظ الإعدادات
function saveSettings() {
  localStorage.setItem(
    'timerSettings',
    JSON.stringify({
      workTime: workTimeInput.value,
      shortBreakTime: shortBreakTimeInput.value,
      longBreakTime: longBreakTimeInput.value,
    })
  );
}

// استعادة الإعدادات
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('timerSettings'));
  if (settings) {
    workTimeInput.value = settings.workTime;
    shortBreakTimeInput.value = settings.shortBreakTime;
    longBreakTimeInput.value = settings.longBreakTime;
    updateTimerSettings();
  }
}

// إضافة مهمة جديدة
function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText) {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">${taskText}</span>
            <button class="delete-task"><i class="fas fa-trash"></i></button>
        `;
    taskList.appendChild(taskItem);
    taskInput.value = '';
    saveTasksToLocalStorage();
  }
}

// حذف مهمة
function deleteTask(taskElement) {
  taskElement.remove();
  saveTasksToLocalStorage();
}

// تحديث حالة المهمة
function toggleTaskComplete(checkbox, taskItem) {
  taskItem.classList.toggle('completed', checkbox.checked);
  saveTasksToLocalStorage();
}

// حفظ المهام في التخزين المحلي
function saveTasksToLocalStorage() {
  const tasks = [];
  document.querySelectorAll('.task-item').forEach((taskItem) => {
    tasks.push({
      text: taskItem.querySelector('.task-text').textContent,
      completed: taskItem.classList.contains('completed'),
    });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// استعادة المهام من التخزين المحلي
function loadTasksFromLocalStorage() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach((task) => {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item' + (task.completed ? ' completed' : '');
    taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${
              task.completed ? 'checked' : ''
            }>
            <span class="task-text">${task.text}</span>
            <button class="delete-task"><i class="fas fa-trash"></i></button>
        `;
    taskList.appendChild(taskItem);
  });
}

// تبديل حالة القائمة الجانبية
function toggleSidebar() {
  // التبديل بين expanded و collapsed
  if (sidebar.classList.contains('expanded')) {
    sidebar.classList.remove('expanded');
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');
    showSidebarButton.style.display = 'block';
  } else {
    sidebar.classList.remove('collapsed');
    sidebar.classList.add('expanded');
    mainContent.classList.remove('expanded');
    showSidebarButton.style.display = 'none';
  }

  // حفظ حالة القائمة الجانبية
  localStorage.setItem(
    'sidebarCollapsed',
    sidebar.classList.contains('collapsed')
  );
}

// استعادة حالة القائمة الجانبية والأقسام
function restoreSidebarState() {
  // استعادة حالة القائمة الجانبية
  const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (sidebarCollapsed) {
    sidebar.classList.remove('expanded');
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');
    showSidebarButton.style.display = 'block';
  } else {
    sidebar.classList.remove('collapsed');
    sidebar.classList.add('expanded');
    mainContent.classList.remove('expanded');
    showSidebarButton.style.display = 'none';
  }

  // استعادة حالة الأقسام
  const sectionStates = JSON.parse(
    localStorage.getItem('sectionStates') || '{}'
  );
  let hasOpenSection = false;

  sectionHeaders.forEach((header) => {
    const isCollapsed = sectionStates[header.dataset.section];
    const section = header.closest('.sidebar-section');
    const content = section.querySelector('.section-content');

    if (!isCollapsed && !hasOpenSection) {
      // فتح أول قسم غير مغلق فقط
      header.classList.remove('collapsed');
      content.classList.remove('collapsed');
      hasOpenSection = true;
    } else {
      header.classList.add('collapsed');
      content.classList.add('collapsed');
    }
  });
}

// تغيير المظهر
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  // تحديث حالة الأزرار
  if (theme === 'dark') {
    darkThemeBtn.classList.add('active');
    lightThemeBtn.classList.remove('active');
  } else {
    lightThemeBtn.classList.add('active');
    darkThemeBtn.classList.remove('active');
  }
}

// استعادة المظهر المحفوظ
function restoreTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
}

// تبديل حالة النافذة المنبثقة للمهام
function toggleTasksPopup() {
  tasksPopup.classList.toggle('active');
}

// إغلاق النافذة المنبثقة عند النقر خارجها
function closePopupOnOutsideClick(event) {
  if (event.target === tasksPopup) {
    toggleTasksPopup();
  }
}

// نظام الترجمة
const translations = {
  ar: {
    'timer-settings': 'إعدادات المؤقت',
    'work-time': 'وقت العمل (دقائق)',
    'short-break': 'استراحة قصيرة (دقائق)',
    'long-break': 'استراحة طويلة (دقائق)',
    'general-settings': 'إعدادات عامة',
    'appearance-mode': 'وضع المظهر',
    'light-mode': 'نهاري',
    'dark-mode': 'ليلي',
    language: 'اللغة',
    background: 'خلفية الموقع',
    menu: 'القائمة',
    arabic: 'العربية',
    work: 'العمل',
    'work-button': 'عمل',
    'short-break-button': 'استراحة قصيرة',
    'long-break-button': 'استراحة طويلة',
    'tasks-list': 'قائمة المهام',
    'add-task-placeholder': 'أضف مهمة جديدة...',
    'background-1': 'خلفية 1',
    'background-2': 'خلفية 2',
    'background-3': 'خلفية 3',
    'background-4': 'خلفية 4',
    'background-5': 'خلفية 5',
    'page-title': 'بومودورو وقائمة المهام',
    'timer-work': 'العمل',
    'timer-short-break': 'استراحة قصيرة',
    'timer-long-break': 'استراحة طويلة',
  },
  en: {
    'timer-settings': 'Timer Settings',
    'work-time': 'Work Time (minutes)',
    'short-break': 'Short Break (minutes)',
    'long-break': 'Long Break (minutes)',
    'general-settings': 'General Settings',
    'appearance-mode': 'Appearance Mode',
    'light-mode': 'Light',
    'dark-mode': 'Dark',
    language: 'Language',
    background: 'Background',
    menu: 'Menu',
    arabic: 'Arabic',
    work: 'Work',
    'work-button': 'Work',
    'short-break-button': 'Short Break',
    'long-break-button': 'Long Break',
    'tasks-list': 'Tasks List',
    'add-task-placeholder': 'Add new task...',
    'background-1': 'Background 1',
    'background-2': 'Background 2',
    'background-3': 'Background 3',
    'background-4': 'Background 4',
    'background-5': 'Background 5',
    'page-title': 'Pomodoro & Tasks List',
    'timer-work': 'Work',
    'timer-short-break': 'Short Break',
    'timer-long-break': 'Long Break',
  },
};

let currentLang = 'ar';

function translatePage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  localStorage.setItem('preferred-language', lang);

  // ترجمة جميع العناصر التي تحتوي على خاصية data-translate
  document.querySelectorAll('[data-translate]').forEach((element) => {
    const key = element.getAttribute('data-translate');
    if (translations[lang][key]) {
      if (
        element.tagName.toLowerCase() === 'input' &&
        element.getAttribute('type') === 'text'
      ) {
        element.placeholder = translations[lang][key];
      } else {
        element.textContent = translations[lang][key];
      }
    }
  });

  // تحديث نص حالة المؤقت الحالية
  const timerLabel = document.querySelector('.timer-label');
  const currentKey = timerLabel.getAttribute('data-translate');
  if (currentKey && translations[lang][currentKey]) {
    timerLabel.textContent = translations[lang][currentKey];
  }
}

// استدعاء عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // التحقق من وجود لغة مفضلة في localStorage
  const savedLang = localStorage.getItem('preferred-language');
  if (savedLang) {
    translatePage(savedLang);
  }

  // إضافة مستمعي الأحداث لأزرار تغيير اللغة
  document.getElementById('arabic-lang').addEventListener('click', () => {
    translatePage('ar');
    document.getElementById('arabic-lang').classList.add('active');
    document.getElementById('english-lang').classList.remove('active');
  });

  document.getElementById('english-lang').addEventListener('click', () => {
    translatePage('en');
    document.getElementById('english-lang').classList.add('active');
    document.getElementById('arabic-lang').classList.remove('active');
  });
});

// تغيير خلفية الموقع
function changeBackground(bgElement) {
  // إزالة الفئة النشطة من جميع الخلفيات
  document.querySelectorAll('.background-option').forEach((bg) => {
    bg.classList.remove('active');
  });

  // إضافة الفئة النشطة للخلفية المختارة
  bgElement.classList.add('active');

  // الحصول على مسار الصورة
  const imgSrc = bgElement.querySelector('img').src;

  // تطبيق الخلفية على الصفحة
  document.body.style.backgroundImage = `url(${imgSrc})`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundAttachment = 'fixed';

  // حفظ الخلفية المختارة في التخزين المحلي
  localStorage.setItem('selectedBackground', imgSrc);

  // إغلاق القائمة الجانبية
  if (sidebar.classList.contains('expanded')) {
    toggleSidebar();
  }
}

// استعادة الخلفية المحفوظة
function restoreBackground() {
  const savedBg = localStorage.getItem('selectedBackground');
  if (savedBg) {
    document.body.style.backgroundImage = `url(${savedBg})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';

    // تحديد الخلفية النشطة في القائمة
    const bgOptions = document.querySelectorAll('.background-option');
    bgOptions.forEach((bg) => {
      if (bg.querySelector('img').src === savedBg) {
        bg.classList.add('active');
      }
    });
  }
}

// إضافة مستمع الأحداث لخيارات الخلفية
const backgroundOptions = document.querySelectorAll('.background-option');
if (backgroundOptions) {
  backgroundOptions.forEach((bg) => {
    if (bg) {
      bg.addEventListener('click', () => changeBackground(bg));
    }
  });
}

// تهيئة الإعدادات الافتراضية
function initializeDefaultSettings() {
  workTimeInput.value = '25';
  shortBreakTimeInput.value = '10';
  longBreakTimeInput.value = '15';

  workTime = 25 * 60;
  shortBreakTime = 10 * 60;
  longBreakTime = 15 * 60;

  saveSettings();
  initializeTimer(workTime);
  switchTimerType('pomodoro');
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  initializeCircle();
  if (!localStorage.getItem('timerSettings')) {
    initializeDefaultSettings();
  } else {
    loadSettings();
  }
  loadTasksFromLocalStorage();
  initializeTimer(workTime);
  restoreSidebarState();
  restoreTheme();
  restoreBackground();
  restoreLanguage();
});

// إضافة مستمعي الأحداث
if (toggleButton) {
  toggleButton.addEventListener('click', toggleTimer);
}
if (resetButton) {
  resetButton.addEventListener('click', resetTimer);
}
if (pomodoroButton) {
  pomodoroButton.addEventListener('click', () => switchTimerType('pomodoro'));
}
if (shortBreakButton) {
  shortBreakButton.addEventListener('click', () =>
    switchTimerType('short-break')
  );
}
if (longBreakButton) {
  longBreakButton.addEventListener('click', () =>
    switchTimerType('long-break')
  );
}

if (showTasksButton) {
  showTasksButton.addEventListener('click', toggleTasksPopup);
}
if (closeTasksPopup) {
  closeTasksPopup.addEventListener('click', toggleTasksPopup);
}
if (tasksPopup) {
  tasksPopup.addEventListener('click', closePopupOnOutsideClick);
}

if (taskInput) {
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });
}
if (addTaskButton) {
  addTaskButton.addEventListener('click', addTask);
}

if (toggleSidebarButton) {
  toggleSidebarButton.addEventListener('click', toggleSidebar);
}
if (showSidebarButton) {
  showSidebarButton.addEventListener('click', toggleSidebar);
}

sectionHeaders.forEach((header) => {
  if (header) {
    header.addEventListener('click', () => toggleSection(header));
  }
});

if (workTimeInput) {
  workTimeInput.addEventListener('change', updateTimerSettings);
}
if (shortBreakTimeInput) {
  shortBreakTimeInput.addEventListener('change', updateTimerSettings);
}
if (longBreakTimeInput) {
  longBreakTimeInput.addEventListener('change', updateTimerSettings);
}

if (taskList) {
  taskList.addEventListener('click', (e) => {
    if (
      e.target.classList.contains('delete-task') ||
      e.target.parentElement.classList.contains('delete-task')
    ) {
      deleteTask(e.target.closest('.task-item'));
    }
  });
}

if (taskList) {
  taskList.addEventListener('change', (e) => {
    if (e.target.classList.contains('task-checkbox')) {
      toggleTaskComplete(e.target, e.target.closest('.task-item'));
    }
  });
}

if (lightThemeBtn) {
  lightThemeBtn.addEventListener('click', () => setTheme('light'));
}
if (darkThemeBtn) {
  darkThemeBtn.addEventListener('click', () => setTheme('dark'));
}

if (arabicLangBtn) {
  arabicLangBtn.addEventListener('click', () => setLanguage('ar'));
}
if (englishLangBtn) {
  englishLangBtn.addEventListener('click', () => setLanguage('en'));
}

// إغلاق القائمة الجانبية عند النقر خارجها
function closeSidebarOnOutsideClick(event) {
  if (
    sidebar.classList.contains('expanded') &&
    !sidebar.contains(event.target) &&
    !showSidebarButton.contains(event.target)
  ) {
    toggleSidebar();
  }
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  initializeCircle();
  if (!localStorage.getItem('timerSettings')) {
    initializeDefaultSettings();
  } else {
    loadSettings();
  }
  loadTasksFromLocalStorage();
  initializeTimer(workTime);
  restoreSidebarState();
  restoreTheme();
  restoreBackground();
  restoreLanguage();

  // إضافة مستمع حدث للنقر خارج القائمة الجانبية
  document.addEventListener('click', closeSidebarOnOutsideClick);
});

// تغيير اللغة
function setLanguage(lang) {
  // إزالة الفئة النشطة من جميع الأزرار
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  // إضافة الفئة النشطة للزر المحدد
  if (lang === 'ar') {
    arabicLangBtn.classList.add('active');
    document.documentElement.setAttribute('lang', 'ar');
    document.documentElement.setAttribute('dir', 'rtl');
    document.body.classList.remove('ltr');
    document.body.classList.add('rtl');
    localStorage.setItem('selectedLanguage', 'ar');
  } else {
    englishLangBtn.classList.add('active');
    document.documentElement.setAttribute('lang', 'en');
    document.documentElement.setAttribute('dir', 'ltr');
    document.body.classList.remove('rtl');
    document.body.classList.add('ltr');
    localStorage.setItem('selectedLanguage', 'en');
  }

  // إزالة فئة collapsed وإضافة expanded للقائمة الجانبية
  sidebar.classList.remove('collapsed');
  sidebar.classList.add('expanded');
  mainContent.classList.remove('expanded');
  showSidebarButton.style.display = 'none';
  localStorage.setItem('sidebarCollapsed', 'false');
}

// استعادة اللغة المحفوظة
function restoreLanguage() {
  const savedLanguage = localStorage.getItem('selectedLanguage') || 'ar';
  setLanguage(savedLanguage);
}
