/**
 * @param {string} title The title on the header
 * @param {string} [subtitle] The subtitle on the header
 * @returns {GoogleAppsScript.Card_Service.CardHeader} The header, ready to insert on a Card
 */
function catHeader(title, subtitle) {
    const header = CardService.newCardHeader()
        .setTitle(title)
        .setImageUrl('https://media.githubusercontent.com/media/YamanquiChacala/Cats/refs/heads/main/images/icon_48.png')
        .setImageStyle(CardService.ImageStyle.CIRCLE);
    if (subtitle) {
        header.setSubtitle(subtitle);
    }
    return header;
}

/**
 * @param {string} caption What the cat will say
 * @param {any} [altText] Tooltip text for the image
 * @return {GoogleAppsScript.Card_Service.Image} The image, ready to insert on a Card
 */
function catImage(caption, altText) {
    const now = new Date();
    const imageURL = `https://cataas.com/cat/says/${sanitize(caption)}?time=${now.getTime()}`;
    const image = CardService.newImage().setImageUrl(imageURL);
    if (altText) {
        image.setAltText(altText);
    }
    return image;
}