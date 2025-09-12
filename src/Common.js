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
    // Create a button that changes the cat image when pressed.
    // Note: Action parameter keys and values must be strings.
    const action = CardService.newAction()
        .setFunctionName('onChangeCat')
        .setParameters({ text: text, isHomepage: isHomepage.toString(), requestFileAuth: requestFileAuth.toString() });
    const button = CardService.newTextButton()
        .setText('Nuevo gato')
        .setAltText('Gato escondido')
        .setOnClickAction(action)
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
    const buttonSet = CardService.newButtonSet()
        .addButton(button);

    // Create a footer to be shown at the bottom.
    const footer = CardService.newFixedFooter()
        .setPrimaryButton(CardService.newTextButton()
            .setText('Maullando con cataas.com')
            .setOpenLink(CardService.newOpenLink()
                .setUrl('https://cataas.com')))
    //.setSecondaryButton(CardService.newTextButton().setText('Otro').setOpenLink(CardService.newOpenLink().setUrl('www.google.com')));

    // Assemble the widgets and return the card.
    const section = CardService.newCardSection()
        .addWidget(catImage(text, 'Miau'))
        .addWidget(buttonSet);
    
    if( requestFileAuth) {
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
        .setFixedFooter(footer);

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
 * Callback for the "Change cat" button.
 * @param {Object} e The event object, documented {@link
 *     https://developers.google.com/gmail/add-ons/concepts/actions#action_event_objects
 *     here}.
 * @return {GoogleAppsScript.Card_Service.ActionResponse} The action response to apply.
 */
function onChangeCat(e) {
    console.log(e);
    // Get the text that was shown in the current cat image. This was passed as a
    // parameter on the Action set for the button.
    const text = e.parameters.text;

    // The isHomepage parameter is passed as a string, so convert to a Boolean.
    const isHomepage = e.parameters.isHomepage === 'true';

    const requestFileAuth = e.parameters.requestFileAuth === 'true';

    // Create a new card with the same text.
    const card = createCatCard(text, requestFileAuth, isHomepage);

    // Create an action response that instructs the add-on to replace
    // the current card with the new one.
    const navigation = CardService.newNavigation()
        .updateCard(card);
    const actionResponse = CardService.newActionResponseBuilder()
        .setNavigation(navigation);
    return actionResponse.build();
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



