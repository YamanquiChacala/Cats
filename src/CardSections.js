



/**
 * @param {string} caption What the cat will say
 * @param {any} [altText] Tooltip text for the image
 * @return {GoogleAppsScript.Card_Service.Image} The image, ready to insert on a Card
 */
function catImageWithCaption(caption, altText) {
    const now = new Date();
    const imageURL = `https://cataas.com/cat/says/${encodeURIComponent(sanitize(caption))}?time=${now.getTime()}`;
    const image = CardService.newImage().setImageUrl(imageURL);
    if (altText) {
        image.setAltText(altText);
    }
    return image;
}

/**
 * @param {string} url
 * @param {string} altText
 * @returns {GoogleAppsScript.Card_Service.Image} 
 */
function catImage(url, altText) {
    const image = CardService.newImage().setImageUrl(url);
    if (altText) {
        image.setAltText(altText);
    }
    return image;
}


/**
 * @param {string} text
 * @param {(...args: any[]) => GoogleAppsScript.Card_Service.Card} cardGenerator
 * @param {[...args: any[]]} [args]
 * @returns {GoogleAppsScript.Card_Service.TextButton} The button, ready to insert on a Card.
 */
function reloadButton(text, cardGenerator, args = []) {
    const generatorName = cardGenerator.name
    if (!generatorName || !(generatorName in CARD_GENERATORS)) {
        throw new Error(`Card generator ${generatorName} is not registered`);
    }

    const action = CardService.newAction()
        .setFunctionName(reloadCallback.name)
        .setParameters({
            generatorName,
            args: JSON.stringify(args),
        });

    return CardService.newTextButton()
        .setText(text)
        .setOnClickAction(action)
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
}

/**
 * @param {object} e
 * @returns {GoogleAppsScript.Card_Service.ActionResponse}
 */
function reloadCallback(e) {
    console.log(e)
    const generatorName = e.parameters.generatorName;
    const generator = CARD_GENERATORS[generatorName];
    if (!generator) {
        throw new Error(`Unknown card generator: ${generatorName}`);
    }

    const args = JSON.parse(e.parameters.args || '[]');

    const card = generator(...args);

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation().updateCard(card))
        .build();
}

/**
 * DecoratedText widget showing a file count.
 * 
 * @param {number} fileCount How many files are there.
 * @returns {GoogleAppsScript.Card_Service.DecoratedText}
 */
function fileCountDecoratedText(fileCount) {
    let icon = 'file_copy';
    let text = `<b>${fileCount}</b> archivos extra`;
    if (fileCount == 1) {
        text = 'Un único archivo dentro';
    } else if (fileCount == 0) {
        icon = 'file_copy_off';
        text = 'Carpeta <b>vacía</b>';
    }
    return CardService.newDecoratedText()
        .setText(text)
        .setBottomLabel('Contenido de la carpeta')
        .setStartIcon(CardService.newIconImage()
            .setMaterialIcon(CardService.newMaterialIcon()
                .setName(icon)));
}





