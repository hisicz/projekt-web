// České kostky – jednoduchá verze k přečtení.
// Každá proměnná popisuje přímo jednu věc ve hře.

const obrazkyKostek = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const cil = 10000;

let mojeBody = 0;
let bodyPocitace = 0;
let bodyVTahu = 0;
let kostky = [];
let vybraneKostky = [];
let tahHrace = true;
let cekamNaVyber = false;
let probihaHod = false;

const plochaKostek = document.querySelector('#dice-area');
const napoveda = document.querySelector('#hint');
const tlacitkoHodit = document.querySelector('#roll-button');
const tlacitkoUlozit = document.querySelector('#bank-button');

// Vrátí náhodné číslo od 1 do 6.
function nahodnaKostka() {
  return Math.floor(Math.random() * 6) + 1;
}

// Spočítá body za vybrané kostky.
function spocitejBody(vyber) {
  if (vyber.length === 0) return 0;

  const kolik = [0, 0, 0, 0, 0, 0];
  vyber.forEach((hodnota) => kolik[hodnota - 1]++);

  // Zvláštní kombinace platí jen při výběru všech šesti kostek.
  if (vyber.length === 6 && kolik.every((pocet) => pocet === 1)) return 1500;
  if (vyber.length === 6 && kolik.filter((pocet) => pocet === 2).length === 3) return 750;

  let body = 0;
  kolik.forEach((pocet, index) => {
    const hodnota = index + 1;

    // Trojice a více stejných kostek.
    if (pocet >= 3) {
      const bodyZaTrojici = hodnota === 1 ? 1000 : hodnota * 100;
      body += bodyZaTrojici * (pocet - 2);
    // Samostatné jedničky a pětky.
    } else if (hodnota === 1) {
      body += pocet * 100;
    } else if (hodnota === 5) {
      body += pocet * 50;
    }
  });

  return body;
}

// Zjistí, zda hod obsahuje alespoň jednu bodovanou kombinaci.
// Když ne, hráč ztrácí body v aktuálním tahu.
function bodovanePozice(hod) {
  if (spocitejBody(hod) === 0) return [];

  const pocty = hod.map((hodnota) => hod.filter((x) => x === hodnota).length);
  const postupka = hod.length === 6 && new Set(hod).size === 6;
  const triPary = hod.length === 6 && pocty.every((pocet) => pocet === 2);

  if (postupka || triPary) return hod.map((_, index) => index);

  return hod
    .map((hodnota, index) => (hodnota === 1 || hodnota === 5 || pocty[index] >= 3 ? index : -1))
    .filter((index) => index !== -1);
}

function jePlatnyVyber(vyber) {
  if (vyber.length === 0) return false;

  const pocty = vyber.map((hodnota) => vyber.filter((x) => x === hodnota).length);
  const postupka = vyber.length === 6 && new Set(vyber).size === 6;
  const triPary = vyber.length === 6 && pocty.every((pocet) => pocet === 2);

  if (postupka || triPary) return true;

  return vyber.every((hodnota, index) => (
    hodnota === 1 || hodnota === 5 || pocty[index] >= 3
  ));
}

function zobrazKostky() {
  plochaKostek.innerHTML = '';
  kostky.forEach((hodnota, index) => {
    const kostka = document.createElement('button');
    kostka.type = 'button';
    kostka.className = `die${vybraneKostky.includes(index) ? ' selected' : ''}`;
    kostka.textContent = obrazkyKostek[hodnota - 1];
    // Vybrat lze každou kostku. Body však přidají pouze bodované kombinace.
    kostka.disabled = !tahHrace || probihaHod;
    kostka.addEventListener('click', () => vyberKostku(index));
    plochaKostek.append(kostka);
  });

  const vyber = vybraneKostky.map((index) => kostky[index]);
  document.querySelector('#selection-info').textContent = `Vybráno: ${spocitejBody(vyber).toLocaleString('cs-CZ')} bodů`;
}

function vyberKostku(index) {
  if (vybraneKostky.includes(index)) {
    vybraneKostky = vybraneKostky.filter((cislo) => cislo !== index);
  } else {
    vybraneKostky.push(index);
  }
  zobrazKostky();
  zobrazStav();
}

function zobrazStav() {
  document.querySelector('#human-score').textContent = mojeBody.toLocaleString('cs-CZ');
  document.querySelector('#computer-score').textContent = bodyPocitace.toLocaleString('cs-CZ');
  document.querySelector('#round-score').textContent = bodyVTahu.toLocaleString('cs-CZ');
  document.querySelector('#turn-label').textContent = tahHrace ? 'Tvůj tah' : 'Tah počítače';
  document.querySelector('#human-card').classList.toggle('active', tahHrace);
  document.querySelector('#computer-card').classList.toggle('active', !tahHrace);

  tlacitkoHodit.disabled = !tahHrace || probihaHod || (cekamNaVyber && vybraneKostky.length === 0);
  tlacitkoUlozit.disabled = !tahHrace || probihaHod || (bodyVTahu === 0 && vybraneKostky.length === 0);
  tlacitkoHodit.innerHTML = cekamNaVyber
    ? 'Potvrdit a házet dál <span>🎲</span>'
    : kostky.length ? 'Házet dál <span>🎲</span>' : 'Hodit kostkami <span>🎲</span>';
}

function hodit() {
  if (!tahHrace || probihaHod) return;

  // Pokud už kostky na stole jsou, musí si hráč nejdřív nějaké vybrat.
  if (cekamNaVyber && vybraneKostky.length === 0) {
    napoveda.textContent = 'Nejdřív vyber alespoň jednu kostku.';
    return;
  }

  const odlozene = vybraneKostky.map((index) => kostky[index]);
  bodyVTahu += spocitejBody(odlozene);

  // Odložím dvě jedničky → další hod bude právě čtyřmi kostkami.
  // Počet kostek pro další hod se počítá z kostek na stole, ne vždy ze šesti.
  // Např. ze 3 kostek odložím 2 → házím už jen 1 kostkou.
  const pocetNovychKostek = odlozene.length === kostky.length
    ? 6
    : kostky.length - odlozene.length;
  kostky = Array.from({ length: pocetNovychKostek }, nahodnaKostka);
  vybraneKostky = [];
  cekamNaVyber = false;
  probihaHod = true;
  zobrazKostky();
  [...plochaKostek.children].forEach((kostka) => kostka.classList.add('rolling'));
  zobrazStav();

  setTimeout(() => {
    probihaHod = false;

    if (bodovanePozice(kostky).length === 0) {
      bodyVTahu = 0;
      // Neúspěšný hod necháme chvíli na stole, aby hráč viděl, co padlo.
      probihaHod = true;
      napoveda.textContent = 'Žádná bodovaná kombinace…';
      zobrazKostky();
      zobrazStav();
      setTimeout(() => {
        kostky = [];
        probihaHod = false;
        napoveda.textContent = 'Prohrál/a jsi tento tah. Tah přebírá počítač.';
        zobrazKostky();
        zobrazStav();
        setTimeout(tahPocitace, 700);
      }, 1400);
      return;
    }

    cekamNaVyber = true;
    napoveda.textContent = 'Klikni na libovolné kostky, které chceš odložit.';
    zobrazKostky();
    zobrazStav();
  }, 450);
}

function ulozitBody() {
  const odlozene = vybraneKostky.map((index) => kostky[index]);
  bodyVTahu += spocitejBody(odlozene);
  mojeBody += bodyVTahu;

  if (mojeBody >= cil) return konecHry('Vyhráváš!', mojeBody);

  napoveda.textContent = `Uloženo ${bodyVTahu} bodů. Tah přebírá počítač.`;
  bodyVTahu = 0;
  kostky = [];
  vybraneKostky = [];
  cekamNaVyber = false;
  tahHrace = false;
  zobrazKostky();
  zobrazStav();
  setTimeout(tahPocitace, 900);
}

function tahPocitace() {
  // Počítač hraje jednoduše: hází, dokud nemá aspoň 400 bodů.
  let zisk = 0;
  let pocetKostek = 6;

  for (let pokus = 0; pokus < 8 && zisk < 400; pokus++) {
    const hod = Array.from({ length: pocetKostek }, nahodnaKostka);
    const pozice = bodovanePozice(hod);

    if (pozice.length === 0) {
      zisk = 0;
      break;
    }

    const vyber = pozice.map((index) => hod[index]);
    zisk += spocitejBody(vyber);
    pocetKostek = vyber.length === pocetKostek ? 6 : pocetKostek - vyber.length;
  }

  bodyPocitace += zisk;
  if (bodyPocitace >= cil) return konecHry('Počítač vyhrál', bodyPocitace);

  tahHrace = true;
  napoveda.textContent = zisk ? `Počítač ukládá ${zisk} bodů. Jsi na tahu.` : 'Počítač nehodil body. Jsi na tahu.';
  zobrazStav();
}

function konecHry(nadpis, body) {
  document.querySelector('#modal-title').textContent = nadpis;
  document.querySelector('#modal-text').textContent = `Dosaženo ${body.toLocaleString('cs-CZ')} bodů.`;
  document.querySelector('#modal').classList.remove('hidden');
}

function novaHra() {
  mojeBody = 0; bodyPocitace = 0; bodyVTahu = 0;
  kostky = []; vybraneKostky = [];
  tahHrace = true; cekamNaVyber = false; probihaHod = false;
  document.querySelector('#modal').classList.add('hidden');
  napoveda.textContent = 'Hoď kostkami a vyber ty, které chceš odložit.';
  zobrazKostky();
  zobrazStav();
}

tlacitkoHodit.addEventListener('click', hodit);
tlacitkoUlozit.addEventListener('click', ulozitBody);
document.querySelector('#new-game').addEventListener('click', novaHra);
document.querySelector('#play-again').addEventListener('click', novaHra);
novaHra();
