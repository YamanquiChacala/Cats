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