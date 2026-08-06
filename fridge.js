// Chytrá lednice: veškerá data jsou uložená pouze v Local Storage prohlížeče.
const FOOD_STORAGE_KEY = 'smart-fridge-food';
const SHOPPING_STORAGE_KEY = 'smart-fridge-shopping';
const THEME_STORAGE_KEY = 'smart-fridge-theme';

// Recepty jsou přímo součástí aplikace. Každý má alespoň několik jednoduchých surovin.
const recipes = [
  { name: 'Rajčatové těstoviny', type: 'RYCHLÝ OBĚD', emoji: '🍝', ingredients: ['těstoviny', 'rajčata', 'česnek', 'sýr'] },
  { name: 'Zeleninová omeleta', type: 'SNÍDANĚ', emoji: '🍳', ingredients: ['vejce', 'rajčata', 'paprika', 'sýr'] },
  { name: 'Kuřecí salát', type: 'LEHKÝ OBĚD', emoji: '🥗', ingredients: ['kuřecí maso', 'salát', 'rajčata', 'okurka'] },
  { name: 'Toast se sýrem', type: 'SVAČINA', emoji: '🥪', ingredients: ['pečivo', 'sýr', 'šunka', 'rajčata'] },
  { name: 'Ovocné smoothie', type: 'NÁPOJ', emoji: '🥤', ingredients: ['banán', 'jahody', 'mléko', 'jogurt'] },
  { name: 'Krémová polévka', type: 'VEČEŘE', emoji: '🍲', ingredients: ['brambory', 'mrkev', 'cibule', 'smetana'] },
];

const $ = (selector) => document.querySelector(selector);
let foods = JSON.parse(localStorage.getItem(FOOD_STORAGE_KEY) || '[]');
let shoppingList = JSON.parse(localStorage.getItem(SHOPPING_STORAGE_KEY) || '[]');

const categoryIcons = {
  'Zelenina': '🥬', 'Ovoce': '🍎', 'Mléčné výrobky': '🥛', 'Maso a ryby': '🍗',
  'Pečivo': '🥖', 'Trvanlivé': '🥫', 'Nápoje': '🧃', 'Ostatní': '🍽️',
};

function saveData() {
  localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(foods));
  localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(shoppingList));
  render();
}

function getFoodStatus(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${expiryDate}T00:00:00`);
  const days = Math.ceil((expiry - today) / 86400000);

  if (days < 0) return { className: 'expired', title: 'Prošlé', text: `Prošlo před ${Math.abs(days)} d.` };
  if (days === 0) return { className: 'soon', title: 'Dnes', text: 'Spotřebuj dnes' };
  if (days <= 3) return { className: 'soon', title: 'Brzy', text: `Spotřebuj za ${days} d.` };
  return { className: '', title: 'V pořádku', text: `Spotřeba ${new Date(expiryDate).toLocaleDateString('cs-CZ')}` };
}

function renderDashboard() {
  const availableRecipes = recipes.filter((recipe) => getRecipeMatch(recipe).matched > 0).length;
  $('#food-count').textContent = foods.length;
  $('#recipe-count').textContent = availableRecipes;
  $('#shopping-count').textContent = shoppingList.length;
}

function renderFoods() {
  const list = $('#food-list');
  list.innerHTML = '';
  $('#food-empty').hidden = foods.length > 0;

  [...foods]
    .sort((a, b) => new Date(a.expiry) - new Date(b.expiry))
    .forEach((food) => {
      const fragment = $('#food-template').content.cloneNode(true);
      const item = fragment.querySelector('.food-item');
      const status = getFoodStatus(food.expiry);

      item.dataset.id = food.id;
      item.classList.add(status.className);
      item.querySelector('.category-icon').textContent = categoryIcons[food.category] || '🍽️';
      item.querySelector('h3').textContent = food.name;
      item.querySelector('.food-details p').textContent = `${food.amount} · ${food.category}`;
      item.querySelector('.expiry strong').textContent = status.title;
      item.querySelector('.expiry span').textContent = status.text;
      list.append(fragment);
    });
}

function normalize(text) {
  return text.toLocaleLowerCase('cs-CZ').trim();
}

// Porovná recept s názvy potravin v lednici. Částečná shoda umožní například „rajčata cherry“.
function getRecipeMatch(recipe) {
  const foodNames = foods.map((food) => normalize(food.name));
  const matchedIngredients = recipe.ingredients.filter((ingredient) => foodNames.some((food) => food.includes(normalize(ingredient)) || normalize(ingredient).includes(food)));
  const missingIngredients = recipe.ingredients.filter((ingredient) => !matchedIngredients.includes(ingredient));

  return { matched: matchedIngredients.length, missing: missingIngredients, percent: Math.round((matchedIngredients.length / recipe.ingredients.length) * 100) };
}

function renderRecipes() {
  const list = $('#recipe-list');
  list.innerHTML = '';

  recipes.forEach((recipe) => {
    const fragment = $('#recipe-template').content.cloneNode(true);
    const card = fragment.querySelector('.recipe-card');
    const match = getRecipeMatch(recipe);

    card.querySelector('.recipe-emoji').textContent = recipe.emoji;
    card.querySelector('.recipe-type').textContent = recipe.type;
    card.querySelector('h3').textContent = recipe.name;
    card.querySelector('.match-bar i').style.width = `${match.percent}%`;
    card.querySelector('.match-percent').textContent = `${match.percent} % shoda`;
    card.querySelector('.ingredient-info').textContent = `Máš ${match.matched} ze ${recipe.ingredients.length} surovin.`;
    card.querySelector('.missing-ingredients').textContent = match.missing.length ? `Chybí: ${match.missing.join(', ')}` : 'Máš všechny suroviny. Dobrou chuť!';

    const button = card.querySelector('.add-missing');
    button.dataset.ingredients = JSON.stringify(match.missing);
    button.disabled = match.missing.length === 0;
    button.textContent = match.missing.length ? '＋ Přidat chybějící na nákup' : '✓ Vše je připraveno';
    list.append(fragment);
  });
}

function renderShoppingList() {
  const list = $('#shopping-list');
  list.innerHTML = '';
  $('#shopping-empty').hidden = shoppingList.length > 0;

  shoppingList.forEach((item, index) => {
    const row = document.createElement('li');
    row.innerHTML = `<span>${item}</span><button type="button" data-index="${index}" aria-label="Smazat položku">×</button>`;
    list.append(row);
  });
}

function render() {
  renderDashboard();
  renderFoods();
  renderRecipes();
  renderShoppingList();
}

function openFoodDialog() {
  $('#food-form').reset();
  $('#food-dialog').showModal();
  $('#food-name').focus();
}

$('#open-food-form').addEventListener('click', openFoodDialog);
document.querySelectorAll('.close-dialog').forEach((button) => button.addEventListener('click', () => $('#food-dialog').close()));

$('#food-form').addEventListener('submit', (event) => {
  event.preventDefault();
  foods.push({
    id: crypto.randomUUID(),
    name: $('#food-name').value.trim(),
    amount: $('#food-amount').value.trim(),
    category: $('#food-category').value,
    expiry: $('#food-expiry').value,
  });
  $('#food-dialog').close();
  saveData();
});

$('#food-list').addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.delete-food');
  if (!deleteButton) return;

  const item = deleteButton.closest('.food-item');
  foods = foods.filter((food) => food.id !== item.dataset.id);
  saveData();
});

$('#recipe-list').addEventListener('click', (event) => {
  const button = event.target.closest('.add-missing');
  if (!button || button.disabled) return;

  const missingIngredients = JSON.parse(button.dataset.ingredients);
  missingIngredients.forEach((ingredient) => {
    if (!shoppingList.some((item) => normalize(item) === normalize(ingredient))) shoppingList.push(ingredient);
  });
  saveData();
});

$('#shopping-list').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  shoppingList.splice(Number(button.dataset.index), 1);
  saveData();
});

$('#clear-shopping').addEventListener('click', () => {
  if (shoppingList.length && confirm('Opravdu chceš vymazat celý nákupní seznam?')) {
    shoppingList = [];
    saveData();
  }
});

$('#theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const darkMode = document.body.classList.contains('dark');
  $('#theme-toggle').textContent = darkMode ? '☀' : '☾';
  localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
});

if (localStorage.getItem(THEME_STORAGE_KEY) === 'dark') {
  document.body.classList.add('dark');
  $('#theme-toggle').textContent = '☀';
}

render();
