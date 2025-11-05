const CARD_GENERATORS = {
    createCatCard,
};

/**
 * Ensures a caption is sanitized, formatted, and truncated for cataas.
 * - Invalid characters are replaced with a single space.
 * - If the caption exceeds MAX_CAPTION_LENGTH, it is cleanly truncated
 *   at the last word boundary (space, hyphen, comma, etc.) and an ellipsis is added.
 *
 * @param {string} caption The message to sanitize.
 * @return {string} The fixed message.
 */
function sanitize(caption) {
    if (!caption) return '';

    const invalidCharRegex = /[^\p{Script=Latin}\p{Script=Greek}\p{Script=Cyrillic}\p{Script=Hebrew}\p{Script=Arabic}0-9 .:,;¿?¡!\[\]\(\)\{\}~@#$%^`*+='"|\\\/_-]/gu;

    let sanitizedCaption = caption.replace(invalidCharRegex, ' ').replace(/\s+/g, ' ').trim();

    if (sanitizedCaption.length > MAX_CAPTION_LENGTH) {
        const truncationPoint = MAX_CAPTION_LENGTH - 3;

        const wordSeparatorRegex = /[:;_\-,\s]/;
        let cutIndex = -1;

        for (let i = truncationPoint; i >= 0; i--) {
            if (wordSeparatorRegex.test(sanitizedCaption[i])) {
                cutIndex = i;
                break;
            }
        }

        if (cutIndex === -1) {
            cutIndex = truncationPoint;
        }
        sanitizedCaption = sanitizedCaption.slice(0, cutIndex) + '...';
    }

    return sanitizedCaption;
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