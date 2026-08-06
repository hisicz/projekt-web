// Student Test Planner
// Data jsou uložená v Local Storage, takže zůstanou i po obnově stránky.

const STORAGE_KEY = 'student-tests';
const THEME_KEY = 'student-theme';

const $ = (selector) => document.querySelector(selector);

let tests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let draftTopics = [];

function escapeHtml(text) {
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML;
}

function isToday(date) {
  return new Date(date).toDateString() === new Date().toDateString();
}

function isFinished(test) {
  return test.topics.length > 0 && test.topics.every((topic) => topic.done);
}

function priorityLabel(priority) {
  return { high: 'Vysoká priorita', medium: 'Střední priorita', low: 'Nízká priorita' }[priority];
}

// Vytvoří český, dobře čitelný odpočet do testu.
function getCountdown(date) {
  const hours = Math.ceil((new Date(date) - new Date()) / 36e5);
  if (hours < 0) return 'Termín už proběhl';
  if (hours < 1) return 'Za méně než hodinu';
  if (hours < 24) return `Za ${hours} ${hours === 1 ? 'hodinu' : hours < 5 ? 'hodiny' : 'hodin'}`;

  const days = Math.ceil(hours / 24);
  return `Za ${days} ${days === 1 ? 'den' : days < 5 ? 'dny' : 'dní'}`;
}

function saveTests() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  render();
}

function renderDashboard() {
  const today = new Date();
  const nextWeek = new Date();
  today.setHours(0, 0, 0, 0);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const topicCount = tests.reduce((sum, test) => sum + test.topics.length, 0);
  const completedTopics = tests.reduce((sum, test) => sum + test.topics.filter((topic) => topic.done).length, 0);

  $('#all').textContent = tests.length;
  $('#week').textContent = tests.filter((test) => new Date(test.date) >= today && new Date(test.date) <= nextWeek).length;
  $('#progress').textContent = topicCount ? `${Math.round((completedTopics / topicCount) * 100)} %` : '0 %';
  $('#welcome').textContent = tests.some((test) => isToday(test.date))
    ? 'Dnes máš test – držíme palce!'
    : 'Měj své testy, témata i přípravu pod kontrolou.';
}

function getFilteredTests() {
  const query = $('#search').value.toLowerCase();
  const priority = $('#priority').value;
  const status = $('#status').value;

  return [...tests]
    .filter((test) => {
      const matchesSearch = !query || test.subject.toLowerCase().includes(query);
      const matchesPriority = priority === 'all' || test.difficulty === priority;
      const matchesStatus = status === 'all' || (status === 'done' ? isFinished(test) : !isFinished(test));
      return matchesSearch && matchesPriority && matchesStatus;
    })
    .sort((first, second) => new Date(first.date) - new Date(second.date));
}

function renderTests() {
  const visibleTests = getFilteredTests();
  const list = $('#list');
  list.innerHTML = '';
  $('#empty').classList.toggle('hidden', visibleTests.length > 0);

  visibleTests.forEach((test) => {
    const fragment = $('#card').content.cloneNode(true);
    const card = fragment.querySelector('.card');
    const testDate = new Date(test.date);
    const completed = test.topics.filter((topic) => topic.done).length;

    card.dataset.id = test.id;
    card.classList.toggle('today', isToday(test.date));
    card.querySelector('.date b').textContent = testDate.getDate();
    card.querySelector('.date small').textContent = testDate.toLocaleDateString('cs-CZ', { month: 'short' });
    card.querySelector('h3').textContent = test.subject;
    card.querySelector('.cardHead i').classList.add(test.difficulty);
    card.querySelector('.count').textContent = `${isToday(test.date) ? `Dnes v ${testDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}` : getCountdown(test.date)} • ${priorityLabel(test.difficulty)}`;
    card.querySelector('.note').textContent = test.note;
    card.querySelector('.prog b').textContent = test.topics.length ? `${completed}/${test.topics.length}` : 'Bez témat';
    card.querySelector('.bar i').style.width = test.topics.length ? `${(completed / test.topics.length) * 100}%` : '0';

    card.querySelector('.topics').innerHTML = test.topics.length
      ? test.topics.map((topic, index) => `<label><input type="checkbox" data-topic="${index}" ${topic.done ? 'checked' : ''}><span>${escapeHtml(topic.text)}</span></label>`).join('')
      : '<span>Přidej témata, která si chceš projít.</span>';

    list.append(fragment);
  });
}

function render() {
  renderDashboard();
  renderTests();
}

function renderTopicChips() {
  $('#chips').innerHTML = draftTopics
    .map((topic, index) => `<span class="chip">${escapeHtml(topic)} <button type="button" data-i="${index}">×</button></span>`)
    .join('');
}

function addDraftTopic() {
  const input = $('#topic');
  const topic = input.value.trim();
  if (!topic || draftTopics.includes(topic)) return;

  draftTopics.push(topic);
  input.value = '';
  renderTopicChips();
}

function openForm(test) {
  $('#form').reset();
  draftTopics = test ? test.topics.map((topic) => topic.text) : [];
  $('#id').value = test?.id || '';
  $('#modalTitle').textContent = test ? 'Upravit test' : 'Přidat test';

  if (test) {
    $('#subject').value = test.subject;
    $('#date').value = test.date.slice(0, 16);
    $('#difficulty').value = test.difficulty;
    $('#note').value = test.note;
  }

  renderTopicChips();
  $('#modal').showModal();
  $('#subject').focus();
}

$('#add').onclick = () => openForm();
$('#emptyAdd').onclick = () => openForm();
document.querySelectorAll('.close').forEach((button) => { button.onclick = () => $('#modal').close(); });

$('#topic').onkeydown = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addDraftTopic();
  }
};

$('#chips').onclick = (event) => {
  if (event.target.dataset.i === undefined) return;
  draftTopics.splice(event.target.dataset.i, 1);
  renderTopicChips();
};

$('#form').onsubmit = (event) => {
  event.preventDefault();
  addDraftTopic();

  const id = $('#id').value;
  const oldTest = tests.find((test) => test.id === id);
  const test = {
    id: id || crypto.randomUUID(),
    subject: $('#subject').value.trim(),
    date: $('#date').value,
    difficulty: $('#difficulty').value,
    note: $('#note').value.trim(),
    topics: draftTopics.map((text) => ({ text, done: oldTest?.topics.find((topic) => topic.text === text)?.done || false })),
  };

  tests = id ? tests.map((item) => (item.id === id ? test : item)) : [...tests, test];
  $('#modal').close();
  saveTests();
};

$('#list').onclick = (event) => {
  const card = event.target.closest('.card');
  const test = card && tests.find((item) => item.id === card.dataset.id);
  if (!test) return;

  if (event.target.closest('.edit')) openForm(test);
  if (event.target.closest('.delete') && confirm('Opravdu chceš tento test smazat?')) {
    tests = tests.filter((item) => item !== test);
    saveTests();
  }
};

$('#list').onchange = (event) => {
  if (event.target.dataset.topic === undefined) return;
  const test = tests.find((item) => item.id === event.target.closest('.card').dataset.id);
  test.topics[event.target.dataset.topic].done = event.target.checked;
  saveTests();
};

['#search', '#priority', '#status'].forEach((selector) => { $(selector).oninput = render; });
$('#clear').onclick = () => { $('#search').value = ''; $('#priority').value = 'all'; $('#status').value = 'all'; render(); };

$('#theme').onclick = () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  $('#theme').textContent = dark ? '☀' : '☾';
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
};

if (localStorage.getItem(THEME_KEY) === 'dark') {
  document.body.classList.add('dark');
  $('#theme').textContent = '☀';
}

render();
