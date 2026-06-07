const STORAGE_KEY = 'easygradeEnquiries';
const STUDENT_ACCOUNTS_KEY = 'easygradeStudentAccounts';
const STUDENT_SESSION_KEY = 'easygradeStudentSession';
const TUTOR_SESSION_KEY = 'easygradeTutorSession';
const QUIZZES_KEY = 'easygradeQuizzes';
const TUTOR_EMAIL = 'tutor@example.com';
const TUTOR_PASSWORD = 'tutor123';

function getEnquiries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function saveEnquiries(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getStudentAccounts() {
  const raw = localStorage.getItem(STUDENT_ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function saveStudentAccounts(accounts) {
  localStorage.setItem(STUDENT_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function findStudentAccount(email) {
  const accounts = getStudentAccounts();
  return accounts.find(account => account.email.toLowerCase() === email.toLowerCase());
}

function createStudentAccount(email, password) {
  const accounts = getStudentAccounts();
  if (findStudentAccount(email)) {
    return false;
  }
  accounts.push({ email, password });
  saveStudentAccounts(accounts);
  return true;
}

function validateStudentLogin(email, password) {
  const account = findStudentAccount(email);
  return account && account.password === password;
}

function getSession(storageKey) {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function getCurrentSession(role) {
  if (role === 'student') return getSession(STUDENT_SESSION_KEY);
  if (role === 'tutor') return getSession(TUTOR_SESSION_KEY);
  return getAnySession();
}

function getAnySession() {
  return getSession(STUDENT_SESSION_KEY) || getSession(TUTOR_SESSION_KEY);
}

function setCurrentSession(session) {
  if (!session || !session.role) return;
  // Clear the other role's session to ensure only one role is logged in at a time
  const otherRole = session.role === 'student' ? 'tutor' : 'student';
  clearSession(otherRole);
  const storageKey = session.role === 'student' ? STUDENT_SESSION_KEY : TUTOR_SESSION_KEY;
  localStorage.setItem(storageKey, JSON.stringify(session));
}

function clearSession(role) {
  if (role === 'student') {
    localStorage.removeItem(STUDENT_SESSION_KEY);
    return;
  }
  if (role === 'tutor') {
    localStorage.removeItem(TUTOR_SESSION_KEY);
    return;
  }
  localStorage.removeItem(STUDENT_SESSION_KEY);
  localStorage.removeItem(TUTOR_SESSION_KEY);
}

function getPageRole() {
  if (document.getElementById('studentLogoutButton') || document.getElementById('studentEnquiryTitle') || document.getElementById('studentLoginForm')) {
    return 'student';
  }
  if (document.getElementById('tutorLogoutButton') || document.getElementById('tutorLoginForm') || document.getElementById('enquiryCount')) {
    return 'tutor';
  }
  return null;
}

function addEnquiry(enquiry) {
  const enquiries = getEnquiries();
  enquiries.unshift(enquiry);
  saveEnquiries(enquiries);
}

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? '#b91c1c' : '#065f46';
}

function renderTutorEnquiries() {
  const list = document.getElementById('tutorEnquiriesList');
  const count = document.getElementById('enquiryCount');
  if (!list || !count) return;
  const enquiries = getEnquiries();
  count.textContent = enquiries.length;
  if (enquiries.length === 0) {
    list.innerHTML = '<p>No enquiries yet. Students can submit their request from the home page.</p>';
    return;
  }
  list.innerHTML = enquiries.map(enquiry => `
    <article class="enquiry-item">
      <h3>${escapeHtml(enquiry.subject)}</h3>
      <p><strong>Name:</strong> ${escapeHtml(enquiry.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(enquiry.phone || '')}</p>
      <p><strong>Message:</strong> ${escapeHtml(enquiry.message)}</p>
      <p><small>Submitted on ${new Date(enquiry.createdAt).toLocaleString()}</small></p>
    </article>
  `).join('');
}

function renderStudentEnquiries(email) {
  const list = document.getElementById('studentEnquiriesList');
  const panel = document.getElementById('studentEnquiriesPanel');
  if (!list || !panel) return;
  const enquiries = getEnquiries().filter(item => item.email.toLowerCase() === email.toLowerCase());
  panel.style.display = 'block';
  if (enquiries.length === 0) {
    list.innerHTML = '<p>No enquiries found for this email. Try submitting a new enquiry first.</p>';
    return;
  }
  list.innerHTML = enquiries.map(enquiry => `
      <article class="student-enquiry-item">
        <h3>${escapeHtml(enquiry.subject)}</h3>
        <p><strong>Name:</strong> ${escapeHtml(enquiry.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(enquiry.phone || '')}</p>
        <p><strong>Details:</strong> ${escapeHtml(enquiry.message)}</p>
        <p><small>Submitted on ${new Date(enquiry.createdAt).toLocaleString()}</small></p>
      </article>
    `).join('');
}

function getQuizzes() {
  const raw = localStorage.getItem(QUIZZES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function saveQuizzes(items) {
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(items));
}

function addQuiz(quiz) {
  const quizzes = getQuizzes();
  quizzes.unshift(quiz);
  saveQuizzes(quizzes);
}

function renderTutorQuizzes() {
  const list = document.getElementById('tutorQuizList');
  const listPanel = document.getElementById('tutorQuizListPanel');
  if (!list || !listPanel) return;
  const quizzes = getQuizzes();
  listPanel.style.display = 'block';
  if (quizzes.length === 0) {
    list.innerHTML = '<p>No quizzes published yet. Use the form above to create one.</p>';
    return;
  }
  list.innerHTML = quizzes.map(quiz => `
    <article class="quiz-item">
      <h3>${escapeHtml(quiz.title)}</h3>
      <p>${quiz.questions.length} question${quiz.questions.length === 1 ? '' : 's'}</p>
      <p><small>Published on ${new Date(quiz.createdAt).toLocaleDateString()}</small></p>
    </article>
  `).join('');
}

function renderStudentQuizzes() {
  const list = document.getElementById('studentQuizList');
  const panel = document.getElementById('studentQuizzesPanel');
  if (!list || !panel) return;
  const quizzes = getQuizzes();
  panel.style.display = 'block';
  if (quizzes.length === 0) {
    list.innerHTML = '<p>No quizzes are available right now. Check back later.</p>';
    return;
  }
  list.innerHTML = quizzes.map(quiz => `
    <article class="quiz-item">
      <h3>${escapeHtml(quiz.title)}</h3>
      <p>${quiz.questions.length} question${quiz.questions.length === 1 ? '' : 's'}</p>
      <button class="button secondary start-quiz-btn" data-quiz-id="${escapeHtml(quiz.id)}">Start Quiz</button>
    </article>
  `).join('');
  const startButtons = document.querySelectorAll('.start-quiz-btn');
  startButtons.forEach(button => {
    button.addEventListener('click', () => {
      startQuiz(button.dataset.quizId);
    });
  });
}

function startQuiz(quizId) {
  const quizzes = getQuizzes();
  const quiz = quizzes.find(item => item.id === quizId);
  if (!quiz) return;

  const modal = document.createElement('div');
  modal.className = 'quiz-modal-overlay';
  modal.innerHTML = `
    <div class="quiz-modal">
      <div class="quiz-modal-header">
        <h2>${escapeHtml(quiz.title)}</h2>
        <div class="quiz-timer" id="quizTimer">01:00</div>
      </div>
      <div class="quiz-modal-body" id="quizModalBody"></div>
      <div class="quiz-modal-actions">
        <button class="button secondary" id="cancelQuizBtn">Cancel</button>
        <button class="button" id="submitQuizBtn">Submit Answers</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const body = modal.querySelector('#quizModalBody');
  const submitButton = modal.querySelector('#submitQuizBtn');
  const cancelButton = modal.querySelector('#cancelQuizBtn');
  const timerEl = modal.querySelector('#quizTimer');

  body.innerHTML = quiz.questions.map((question, index) => `
    <div class="quiz-question">
      <p><strong>Q${index + 1}.</strong> ${escapeHtml(question.text)}</p>
      ${question.options.map((option, optionIndex) => `
        <label class="quiz-option">
          <input type="radio" name="question-${index}" value="${['A','B','C','D'][optionIndex]}" />
          <span>${escapeHtml(option)}</span>
        </label>
      `).join('')}
    </div>
  `).join('');

  let remaining = 60;
  const timerInterval = setInterval(() => {
    remaining -= 1;
    timerEl.textContent = `00:${String(remaining).padStart(2, '0')}`;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);

  function finishQuiz() {
    submitButton.disabled = true;
    cancelButton.disabled = true;
    const answers = quiz.questions.map((question, index) => {
      const selected = modal.querySelector(`input[name="question-${index}"]:checked`);
      return selected ? selected.value : null;
    });
    const scored = answers.reduce((score, answer, index) => score + (answer === quiz.questions[index].answer ? 1 : 0), 0);
    const resultText = `You scored ${scored} out of ${quiz.questions.length}.`;
    body.innerHTML = `<div class="quiz-result"><p>${escapeHtml(resultText)}</p></div>`;
    submitButton.remove();
    cancelButton.textContent = 'Close';
    cancelButton.disabled = false;
  }

  cancelButton.addEventListener('click', () => {
    clearInterval(timerInterval);
    document.body.removeChild(modal);
  });

  submitButton.addEventListener('click', () => {
    clearInterval(timerInterval);
    finishQuiz();
  });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function initEnquiryForm() {
  const form = document.getElementById('enquiryForm');
  const message = document.getElementById('enquiryMessage');
  if (!form || !message) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(form);
    const enquiry = {
      name: formData.get('name')?.toString().trim(),
      email: formData.get('email')?.toString().trim(),
      phone: formData.get('phone')?.toString().trim(),
      subject: formData.get('subject')?.toString().trim(),
      message: formData.get('message')?.toString().trim(),
      createdAt: new Date().toISOString(),
    };

    if (!enquiry.name || !enquiry.email || !enquiry.phone || !enquiry.subject || !enquiry.message) {
      showMessage(message, 'Please complete every field before sending.', true);
      return;
    }

    addEnquiry(enquiry);
    showMessage(message, 'Your enquiry was submitted successfully!');
    form.reset();
    window.history.replaceState({}, '', 'index.html');
  });
}

function validateTutorLogin(email, password) {
  return email === TUTOR_EMAIL && password === TUTOR_PASSWORD;
}

function toggleElement(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = show ? '' : 'none';
}

function initStudentDashboard() {
  const loginForm = document.getElementById('studentLoginForm');
  const signupForm = document.getElementById('studentSignupForm');
  const loginMessage = document.getElementById('studentLoginMessage');
  const signupMessage = document.getElementById('studentSignupMessage');
  const panel = document.getElementById('studentLoginPanel');
  const quizPanel = document.getElementById('studentQuizzesPanel');
  const logoutButton = document.getElementById('studentLogoutButton');
  const loginSection = document.getElementById('loginSection');
  const signupSection = document.getElementById('signupSection');
  const showLoginTab = document.getElementById('showLoginTab');
  const showSignupTab = document.getElementById('showSignupTab');

  if (!loginForm || !signupForm || !loginMessage || !signupMessage || !panel || !quizPanel || !loginSection || !signupSection || !showLoginTab || !showSignupTab) return;

  function showLoginView() {
    showLoginTab.classList.add('active');
    showSignupTab.classList.remove('active');
    loginSection.style.display = '';
    signupSection.style.display = 'none';
    loginMessage.textContent = '';
    signupMessage.textContent = '';
  }

  function showSignupView() {
    showLoginTab.classList.remove('active');
    showSignupTab.classList.add('active');
    loginSection.style.display = 'none';
    signupSection.style.display = '';
    loginMessage.textContent = '';
    signupMessage.textContent = '';
  }

  function displayStudentDashboard(email) {
    panel.style.display = 'none';
    quizPanel.style.display = 'block';
    renderStudentQuizzes();
  }

  function logoutStudent() {
    clearSession();
    panel.style.display = 'block';
    quizPanel.style.display = 'none';
    loginForm.reset();
    signupForm.reset();
    loginMessage.textContent = '';
    signupMessage.textContent = '';
    showLoginView();
  }

  showLoginTab.addEventListener('click', showLoginView);
  showSignupTab.addEventListener('click', showSignupView);

  const currentSession = getCurrentSession('student');
  if (currentSession?.role === 'student' && currentSession.email) {
    displayStudentDashboard(currentSession.email);
  } else {
    showLoginView();
  }

  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const email = data.get('email')?.toString().trim();
    const password = data.get('password')?.toString().trim();

    if (!email || !password) {
      showMessage(loginMessage, 'Enter email and password to login.', true);
      return;
    }

    if (!validateStudentLogin(email, password)) {
      showMessage(loginMessage, 'Invalid student credentials.', true);
      return;
    }

    setCurrentSession({ role: 'student', email });
    showMessage(loginMessage, 'Login successful. Loading available quizzes.');
    displayStudentDashboard(email);
    updateChatWidgetVisibility();
  });

  signupForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(signupForm);
    const email = data.get('email')?.toString().trim();
    const password = data.get('password')?.toString().trim();
    const confirmPassword = data.get('confirmPassword')?.toString().trim();

    if (!email || !password || !confirmPassword) {
      showMessage(signupMessage, 'Fill all fields to create an account.', true);
      return;
    }

    if (password !== confirmPassword) {
      showMessage(signupMessage, 'Passwords do not match.', true);
      return;
    }

    if (!createStudentAccount(email, password)) {
      showMessage(signupMessage, 'An account with this email already exists.', true);
      return;
    }

    showMessage(signupMessage, 'Account created successfully. You can now login.');
    signupForm.reset();
    showLoginView();
  });

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logoutStudent();
      clearSession('student');
      updateChatWidgetVisibility('student');
    });
  }
}

function initTutorDashboard() {
  const form = document.getElementById('tutorLoginForm');
  const message = document.getElementById('tutorLoginMessage');
  const loginPanel = document.getElementById('tutorLoginPanel');
  const summaryPanel = document.getElementById('tutorSummaryPanel');
  const enquiryPanel = document.getElementById('tutorEnquiriesPanel');
  const quizPanel = document.getElementById('tutorQuizPanel');
  const quizListPanel = document.getElementById('tutorQuizListPanel');
  const logoutButton = document.getElementById('tutorLogoutButton');
  const quizTitle = document.getElementById('quizTitle');
  const quizQuestionText = document.getElementById('quizQuestionText');
  const quizOptionA = document.getElementById('quizOptionA');
  const quizOptionB = document.getElementById('quizOptionB');
  const quizOptionC = document.getElementById('quizOptionC');
  const quizOptionD = document.getElementById('quizOptionD');
  const quizCorrectAnswer = document.getElementById('quizCorrectAnswer');
  const addQuestionBtn = document.getElementById('addQuizQuestionBtn');
  const publishQuizBtn = document.getElementById('publishQuizBtn');
  const quizDraftList = document.getElementById('tutorQuizDraftList');

  if (!form || !message || !loginPanel || !summaryPanel || !enquiryPanel || !quizPanel || !quizListPanel || !quizTitle || !quizQuestionText || !quizOptionA || !quizOptionB || !quizOptionC || !quizOptionD || !quizCorrectAnswer || !addQuestionBtn || !publishQuizBtn || !quizDraftList) return;

  let draftQuestions = [];

  function renderQuizDraft() {
    if (!quizDraftList) return;
    if (draftQuestions.length === 0) {
      quizDraftList.innerHTML = '<p class="quiz-draft-empty">No questions added yet.</p>';
      return;
    }
    quizDraftList.innerHTML = draftQuestions.map((question, index) => `
      <div class="quiz-draft-item">
        <strong>Q${index + 1}:</strong> ${escapeHtml(question.text)}
        <p class="quiz-draft-meta">Answer: ${escapeHtml(question.answer)} | ${question.options.length} options</p>
      </div>
    `).join('');
  }

  function resetQuizBuilder() {
    quizQuestionText.value = '';
    quizOptionA.value = '';
    quizOptionB.value = '';
    quizOptionC.value = '';
    quizOptionD.value = '';
    quizCorrectAnswer.value = 'A';
  }

  function showTutorDashboard() {
    loginPanel.style.display = 'none';
    summaryPanel.style.display = 'block';
    enquiryPanel.style.display = 'block';
    quizPanel.style.display = 'block';
    quizListPanel.style.display = 'block';
    renderTutorEnquiries();
    renderTutorQuizzes();
    renderQuizDraft();
  }

  function logoutTutor() {
    clearSession();
    loginPanel.style.display = 'block';
    summaryPanel.style.display = 'none';
    enquiryPanel.style.display = 'none';
    if (quizPanel) quizPanel.style.display = 'none';
    if (quizListPanel) quizListPanel.style.display = 'none';
    form.reset();
    message.textContent = '';
  }

  addQuestionBtn.addEventListener('click', () => {
    const questionText = quizQuestionText.value.trim();
    const options = [quizOptionA.value.trim(), quizOptionB.value.trim(), quizOptionC.value.trim(), quizOptionD.value.trim()];
    const answer = quizCorrectAnswer.value;

    if (!questionText || options.some(opt => !opt)) {
      showMessage(message, 'Provide the question and all four options before adding.', true);
      return;
    }

    draftQuestions.push({ text: questionText, options, answer });
    renderQuizDraft();
    resetQuizBuilder();
    showMessage(message, 'Question added to draft successfully.');
  });

  publishQuizBtn.addEventListener('click', () => {
    const title = quizTitle.value.trim();
    if (!title) {
      showMessage(message, 'Enter a title for the quiz before publishing.', true);
      return;
    }
    if (draftQuestions.length === 0) {
      showMessage(message, 'Add at least one question before publishing the quiz.', true);
      return;
    }

    addQuiz({
      id: `quiz-${Date.now()}`,
      title,
      questions: draftQuestions,
      createdAt: new Date().toISOString(),
    });
    draftQuestions = [];
    renderQuizDraft();
    renderTutorQuizzes();
    quizTitle.value = '';
    resetQuizBuilder();
    showMessage(message, 'Quiz published successfully. Students can now attempt it.');
  });

  const currentSession = getCurrentSession('tutor');
  if (currentSession?.role === 'tutor') {
    showTutorDashboard();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const email = data.get('email')?.toString().trim();
    const password = data.get('password')?.toString().trim();

    if (!email || !password) {
      showMessage(message, 'Enter email and password to login.', true);
      return;
    }

    if (!validateTutorLogin(email, password)) {
      showMessage(message, 'Invalid tutor credentials.', true);
      return;
    }

    setCurrentSession({ role: 'tutor', email });
    showMessage(message, 'Tutor login successful. Loading enquiries.');
    showTutorDashboard();
    updateChatWidgetVisibility();
  });

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logoutTutor();
      clearSession('tutor');
      updateChatWidgetVisibility('tutor');
    });
  }
}

function initHomePage() {
  const notice = document.getElementById('homeSessionNotice');
  const loginLink = document.querySelector('a[href="login.html"]');
  const enquirySection = document.getElementById('enquiry');
  const enquiryLinks = document.querySelectorAll('a[href="#enquiry"]');
  const studentSession = getCurrentSession('student');
  const tutorSession = getCurrentSession('tutor');

  if (tutorSession) {
    if (enquirySection) enquirySection.style.display = 'none';
    enquiryLinks.forEach(link => link.style.display = 'none');
    const summary = document.getElementById('homeTutorEnquirySummary');
    const summaryCount = document.getElementById('homeTutorEnquiryCount');
    if (summary && summaryCount) {
      summaryCount.textContent = String(getEnquiries().length);
      summary.style.display = 'block';
      summary.style.cursor = 'pointer';
      summary.title = 'View enquiry details';
      summary.addEventListener('click', () => {
        window.location.href = 'tutor-dashboard.html';
      });
    }
  }

  if (!notice) return;
  const studentQuizzesButton = document.getElementById('studentQuizzesButton');
  if (studentQuizzesButton) {
    studentQuizzesButton.style.display = studentSession ? 'inline-flex' : 'none';
  }

  if (studentSession && tutorSession) {
    notice.textContent = `Student logged in as ${studentSession.email} and tutor session active. Use separate tabs for each dashboard.`;
    notice.style.display = 'block';
    if (loginLink) loginLink.textContent = 'Continue to Dashboards';
    return;
  }
  if (studentSession) {
    notice.textContent = `You are still logged in as ${studentSession.email}. Visit Student Dashboard to continue.`;
    notice.style.display = 'block';
    if (loginLink) loginLink.textContent = 'Continue Student Dashboard';
    return;
  }
  if (tutorSession) {
    notice.textContent = 'Tutor session is active. Visit Tutor Dashboard to continue.';
    notice.style.display = 'block';
    if (loginLink) loginLink.textContent = 'Continue Tutor Dashboard';
  }
}

function initLoginPage() {
  const studentTab = document.getElementById('showStudentTab');
  const tutorTab = document.getElementById('showTutorTab');
  const studentSection = document.getElementById('studentTab');
  const tutorSection = document.getElementById('tutorTab');
  const studentLoginTab = document.getElementById('showStudentLogin');
  const studentSignupTab = document.getElementById('showStudentSignup');
  const studentLoginSection = document.getElementById('studentLoginSection');
  const studentSignupSection = document.getElementById('studentSignupSection');
  const loginStudentForm = document.getElementById('loginStudentForm');
  const signupStudentForm = document.getElementById('signupStudentForm');
  const loginTutorForm = document.getElementById('loginTutorForm');
  const loginStatus = document.getElementById('loginStatus');
  const loginStudentMessage = document.getElementById('loginStudentMessage');
  const signupStudentMessage = document.getElementById('signupStudentMessage');
  const loginTutorMessage = document.getElementById('loginTutorMessage');

  if (!studentTab || !tutorTab || !studentSection || !tutorSection || !studentLoginTab || !studentSignupTab || !studentLoginSection || !studentSignupSection || !loginStudentForm || !signupStudentForm || !loginTutorForm || !loginStatus) return;

  function showStudentTab() {
    studentTab.classList.add('active');
    tutorTab.classList.remove('active');
    studentSection.style.display = '';
    tutorSection.style.display = 'none';
  }

  function showTutorTab() {
    studentTab.classList.remove('active');
    tutorTab.classList.add('active');
    studentSection.style.display = 'none';
    tutorSection.style.display = '';
  }

  function showStudentLogin() {
    studentLoginTab.classList.add('active');
    studentSignupTab.classList.remove('active');
    studentLoginSection.style.display = '';
    studentSignupSection.style.display = 'none';
  }

  function showStudentSignup() {
    studentLoginTab.classList.remove('active');
    studentSignupTab.classList.add('active');
    studentLoginSection.style.display = 'none';
    studentSignupSection.style.display = '';
  }

  studentTab.addEventListener('click', showStudentTab);
  tutorTab.addEventListener('click', showTutorTab);
  studentLoginTab.addEventListener('click', showStudentLogin);
  studentSignupTab.addEventListener('click', showStudentSignup);

  const studentSession = getCurrentSession('student');
  const tutorSession = getCurrentSession('tutor');
  if (studentSession || tutorSession) {
    const pieces = [];
    if (studentSession) {
      pieces.push(`Student logged in as ${studentSession.email}`);
    }
    if (tutorSession) {
      pieces.push('Tutor session active');
    }
    loginStatus.textContent = `${pieces.join(' and ')}. You can continue to the dashboards or login to the other role.`;
  }

  showStudentTab();
  showStudentLogin();

  loginStudentForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(loginStudentForm);
    const email = data.get('email')?.toString().trim();
    const password = data.get('password')?.toString().trim();
    if (!email || !password) {
      showMessage(loginStudentMessage, 'Enter email and password to login.', true);
      return;
    }
    if (!validateStudentLogin(email, password)) {
      showMessage(loginStudentMessage, 'Invalid student credentials.', true);
      return;
    }
    setCurrentSession({ role: 'student', email });
    window.location.href = 'student-dashboard.html';
  });

  signupStudentForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(signupStudentForm);
    const email = data.get('email')?.toString().trim();
    const password = data.get('password')?.toString().trim();
    const confirmPassword = data.get('confirmPassword')?.toString().trim();
    if (!email || !password || !confirmPassword) {
      showMessage(signupStudentMessage, 'Fill all fields to create an account.', true);
      return;
    }
    if (password !== confirmPassword) {
      showMessage(signupStudentMessage, 'Passwords do not match.', true);
      return;
    }
    if (!createStudentAccount(email, password)) {
      showMessage(signupStudentMessage, 'An account with this email already exists.', true);
      return;
    }
    showMessage(signupStudentMessage, 'Account created successfully. You can now login.');
    signupStudentForm.reset();
    showStudentLogin();
  });

  loginTutorForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(loginTutorForm);
    const email = data.get('email')?.toString().trim();
    const password = data.get('password')?.toString().trim();
    if (!email || !password) {
      showMessage(loginTutorMessage, 'Enter email and password to login.', true);
      return;
    }
    if (!validateTutorLogin(email, password)) {
      showMessage(loginTutorMessage, 'Invalid tutor credentials.', true);
      return;
    }
    setCurrentSession({ role: 'tutor', email });
    window.location.href = 'tutor-dashboard.html';
  });
}

function initSessionLogoutUI() {
  const logoutButton = document.getElementById('siteLogoutButton');
  if (!logoutButton) return;
  const role = getPageRole();
  const currentSession = role ? getCurrentSession(role) : getAnySession();
  logoutButton.style.display = currentSession ? 'inline-flex' : 'none';

  const loginAnchors = document.querySelectorAll('a[href="login.html"]');
  loginAnchors.forEach(anchor => {
    anchor.style.display = currentSession ? 'none' : '';
  });

  logoutButton.addEventListener('click', () => {
    if (role) {
      clearSession(role);
    } else {
      clearSession();
    }
    window.location.href = 'index.html';
  });
}

function initPage() {
  if (document.getElementById('enquiryForm')) {
    initEnquiryForm();
    initHomePage();
  }
  // Start intro animation if present on the page
  initIntroAnimation();
  initScrollReveal();
  initChatWidget();
  if (document.getElementById('loginStudentForm')) {
    initLoginPage();
  }
  if (document.getElementById('studentLoginForm')) {
    initStudentDashboard();
  }
  if (document.getElementById('enquiryCount')) {
    initTutorDashboard();
  }
  initSessionLogoutUI();
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    '.service-card, .feature-card, .testimonial-card, .tutor-card, .summary-card, .enquiry-item, .student-enquiry-item, .contact-card, .dashboard-panel, .quiz-item, .quiz-draft-item, .chat-panel'
  );

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  revealElements.forEach(el => {
    el.classList.add('scroll-reveal');
    observer.observe(el);
  });
}

function initIntroAnimation() {
  const overlay = document.getElementById('introOverlay');
  const heroCopy = document.querySelector('.hero-copy');
  const heroVisual = document.querySelector('.hero-visual');
  if (!overlay) {
    if (heroCopy) heroCopy.classList.add('animate');
    if (heroVisual) heroVisual.classList.add('animate');
    return;
  }

  overlay.addEventListener('animationend', (e) => {
    if (e.animationName === 'overlayOut') {
      try { overlay.remove(); } catch (err) {}
      if (heroCopy) heroCopy.classList.add('animate');
      if (heroVisual) heroVisual.classList.add('animate');
      initScrollReveal();
    }
  });

  // Fallback: ensure overlay removed and hero revealed after 2200ms
  setTimeout(() => {
    if (document.body.contains(overlay)) {
      try { overlay.remove(); } catch (err) {}
    }
    if (heroCopy) heroCopy.classList.add('animate');
    if (heroVisual) heroVisual.classList.add('animate');
  }, 4400);
}

function updateChatWidgetVisibility(role) {
  const widget = document.getElementById('chatWidget');
  if (!widget) return;
  const session = getCurrentSession(role);
  if (!session) {
    widget.style.display = 'none';
    const panel = document.getElementById('chatPanel');
    if (panel) panel.classList.remove('open');
    widget.setAttribute('aria-hidden', 'true');
    return;
  }
  widget.style.display = '';
}

// --- Chat storage and UI ---
const CHATS_KEY = 'easygradeChats';

function getChats() {
  const raw = localStorage.getItem(CHATS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch (e) { return []; }
}

function saveChats(chats) {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

function participantsKey(a, b) {
  return [a.toLowerCase(), b.toLowerCase()].sort().join('::');
}

function findOrCreateThread(participants) {
  const [a, b] = participants.map(p => p.toLowerCase());
  const key = participantsKey(a, b);
  const chats = getChats();
  let thread = chats.find(t => t.id === key);
  if (!thread) {
    thread = { id: key, participants: [a, b], messages: [], updated: Date.now() };
    chats.push(thread);
    saveChats(chats);
  }
  return thread;
}

function appendMessageToContainer(container, msg, role, me) {
  const senderLabel = me ? 'You' : role === 'tutor' ? 'Tutor' : 'Student';
  const el = document.createElement('div');
  el.className = `chat-message ${role} ${me ? 'me' : 'other'}`;
  el.innerHTML = `
    <div class="chat-sender">${escapeHtml(senderLabel)}</div>
    <div class="chat-text">${escapeHtml(msg.text)}</div>
    <div class="chat-ts">${new Date(msg.ts).toLocaleString()}</div>
  `;
  container.appendChild(el);
}

function renderChatForStudent(email) {
  const title = document.getElementById('chatTitle');
  const body = document.getElementById('chatBody');
  title.textContent = 'Chat with Tutor';
  body.innerHTML = '';
  const thread = findOrCreateThread([email, TUTOR_EMAIL]);
  const msgs = document.createElement('div');
  msgs.id = 'chatMessages';
  thread.messages.forEach(m => {
    const role = m.from.toLowerCase() === email.toLowerCase() ? 'student' : 'tutor';
    appendMessageToContainer(msgs, m, role, role === 'student');
  });
  body.appendChild(msgs);
  msgs.scrollTop = msgs.scrollHeight;
  // mark current thread on widget
  const widget = document.getElementById('chatWidget');
  if (widget) widget.dataset.thread = thread.id;
}

function renderChatForTutor(email) {
  const title = document.getElementById('chatTitle');
  const body = document.getElementById('chatBody');
  title.textContent = 'Chat with Students';
  body.innerHTML = '';
  const userList = document.createElement('div');
  userList.className = 'chat-user-list';
  userList.id = 'chatUserList';
  // build unique student list from enquiries
  const enquiries = getEnquiries();
  const students = Array.from(new Set(enquiries.map(e => e.email))).filter(Boolean);
  if (students.length === 0) {
    userList.innerHTML = '<div style="padding:12px;color:#6b7280">No student enquiries yet.</div>';
    body.appendChild(userList);
    return;
  }
  students.forEach(student => {
    const item = document.createElement('div');
    item.className = 'chat-user-item';
    item.textContent = student;
    item.addEventListener('click', () => {
      // set active
      Array.from(userList.children).forEach(c => c.classList.remove('active'));
      item.classList.add('active');
      // render messages for this student
      const thread = findOrCreateThread([student, TUTOR_EMAIL]);
      const msgs = document.createElement('div');
      msgs.id = 'chatMessages';
      thread.messages.forEach(m => {
        const role = m.from.toLowerCase() === email.toLowerCase() ? 'tutor' : 'student';
        appendMessageToContainer(msgs, m, role, role === 'tutor');
      });
      // replace existing messages area
      const existing = document.getElementById('chatMessages');
      if (existing) existing.remove();
      body.appendChild(msgs);
      msgs.scrollTop = msgs.scrollHeight;
      const widget = document.getElementById('chatWidget');
      if (widget) {
        widget.dataset.thread = thread.id;
        widget.dataset.chatWith = student;
      }
    });
    userList.appendChild(item);
  });
  body.appendChild(userList);
  // auto-click first student
  const first = userList.querySelector('.chat-user-item');
  if (first) first.click();
}

function sendChatMessage(text) {
  const session = getCurrentSession(getPageRole());
  if (!session) return;
  const widget = document.getElementById('chatWidget');
  const threadId = widget?.dataset.thread;
  let thread;
  if (threadId) {
    const chats = getChats();
    thread = chats.find(t => t.id === threadId);
  }
  // fallback for student: use student<->tutor thread
  if (!thread) {
    if (session.role === 'student') thread = findOrCreateThread([session.email, TUTOR_EMAIL]);
    else return; // tutor should pick a student
  }
  const msg = { from: session.email, text, ts: Date.now() };
  thread.messages.push(msg);
  thread.updated = Date.now();
  const chats = getChats();
  const idx = chats.findIndex(t => t.id === thread.id);
  if (idx >= 0) chats[idx] = thread; else chats.push(thread);
  saveChats(chats);
  // refresh view
  const msgsContainer = document.getElementById('chatMessages');
  if (msgsContainer) {
    const role = session.role === 'student' ? 'student' : 'tutor';
    appendMessageToContainer(msgsContainer, msg, role, true);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
  }
}

function initChatWidget() {
  const widget = document.getElementById('chatWidget');
  if (!widget) return;
  const toggle = document.getElementById('chatToggle');
  const panel = document.getElementById('chatPanel');
  const close = document.getElementById('chatClose');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');

  const pageRole = getPageRole();
  updateChatWidgetVisibility(pageRole);

  function refresh() {
    const session = getCurrentSession(pageRole);
    if (!session) {
      document.getElementById('chatBody').innerHTML = '<div style="padding:12px;color:#6b7280">Please login to chat with tutors or students.</div>';
      return;
    }
    if (session.role === 'student') renderChatForStudent(session.email);
    else renderChatForTutor(session.email);
  }

  toggle.addEventListener('click', () => {
    const session = getCurrentSession();
    if (!session) return;
    panel.classList.toggle('open');
    widget.setAttribute('aria-hidden', panel.classList.contains('open') ? 'false' : 'true');
    refresh();
  });
  close.addEventListener('click', () => { panel.classList.remove('open'); widget.setAttribute('aria-hidden','true'); });
  form.addEventListener('submit', (e) => { e.preventDefault(); const txt = input.value?.trim(); if (!txt) return; sendChatMessage(txt); input.value = ''; });

  // refresh when session changes (simple polling event): update on open
  document.addEventListener('visibilitychange', () => { if (!document.hidden && panel.classList.contains('open')) refresh(); });
}

window.addEventListener('DOMContentLoaded', initPage);
