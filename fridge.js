// Chytrá lednice: veškerá data jsou uložená pouze v Local Storage prohlížeče.
const FOOD_STORAGE_KEY = 'smart-fridge-food';
const SHOPPING_STORAGE_KEY = 'smart-fridge-shopping';
const THEME_STORAGE_KEY = 'smart-fridge-theme';

const RECIPE_STORAGE_KEY = 'smart-fridge-recipes';

// Pomocná funkce pro kratší zápis surovin ve výchozích receptech.
const ingredient = (name, amount, unit) => ({ name, amount, unit });

// Předvybrané recepty. V ingredients jsou pouze suroviny, které se kontrolují v lednici.
const DEFAULT_RECIPES = [
  { id:'omeleta-sunka', name:'Omeleta se šunkou a sýrem', type:'15 min • 2 porce', emoji:'🍳', ingredients:[ingredient('vejce',4,'ks'),ingredient('šunka',100,'g'),ingredient('tvrdý sýr',80,'g'),ingredient('mléko',40,'ml'),ingredient('máslo',15,'g')], pantryIngredients:['sůl','pepř'] },
  { id:'michana-vejce', name:'Míchaná vejce se slaninou', type:'12 min • 2 porce', emoji:'🍳', ingredients:[ingredient('vejce',5,'ks'),ingredient('slanina',100,'g'),ingredient('máslo',10,'g')], pantryIngredients:['chléb','sůl','pepř','pažitka'] },
  { id:'volska-oka', name:'Volská oka s opečenými bramborami', type:'30 min • 2 porce', emoji:'🍳', ingredients:[ingredient('vejce',4,'ks'),ingredient('máslo',15,'g')], pantryIngredients:['brambory','olej','sůl','pepř','kmín','paprika'] },
  { id:'chleb-ve-vajicku', name:'Chléb ve vajíčku se sýrem', type:'15 min • 2 porce', emoji:'🍞', ingredients:[ingredient('vejce',3,'ks'),ingredient('mléko',50,'ml'),ingredient('tvrdý sýr',80,'g')], pantryIngredients:['chléb','olej','sůl','pepř'] },
  { id:'tousty', name:'Zapečené tousty se šunkou a sýrem', type:'15 min • 2 porce', emoji:'🥪', ingredients:[ingredient('šunka',120,'g'),ingredient('tvrdý sýr',120,'g'),ingredient('máslo',20,'g')], pantryIngredients:['toustový chléb','pepř','oregano'] },
  { id:'testoviny-smetana', name:'Těstoviny se šunkou a smetanou', type:'25 min • 3 porce', emoji:'🍝', ingredients:[ingredient('šunka',200,'g'),ingredient('smetana',200,'ml'),ingredient('tvrdý sýr',100,'g'),ingredient('máslo',15,'g')], pantryIngredients:['těstoviny','sůl','pepř','muškátový oříšek'] },
  { id:'testoviny-syr', name:'Těstoviny se sýrovou omáčkou', type:'25 min • 3 porce', emoji:'🧀', ingredients:[ingredient('tvrdý sýr',180,'g'),ingredient('mléko',300,'ml'),ingredient('máslo',30,'g')], pantryIngredients:['těstoviny','hladká mouka','sůl','pepř','muškátový oříšek'] },
  { id:'zapecene-testoviny', name:'Zapečené těstoviny se šunkou', type:'45 min • 4 porce', emoji:'🍝', ingredients:[ingredient('šunka',250,'g'),ingredient('vejce',3,'ks'),ingredient('mléko',250,'ml'),ingredient('tvrdý sýr',120,'g'),ingredient('máslo',20,'g')], pantryIngredients:['těstoviny','sůl','pepř','majoránka'] },
  { id:'brambory-smetana', name:'Brambory zapečené se smetanou a sýrem', type:'60 min • 4 porce', emoji:'🥔', ingredients:[ingredient('smetana',300,'ml'),ingredient('tvrdý sýr',180,'g'),ingredient('máslo',20,'g')], pantryIngredients:['brambory','česnek','sůl','pepř','muškátový oříšek'] },
  { id:'francouzske-brambory', name:'Francouzské brambory', type:'60 min • 4 porce', emoji:'🥔', ingredients:[ingredient('vejce',5,'ks'),ingredient('uzenina',300,'g'),ingredient('smetana',200,'ml'),ingredient('máslo',20,'g')], pantryIngredients:['brambory','cibule','sůl','pepř','kmín'] },
  { id:'bramboraky', name:'Bramboráky se sýrem', type:'35 min • 3 porce', emoji:'🥞', ingredients:[ingredient('vejce',2,'ks'),ingredient('tvrdý sýr',120,'g'),ingredient('mléko',50,'ml')], pantryIngredients:['brambory','hladká mouka','česnek','olej','sůl','pepř','majoránka','kmín'] },
  { id:'burtgulas', name:'Buřtguláš', type:'40 min • 4 porce', emoji:'🍲', ingredients:[ingredient('špekáčky',400,'g')], pantryIngredients:['brambory','cibule','česnek','olej','hladká mouka','voda','sůl','pepř','sladká paprika','majoránka','kmín'] },
  { id:'leco', name:'Lečo s klobásou a vejci', type:'30 min • 3 porce', emoji:'🍲', ingredients:[ingredient('vejce',4,'ks'),ingredient('klobása',250,'g'),ingredient('paprika',400,'g'),ingredient('rajčata',400,'g')], pantryIngredients:['cibule','olej','sůl','pepř','sladká paprika'] },
  { id:'kureci-smetana', name:'Kuřecí nudličky na smetaně', type:'30 min • 3 porce', emoji:'🍗', ingredients:[ingredient('kuřecí maso',500,'g'),ingredient('smetana',250,'ml'),ingredient('máslo',20,'g')], pantryIngredients:['cibule','hladká mouka','rýže','sůl','pepř','sladká paprika','kari'] },
  { id:'kureci-sunka-syr', name:'Kuřecí plátky se šunkou a sýrem', type:'40 min • 3 porce', emoji:'🍗', ingredients:[ingredient('kuřecí maso',500,'g'),ingredient('šunka',150,'g'),ingredient('tvrdý sýr',150,'g'),ingredient('smetana',150,'ml')], pantryIngredients:['olej','sůl','pepř','sladká paprika'] },
  { id:'kureci-rizoto', name:'Kuřecí rizoto se zeleninou', type:'40 min • 4 porce', emoji:'🍚', ingredients:[ingredient('kuřecí maso',400,'g'),ingredient('mrkev',150,'g'),ingredient('paprika',150,'g'),ingredient('hrášek',150,'g'),ingredient('tvrdý sýr',100,'g')], pantryIngredients:['rýže','cibule','olej','voda','sůl','pepř','kari','sladká paprika'] },
  { id:'salat-kure', name:'Těstovinový salát s kuřetem', type:'35 min • 4 porce', emoji:'🥗', ingredients:[ingredient('kuřecí maso',350,'g'),ingredient('bílý jogurt',200,'g'),ingredient('okurka',200,'g'),ingredient('paprika',150,'g'),ingredient('tvrdý sýr',100,'g')], pantryIngredients:['těstoviny','olej','sůl','pepř','česnek','sušené bylinky'] },
  { id:'salat-sunka', name:'Těstovinový salát se šunkou', type:'25 min • 4 porce', emoji:'🥗', ingredients:[ingredient('šunka',250,'g'),ingredient('bílý jogurt',200,'g'),ingredient('okurka',200,'g'),ingredient('paprika',150,'g'),ingredient('tvrdý sýr',120,'g')], pantryIngredients:['těstoviny','sůl','pepř','česnek','sušené bylinky'] },
  { id:'vajickova-pomazanka', name:'Vajíčková pomazánka', type:'20 min • 3 porce', emoji:'🥚', ingredients:[ingredient('vejce',5,'ks'),ingredient('máslo',40,'g'),ingredient('bílý jogurt',60,'g')], pantryIngredients:['hořčice','chléb','sůl','pepř','pažitka'] },
  { id:'syrova-pomazanka', name:'Sýrová pomazánka', type:'10 min • 3 porce', emoji:'🧀', ingredients:[ingredient('tvrdý sýr',180,'g'),ingredient('pomazánkové máslo',150,'g'),ingredient('bílý jogurt',50,'g')], pantryIngredients:['chléb','sůl','pepř','sladká paprika'] },
  { id:'tvarohova-pomazanka', name:'Tvarohová pomazánka s pažitkou', type:'10 min • 3 porce', emoji:'🥣', ingredients:[ingredient('tvaroh',250,'g'),ingredient('zakysaná smetana',100,'g'),ingredient('ředkvičky',100,'g')], pantryIngredients:['chléb','sůl','pepř','pažitka'] },
  { id:'cesnekova-pomazanka', name:'Česneková pomazánka se sýrem', type:'10 min • 3 porce', emoji:'🧄', ingredients:[ingredient('tvrdý sýr',180,'g'),ingredient('pomazánkové máslo',150,'g'),ingredient('bílý jogurt',50,'g')], pantryIngredients:['česnek','chléb','sůl','pepř'] },
  { id:'palacinky', name:'Palačinky', type:'30 min • 4 porce', emoji:'🥞', ingredients:[ingredient('mléko',500,'ml'),ingredient('vejce',2,'ks')], pantryIngredients:['hladká mouka','cukr','olej','marmeláda','sůl','vanilka'] },
  { id:'livance', name:'Jogurtové lívance', type:'25 min • 3 porce', emoji:'🥞', ingredients:[ingredient('bílý jogurt',250,'g'),ingredient('vejce',2,'ks'),ingredient('mléko',100,'ml')], pantryIngredients:['hladká mouka','cukr','olej','marmeláda','sůl','vanilka','kypřicí prášek'] },
  { id:'krupicova-kase', name:'Krupicová kaše', type:'15 min • 2 porce', emoji:'🥣', ingredients:[ingredient('mléko',600,'ml'),ingredient('máslo',30,'g')], pantryIngredients:['dětská krupice','cukr','kakao','sůl','skořice'] },
  { id:'ryzovy-nakyp', name:'Rýžový nákyp s jablky', type:'60 min • 4 porce', emoji:'🍎', ingredients:[ingredient('mléko',700,'ml'),ingredient('vejce',3,'ks'),ingredient('máslo',40,'g')], pantryIngredients:['rýže','jablka','cukr','sůl','skořice','vanilka'] },
  { id:'zemlovka', name:'Žemlovka s jablky a tvarohem', type:'55 min • 4 porce', emoji:'🍞', ingredients:[ingredient('mléko',400,'ml'),ingredient('vejce',3,'ks'),ingredient('tvaroh',250,'g'),ingredient('máslo',40,'g')], pantryIngredients:['rohlíky','jablka','cukr','skořice','vanilka'] },
  { id:'kvetak', name:'Květák zapečený se sýrem', type:'45 min • 4 porce', emoji:'🥦', ingredients:[ingredient('květák',800,'g'),ingredient('vejce',3,'ks'),ingredient('smetana',200,'ml'),ingredient('tvrdý sýr',180,'g'),ingredient('máslo',20,'g')], pantryIngredients:['sůl','pepř','muškátový oříšek'] },
  { id:'brokolicova-polevka', name:'Brokolicová polévka se smetanou', type:'30 min • 4 porce', emoji:'🥦', ingredients:[ingredient('brokolice',500,'g'),ingredient('smetana',200,'ml'),ingredient('máslo',25,'g')], pantryIngredients:['brambory','cibule','voda','sůl','pepř','muškátový oříšek'] },
  { id:'smazena-ryze', name:'Smažená rýže s vejcem a šunkou', type:'25 min • 3 porce', emoji:'🍚', ingredients:[ingredient('vejce',3,'ks'),ingredient('šunka',180,'g'),ingredient('mrkev',100,'g'),ingredient('hrášek',120,'g')], pantryIngredients:['rýže','olej','sójová omáčka','pepř','česnek','zázvor'] },
];

// Výchozí recepty se uloží jen tehdy, když uživatel zatím žádné vlastní nemá.
const savedRecipes = JSON.parse(localStorage.getItem(RECIPE_STORAGE_KEY) || '[]');
let recipes = savedRecipes.length ? savedRecipes : DEFAULT_RECIPES;

if (!savedRecipes.length) {
  localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(recipes));
}
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
  localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(recipes));
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
  const availableRecipes = recipes.filter((recipe) => getRecipeMatch(recipe).complete).length;
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
      item.querySelector('.food-details p').textContent = `${food.amount} ${food.unit || ''} · ${food.category}`;
      item.querySelector('.expiry strong').textContent = status.title;
      item.querySelector('.expiry span').textContent = status.text;
      list.append(fragment);
    });
}

function normalize(text) {
  return text.toLocaleLowerCase('cs-CZ').trim();
}

// Tyto základní trvanlivé potraviny jsou vždy k dispozici a neodečítají se z lednice.
const PANTRY_STAPLES = new Set(['sůl', 'pepř', 'koření', 'olej', 'cukr', 'mouka', 'ocet'].map(normalize));

function getIngredientData(ingredient) {
  // Starší uložené recepty se zobrazí bezpečně i bez množství a jednotky.
  if (typeof ingredient === 'string') return { name: ingredient, amount: 0, unit: '' };
  return ingredient;
}

function isExpired(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${expiryDate}T00:00:00`) < today;
}

// Surovina je dostupná jen tehdy, když není prošlá, má stejnou jednotku a dostatečné množství.
function getIngredientAvailability(rawIngredient) {
  const ingredient = getIngredientData(rawIngredient);
  const requestedName = normalize(ingredient.name);
  const requestedAmount = Number(ingredient.amount);

  if (PANTRY_STAPLES.has(requestedName)) {
    return { ingredient, available: true, reason: 'základní surovina', shortage: 0 };
  }

  const matchingFoods = foods.filter((food) => {
    const foodName = normalize(food.name);
    return foodName.includes(requestedName) || requestedName.includes(foodName);
  });
  const usableFoods = matchingFoods.filter((food) => !isExpired(food.expiry) && food.unit === ingredient.unit && Number(food.amount) > 0);
  const availableAmount = usableFoods.reduce((sum, food) => sum + Number(food.amount), 0);
  const shortage = Math.max(0, requestedAmount - availableAmount);

  if (shortage === 0) return { ingredient, available: true, reason: '', shortage: 0 };
  if (matchingFoods.some((food) => isExpired(food.expiry))) return { ingredient, available: false, reason: 'je prošlá', shortage };
  if (matchingFoods.some((food) => food.unit !== ingredient.unit)) return { ingredient, available: false, reason: 'má jinou jednotku', shortage };
  if (matchingFoods.length) return { ingredient, available: false, reason: 'není jí dostatek', shortage };
  return { ingredient, available: false, reason: 'chybí', shortage };
}

function formatShortage(item) {
  return `${item.ingredient.name} – koupit ${item.shortage} ${item.ingredient.unit} (${item.reason})`;
}
function getRecipeMatch(recipe) {
  const results = recipe.ingredients.map(getIngredientAvailability);
  const missing = results.filter((result) => !result.available);
  const matched = results.length - missing.length;

  return {
    matched,
    missing,
    complete: missing.length === 0,
    percent: results.length ? Math.round((matched / results.length) * 100) : 0,
  };
}

function renderRecipes() {
  const list = $('#recipe-list');
  list.innerHTML = '';
  $('#recipe-empty').hidden = recipes.length > 0;

  recipes.forEach((recipe) => {
    const fragment = $('#recipe-template').content.cloneNode(true);
    const card = fragment.querySelector('.recipe-card');
    const match = getRecipeMatch(recipe);

    card.querySelector('.recipe-emoji').textContent = recipe.emoji;
    card.querySelector('.recipe-type').textContent = recipe.type;
    card.querySelector('h3').textContent = recipe.name;
    card.querySelector('.match-bar i').style.width = `${match.percent}%`;
    card.querySelector('.match-percent').textContent = `${match.percent} % · ${match.complete ? 'Připravitelný' : 'Neúplný'}`;
    card.querySelector('.ingredient-info').textContent = match.complete
      ? 'Recept můžeš připravit – všechny rychle se kazící suroviny jsou dostupné.'
      : `Dostupné: ${match.matched} z ${recipe.ingredients.length} surovin.`;
    card.querySelector('.missing-ingredients').textContent = match.missing.length
      ? `Chybí nebo nestačí: ${match.missing.map(formatShortage).join(', ')}`
      : 'Máš všechny potřebné suroviny. Dobrou chuť!';

    card.classList.toggle('complete', match.complete);
    card.dataset.id = recipe.id;

    const button = card.querySelector('.add-missing');
    button.dataset.ingredients = JSON.stringify(match.missing.map((item) => ({ ...item.ingredient, shortage: item.shortage })));
    button.disabled = match.complete;
    button.textContent = match.complete ? '✓ Vše je připraveno' : '＋ Přidat chybějící na nákup';
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
  // Lednici vykreslujeme jako první, aby se změna zobrazila hned po uložení potraviny.
  renderFoods();
  renderShoppingList();
  renderDashboard();
  renderRecipes();
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

  const name = $('#food-name').value;
  const existingFood = foods.find((food) => normalize(food.name) === normalize(name));
  const updatedData = {
    name,
    amount: Number($('#food-amount').value),
    unit: $('#food-unit').value,
    category: existingFood?.category || 'Surovina',
    expiry: $('#food-expiry').value,
  };

  // Duplicitní surovinu nepřidáváme: pouze obnovíme její hodnoty.
  if (existingFood) {
    Object.assign(existingFood, updatedData);
    alert(`${name} už v lednici bylo. Množství a datum spotřeby byly aktualizovány.`);
  } else {
    foods.push({ id: crypto.randomUUID(), ...updatedData });
  }

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
  const card = event.target.closest('.recipe-card');
  if (event.target.closest('.delete-recipe')) {
    recipes = recipes.filter((recipe) => recipe.id !== card.dataset.id);
    saveData();
    return;
  }

  const button = event.target.closest('.add-missing');
  if (!button || button.disabled) return;

  const missingIngredients = JSON.parse(button.dataset.ingredients);
  missingIngredients.forEach((ingredient) => {
    const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
    const amount = typeof ingredient === 'string' ? '' : ` – ${ingredient.shortage} ${ingredient.unit}`;
    const shoppingItem = `${name}${amount}`;
    if (!shoppingList.some((item) => normalize(item) === normalize(shoppingItem))) shoppingList.push(shoppingItem);
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
  if (shoppingList.length && confirm('Opravdu chceš vymazat celý seznam „Nutno dokoupit“?')) {
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

// První vykreslení stránky při jejím načtení.
render();

// Stav potravin závisí na datu, proto kontrolu spouštíme vždy po půlnoci.
function scheduleMidnightRefresh() {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);

  window.setTimeout(() => {
    render();
    scheduleMidnightRefresh();
  }, nextMidnight - now);
}

scheduleMidnightRefresh();






// Obsluha formuláře pro uživatelem přidané recepty.
function createIngredientRow() {
  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.innerHTML = `
    <input class="ingredient-name" required maxlength="50" placeholder="Název suroviny">
    <input class="ingredient-amount" type="number" min="0" step="any" required placeholder="Množství">
    <select class="ingredient-unit" required>
      <option value="g">gramů</option>
      <option value="ml">mililitrů</option>
      <option value="ks">kusů</option>
    </select>
    <button class="remove-ingredient" type="button">Odebrat</button>`;
  return row;
}

function resetIngredientRows() {
  const container = $('#recipe-ingredients');
  container.innerHTML = '';
  container.append(createIngredientRow());
}

function formatIngredient(ingredient) {
  return typeof ingredient === 'string'
    ? ingredient
    : `${ingredient.name} (${ingredient.amount} ${ingredient.unit})`;
}

function openRecipeDialog() {
  $('#recipe-form').reset();
  $('#recipe-emoji').value = '🍲';
  resetIngredientRows();
  $('#recipe-dialog').showModal();
  $('#recipe-name').focus();
}

$('#open-recipe-form').addEventListener('click', openRecipeDialog);
$('#add-ingredient').addEventListener('click', () => $('#recipe-ingredients').append(createIngredientRow()));

$('#recipe-ingredients').addEventListener('click', (event) => {
  const button = event.target.closest('.remove-ingredient');
  if (!button) return;

  const rows = document.querySelectorAll('.ingredient-row');
  if (rows.length === 1) return;
  button.closest('.ingredient-row').remove();
});

document.querySelectorAll('.close-recipe-dialog').forEach((button) => {
  button.addEventListener('click', () => $('#recipe-dialog').close());
});

$('#recipe-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const ingredients = [...document.querySelectorAll('.ingredient-row')].map((row) => ({
    name: row.querySelector('.ingredient-name').value.trim(),
    amount: Number(row.querySelector('.ingredient-amount').value),
    unit: row.querySelector('.ingredient-unit').value,
  }));

  recipes.push({
    id: crypto.randomUUID(),
    name: $('#recipe-name').value.trim(),
    type: $('#recipe-type').value.trim().toUpperCase(),
    emoji: $('#recipe-emoji').value.trim() || '🍲',
    ingredients,
  });

  $('#recipe-dialog').close();
  saveData();
});









