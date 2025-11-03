/**
 * Main function called when the user opens the app in Drive.
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e Default Google event
 * @returns {GoogleAppsScript.Card_Service.Card} {@link BuildDriveSelectCard_}
 */
function onDriveHomepage(e) {
    console.log(e);

    return buildFolderCard('', false);
}

/**
* Main function when the user selects an item on Drive

* @param {GoogleAppsScript.Addons.EventObject} e Default Google event
* @return {GoogleAppsScript.Card_Service.Card} {@link buildFolderSelectCard_}
*/
function onDriveItemsSelected(e) {
    console.log(e);

    return buildFolderCard(e.drive.selectedItems[0].id, false);
}


/**
 * @param {GoogleAppsScript.Addons.EventObject} e
 * @returns {GoogleAppsScript.Card_Service.ActionResponse}
 */
function openCatSelectionCallback(e) {
    console.log(e);

    const folderId = e.commonEventObject.parameters.folderId;

    /** @type {CatSelectionCardParams} */
    const params = {
        hostAppContext: { folderId },
        insertFunctionName: insertCatImageCallback.name
    };

    const card = catSelectionCard(params);

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation()
            .pushCard(card))
        .build();
}

/**
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e 
 */
function insertCatImageCallback(e) {
    console.log(e);

    const hostAppContextJSON = e.commonEventObject.parameters?.hostAppContext;
    const imageUrl = e.commonEventObject.parameters?.imageUrl;

    if (!hostAppContextJSON || !imageUrl) {
        return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
                .setText('Weird error, restart the app-on'))
    }

    const hostAppContext = JSON.parse(hostAppContextJSON);
    const folderId = hostAppContext.folderId;

    let imageBlob;

    try {
        const response = UrlFetchApp.fetch(imageUrl);
        imageBlob = response.getBlob();
    } catch (e) {
        console.error(e);
        return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
                .setText('😾 El gato no quiso venir 😿'))
    }
    const fileName = 'gato.png';

    const fileMetadata = {
        name: fileName,
        parents: [folderId],
        mimeType: MimeType.PNG,
    };

    const optionalArgs = {
        supportsAllDrives: true,
        uploadType: 'multipart',
    };

    Drive.Files.create(fileMetadata, imageBlob, optionalArgs);

    return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification()
            .setText('¡Gato añadido!'))
        .build();
}

/**
 * Card where the user can request a particular cat image.
 * 
 * @param {CatSelectionCardParams} params
 * @returns 
 */
function catSelectionCard(params) {
    console.log(params);

    const mensaje = params.message || '';
    const font = params.font || 'Comic Sans MS';
    const tags = params.tags || [];
    const width = params.width || '640';
    const height = params.height || '480';

    const messageTextInput = CardService.newTextInput()
        .setFieldName('message')
        .setTitle('Mensaje')
        .setHint('¿Qué dice el gato?')
        .setValue(mensaje)
        .setValidation(CardService.newValidation()
            .setInputType(CardService.InputType.TEXT)
            .setCharacterLimit(MAX_CAPTION_LENGTH));

    const fontOptions = [
        { text: '🐵 Ándale', value: 'Andale Mono' },
        { text: '💥 ¡Impacto!', value: 'Impact' },
        { text: '💤 Arial', value: 'Arial' },
        { text: '💤 Arial Negrillas', value: 'Arial Black' },
        { text: '💬 Comic', value: 'Comic Sans MS' },
        { text: '🤖 Courier', value: 'Courier New' },
        { text: '🌹 Georgia', value: 'Georgia' },
        { text: '🔱 Times', value: 'Times New Roman' },
        { text: '🌺 Verdana', value: 'Verdana' },
        { text: '💩 Sin sentido', value: 'Webdings' }
    ];

    const fontSelectionInput = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setFieldName('font')
        .setTitle('Tipo de letra')

    fontOptions.forEach(option => {
        const isSelected = option.value === font;
        fontSelectionInput.addItem(option.text, option.value, isSelected);
    });

    const getNewCatButton = CardService.newTextButton()
        .setText(params.id ? '¡Nuevo 😺!' : '¡A ver el gato!')
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOnClickAction(CardService.newAction()
            .addRequiredWidget('width')
            .addRequiredWidget('height')
            .addRequiredWidget('font')
            .setFunctionName(updateCatCallback.name)
            .setParameters({
                hostAppContext: JSON.stringify(params.hostAppContext),
                insertFunctionName: params.insertFunctionName,
            }));

    const updateCatButton = CardService.newTextButton()
        .setText('¡Cambiar 💬!')
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOnClickAction(CardService.newAction()
            .addRequiredWidget('width')
            .addRequiredWidget('height')
            .addRequiredWidget('font')
            .setFunctionName(updateCatCallback.name)
            .setParameters({
                hostAppContext: JSON.stringify(params.hostAppContext),
                insertFunctionName: params.insertFunctionName,
                id: (params.id ?? ''),
            }));

    const buttons = CardService.newButtonSet().addButton(getNewCatButton);

    if (params.id) {
        buttons.addButton(updateCatButton);
    }

    const catFormSection = CardService.newCardSection()
        .setHeader('Opciones')
        .setCollapsible(true)
        .setNumUncollapsibleWidgets(2)
        .addWidget(messageTextInput)
        .addWidget(catTagsSelectionInput(20, 'tags', 'Características', tags))
        .addWidget(sizeTextInput('width', 'Ancho', '¿Qué tan gordo el gato?', width))
        .addWidget(sizeTextInput('height', 'Alto', '¿Qué tan alto el gato', height))
        .addWidget(fontSelectionInput);

    const catButtonsSection = CardService.newCardSection().addWidget(buttons);

    const card = CardService.newCardBuilder()
        .setHeader(catHeader('¿Te gustan los gatos?', '¡Son preciosos!'))
        .setPeekCardHeader(catHeader('Selección de gato', '¡Imágenes!', 'naranja', false))
        .setFixedFooter(cardFooter())
        .addSection(catFormSection)
        .addSection(catButtonsSection);

    if (params.url) {
        const insertCatButton = CardService.newTextButton()
            .setText('😻 ¡Adoptar gato! 😹')
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setOnClickAction(CardService.newAction()
                .setFunctionName(params.insertFunctionName)
                .setParameters({
                    hostAppContext: JSON.stringify(params.hostAppContext),
                    imageUrl: params.url
                }))
        card.addSection(CardService.newCardSection()
            .addWidget(catImage(params.url, 'Miau'))
            .addWidget(insertCatButton));
    }

    return card.build();
}

/**
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e 
 * @returns {GoogleAppsScript.Card_Service.ActionResponse}
 */
function updateCatCallback(e) {
    console.log(e);

    const validFonts = [
        'Comic Sans MS',
        'Andale Mono',
        'Impact',
        'Arial',
        'Arial Black',
        'Courier New',
        'Georgia',
        'Times New Roman',
        'Verdana',
        'Webdings'
    ]

    /** @type {CatSelectionCardParams} */
    const params = {
        hostAppContext: JSON.parse(e.commonEventObject.parameters?.hostAppContext ?? '{}'),
        insertFunctionName: e.commonEventObject.parameters?.insertFunctionName ?? '',
        id: e.commonEventObject.parameters?.id,
        message: e.commonEventObject.formInputs.message?.stringInputs.value[0],
        tags: e.commonEventObject.formInputs.tags?.stringInputs.value,
        height: e.commonEventObject.formInputs.height?.stringInputs.value[0],
        width: e.commonEventObject.formInputs.width?.stringInputs.value[0],
        font: e.commonEventObject.formInputs.font?.stringInputs.value[0],
    }

    const baseUrl = 'https://cataas.com/cat';
    const baseParams = '?fit=contain&position=center&fontSize=30&fontColor=%23fff&fontBackground=%23000&json=true';
    const pathSegments = [];
    const queryParams = [];

    if (params.id) {
        pathSegments.push(encodeURIComponent(params.id));
    } else if (params.tags && params.tags.length > 0) {
        pathSegments.push(encodeURIComponent(params.tags.join(',')));
    }

    params.message = sanitize(params.message);
    if (params.message) {
        pathSegments.push('says', encodeURIComponent(params.message));
    }

    const minSize = 32;
    const maxSize = 1024;

    let height = parseInt(params.height, 10);
    if (isNaN(height) || height < minSize || height > maxSize) {
        height = 480;
    }
    params.height = height.toString();

    let width = parseInt(params.width, 10);
    if (isNaN(width) || width < minSize || width > maxSize) {
        width = 640;
    }
    params.width = width.toString();

    queryParams.push(`height=${height}`);
    queryParams.push(`width=${width}`);

    if (!validFonts.includes(params.font)) {
        params.font = validFonts[0];
    }

    queryParams.push(`font=${encodeURIComponent(params.font)}`);

    let requestUrl = baseUrl;

    if (pathSegments.length > 0) {
        requestUrl += '/' + pathSegments.join('/');
    }

    requestUrl += baseParams;

    if (queryParams.length > 0) {
        requestUrl += '&' + queryParams.join('&')
    }

    console.log('URL: ', requestUrl);

    /** @type {CataasJsonReply} */
    let data;

    try {
        const response = UrlFetchApp.fetch(requestUrl, { 'muteHttpExceptions': true });
        const responseCode = response.getResponseCode();
        const responseText = response.getContentText();

        if (responseCode === 200) {
            data = JSON.parse(responseText);
        } else if (responseCode === 404 && responseText.includes('Cat not found')) {
            return CardService.newActionResponseBuilder()
                .setNotification(CardService.newNotification()
                    .setText('😿 No existe un gato con esas características 🙀 ¿Por qué no quitas algunas? 😸'))
                .build();
        } else {
            throw new Error(`Request failed with status ${responseCode}. Response: ${responseText}`);
        }
    } catch (e) {
        console.error(e);

        return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
                .setText('😾 El gato no quiso venir 😿'))
            .build();
    }

    console.log(data);

    params.id = data.id;
    params.tags = data.tags;
    params.url = data.url;

    const card = catSelectionCard(params);

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation().updateCard(card))
        .build();
}


