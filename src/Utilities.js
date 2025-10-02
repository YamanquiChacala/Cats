const MAX_CAPTION_LENGTH = 40;

const CARD_GENERATORS = {
  createCatCard,
};

/**
 * Ensure the caption is ready for a cat image.
 * @param {string} caption The message to sanitize.
 * @return {string} The fixed message.
 */
function sanitize(caption) {
  if (caption.length > MAX_CAPTION_LENGTH) {
    caption = caption.slice(0, MAX_CAPTION_LENGTH);
    caption = caption.slice(0, regexLastIndexOf(caption, /[:;\-_.,\n ] */g)) + '...';
  }
  return encodeURIComponent(caption);
}

/**
 * Returns a proper capitalized version of the string.
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  if (!str) return '';

  const lowerStr = str.toLowerCase();

  return lowerStr.split(' ').map(word => {
    if (word.length === 0) return '';
    const firstLetter = word.charAt(0).toUpperCase();
    const restOfWord = word.slice(1);
    return firstLetter + restOfWord;
  }).join(' ');
}

/**
 * Generates a cute phrase.
 * @returns {string}
 */
function generateCuriousPhrase() {
  if (Math.random() < 0.2) {
    return getRandomElement(phraseParts.specialPhrases);
  }

  const intro = getRandomElement(phraseParts.intros);
  const persuation = getRandomElement(phraseParts.persuations);
  const closer = getRandomElement(phraseParts.closers);

  const structures = [
    `${intro} ${persuation}`,
    `${persuation} ${closer}`,
    `${intro} ${closer}`,
  ];

  return getRandomElement(structures);
}

/**
 * @param {string} str
 * @param {RegExp} regex
 */
function regexLastIndexOf(str, regex) {
  let lastIndex = -1;
  const matches = str.matchAll(regex);

  for (const match of matches) {
    lastIndex = match.index;
  }
  return lastIndex;
}

const phraseParts = {
  intros: [
    "Elígeme,",
    "¡Yo!",
    "Hola,",
    "Mírame,",
    "¡Aquí!",
    "Psst...",
  ],
  persuations: [
    "Soy el más rápido.",
    "Te divertirás.",
    "Funciono perfecto.",
    "¡No lo lamentarás!",
    "Soy impecable.",
    "¿Por qué no me yo?",
  ],
  closers: [
    "¡Prometido!",
    "¿Sí?",
    "¡Escógeme!",
    "¿Qué dices?",
    "¡Por favor!",
    "Es destino.",
  ],
  specialPhrases: [
    "¡Soy el elemento 👑 del grupo!",
    "Tengo los bits de la suerte.",
    "¡Hazle caso a tu intuición!",
  ]
}

/**
 * Selects a random element from an array.
 * @template T
 * @param {T[]} arr - The array from which to select an element.
 * @returns {T} The randomly selected element.
 */
function getRandomElement(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}