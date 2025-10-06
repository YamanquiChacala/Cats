/**
* This simple Google Workspace add-on shows a random image of a cat in the
* sidebar. When opened manually (the homepage card), some static text is
* overlayed on the image, but when contextual cards are opened a new cat image
* is shown with the text taken from that context (such as a message's subject
* line) overlaying the image. There is also a button that updates the card with
* a new random cat image.
*
* Click "File > Make a copy..." to copy the script, and "Publish > Deploy from
* manifest > Install add-on" to install it.
*/


/**
 * Callback for rendering the homepage card.
 * @return {GoogleAppsScript.Card_Service.Card} The card to show to the user.
 * @param {string | object} e
 */
function onHomepage(e) {
    console.log(e);
    const hour = Number(Utilities.formatDate(new Date(), e.userTimezone.id, 'H'));
    let message;
    if (hour >= 6 && hour < 12) {
        message = 'Buenos días';
    } else if (hour >= 12 && hour < 18) {
        message = 'Buenas tardes';
    } else {
        message = 'Buenas noches';
    }
    message += ', ' + e.hostApp;
    let requestFileAuth = false;
    if (['docs', 'sheets'].includes(e.hostApp)) {
        requestFileAuth = true;
    }
    return createCatCard(message, requestFileAuth, true);
}

/**
 * Creates a card with an image of a cat, overlayed with the text.
 * @param {String} text The text to overlay on the image.
 * @param {Boolean} [requestFileAuth] True if the card should ask the user permission to modify the current editor file.
 * @param {Boolean} [isHomepage] True if the card created here is a homepage;
 *      false otherwise. Defaults to false.
 * @return {GoogleAppsScript.Card_Service.Card} The assembled card.
 */
function createCatCard(text, requestFileAuth = false, isHomepage = false) {
    // Assemble the widgets and return the card.
    const section = CardService.newCardSection()
        .addWidget(catImageWithCaption(text, 'Miau'))
        .addWidget(reloadButton('Nuevo gato', createCatCard, [text, requestFileAuth, isHomepage]));

    if (requestFileAuth) {
        const requestAction = CardService.newAction()
            .setFunctionName('askPermission');

        const requestButton = CardService.newTextButton()
            .setText('Permiso para modificar')
            .setOnClickAction(requestAction)
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED);

        const requestButtonSet = CardService.newButtonSet()
            .addButton(requestButton);

        section
            .addWidget(CardService.newDivider())
            .addWidget(requestButtonSet);
    }

    const card = CardService.newCardBuilder()
        .setHeader(catHeader('¡Aparece un gato!', '¿No es bonito?'))
        .addSection(section)
        .setFixedFooter(cardFooter());



    if (!isHomepage) {
        // Create the header shown when the card is minimized,
        // but only when this card is a contextual card. Peek headers
        // are never used by non-contexual cards like homepages.
        const peekHeader = CardService.newCardHeader()
            .setTitle('Gato con contexto')
            .setImageUrl('https://media.githubusercontent.com/media/YamanquiChacala/Cats/refs/heads/main/images/naranja_48.png')
            .setSubtitle(text);
        card.setPeekCardHeader(peekHeader);
    }
    return card.build();
}


/**
 * Callback to request permission to edit a file.
 * @returns {GoogleAppsScript.Card_Service.EditorFileScopeActionResponse} The dialog asking the user permission.
 */
function askPermission() {
    return CardService.newEditorFileScopeActionResponseBuilder()
        .requestFileScopeForActiveDocument()
        .build();
}



