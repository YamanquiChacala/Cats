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
 * @returns {GoogleAppsScript.Card_Service.FixedFooter} The Footer with the link to cataas
 */
function cardFooter() {
    return CardService.newFixedFooter()
        .setPrimaryButton(CardService.newTextButton()
            .setText('Maullando con cataas.com')
            .setOpenLink(CardService.newOpenLink()
                .setUrl('https://cataas.com')))
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


/**
 * @param {string} text
 * @param {(...args: any[]) => GoogleAppsScript.Card_Service.Card} cardGenerator
 * @param {[...args: any[]]} [args]
 * @returns {GoogleAppsScript.Card_Service.TextButton} The button, reado to insert on a Card.
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
    let text = `<b>${fileCount}</b> otros archivos`;
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

/**
 * Drive widget to select ordering (A-Z) or (Z-A) for the list of folders.
 * 
 * @param {string} parentId
 * @param {string} driveId
 * @param {string} folderName
 * @param {boolean} reverseOrder Swap from A-Z to Z-A
 * @returns {GoogleAppsScript.Card_Service.CardSection} Widget showing the sort order A-Z or Z-A
 */
function orderSection(parentId, driveId, folderName, reverseOrder) {
    let orderText = 'A-Z';
    let orderImage = 'arrow_downward';
    if (reverseOrder) {
        orderText = 'Z-A';
        orderImage = 'arrow_upward';
    }

    const orderWidget = CardService.newDecoratedText()
        .setText(`Orden: <b>${orderText}</b>`)
        .setBottomLabel('<i>Selecciona para invertir</i>')
        .setStartIcon(CardService.newIconImage()
            .setIcon(CardService.Icon.NONE))
        .setEndIcon(CardService.newIconImage().setMaterialIcon(CardService.newMaterialIcon()
            .setName(orderImage)
            .setGrade(200)))
        .setOnClickAction(CardService.newAction()
            .setFunctionName(handleOrderSwitch.name)
            .setParameters({ parentId, driveId, folderName, reverseOrder: (!reverseOrder).toString() }));
    return CardService.newCardSection().addWidget(orderWidget);
}

/**
 * Callback for {@link orderSection} to reload {@link folderSelectCard}
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e
 */
function handleOrderSwitch(e) {
    const parentId = e.commonEventObject.parameters.parentId;
    const driveId = e.commonEventObject.parameters.driveId;
    const folderName = e.commonEventObject.parameters.folderName;
    const reverseOrder = e.commonEventObject.parameters.reverseOrder === 'true';

    const card = folderSelectCard(parentId, driveId, folderName, reverseOrder);

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation()
            .updateCard(card))
        .build();
}