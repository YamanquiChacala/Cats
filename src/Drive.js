/**
 * Main function called when the user opens the app in Drive.
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e Default Google event
 * @returns {GoogleAppsScript.Card_Service.Card} {@link driveSelectCard}
 */
function onDriveHomepage(e) {
    console.log(e);

    // /** @type {CatSelectionCardParams} */
    // const fakeContext = {
    //     hostAppContext: {
    //         driveFolderId: 'a8asdfjasdhyfa',
    //     },
    //     insertFunctionName: 'fake',
    // }

    // return catImageCard(fakeContext);
    return driveSelectCard();
}

/**
 * 
 * @param {CatSelectionCardParams} params
 * @returns 
 */
function catImageCard(params) {
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
                    url: params.url
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

    const card = catImageCard(params);

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation().updateCard(card))
        .build();
}

/**
* Main function when the user selects an item on Drive

* @param {GoogleAppsScript.Addons.EventObject} e Default Google event
* @return {GoogleAppsScript.Card_Service.Card} {@link folderSelectCard}
*/
function onDriveItemsSelected(e) {
    console.log(e);

    const params = {
        supportsAllDrives: true,
        fields: 'name, driveId, parents, mimeType',
    }

    const selectedFileId = e.drive.selectedItems[0].id;
    const selectedFile = Drive.Files.get(selectedFileId, params)

    const driveId = selectedFile.driveId || 'root';

    let driveName = 'Mi Unidad';
    if (driveId !== 'root') {
        params.fields = 'name';
        driveName = Drive.Drives.get(driveId, params).name;
    }

    const isFolder = selectedFile.mimeType === 'application/vnd.google-apps.folder';

    let parentId = selectedFileId;
    let folderName = selectedFile.name;

    if (!isFolder) {
        parentId = selectedFile.parents?.[0] ?? 'root';
        folderName = Drive.Files.get(parentId, { supportsAllDrives: true, fields: 'name' }).name;
    }

    return folderSelectCard(parentId, driveId, folderName, driveName, false);
}

/**
 * Card for the user to selct the drive they want to use.
 * 
 * @returns {GoogleAppsScript.Card_Service.Card} A drive selection card.
 */
function driveSelectCard() {
    const myDriveWidget = CardService.newDecoratedText()
        .setText('Mi Unidad')
        .setBottomLabel('Disco personal')
        .setStartIcon(CardService.newIconImage()
            .setMaterialIcon(CardService.newMaterialIcon()
                .setName('home_and_garden')))
        .setOnClickAction(CardService.newAction()
            .setFunctionName(showFolders.name)
            .setParameters({ parentId: 'root', driveId: 'root', folderName: 'Mi Unidad', driveName: 'Mi Unidad', reverseOrder: 'false' }));

    const drivesSection = CardService.newCardSection()
        .addWidget(myDriveWidget)
        .addWidget(CardService.newDivider())

    const sharedDrives = Drive.Drives.list({ orderBy: 'name_natural' }).drives || [];
    sharedDrives.forEach((drive) => {
        const widget = CardService.newDecoratedText()
            .setText(drive.name)
            .setBottomLabel('Disco compartido')
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('folder_shared')))
            .setOnClickAction(CardService.newAction()
                .setFunctionName(showFolders.name)
                .setParameters({ parentId: drive.id, driveId: drive.id, folderName: drive.name, driveName: drive.name, reverseOrder: 'false' }));
        drivesSection.addWidget(widget);
    });

    return CardService.newCardBuilder()
        .setHeader(catHeader('Elige una carpeta', '¡Que le guste al gato!'))
        .addSection(drivesSection)
        .setFixedFooter(cardFooter())
        .build();
}

/**
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e 
 * @returns {GoogleAppsScript.Card_Service.SuggestionsResponse}
 */
function provideCatTagsOptions(e) {
    console.log(e);

    const url = 'https://cataas.com/api/tags';
    const response = UrlFetchApp.fetch(url);
    const jsonText = response.getContentText();
    /** @type {[string]} */
    const fullData = JSON.parse(jsonText);

    for (let i = fullData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fullData[i], fullData[j]] = [fullData[j], fullData[i]];
    }

    const sample = fullData.slice(0, 10);

    const suggestions = CardService.newSuggestions().addSuggestions(sample);

    return CardService.newSuggestionsResponseBuilder()
        .setSuggestions(suggestions)
        .build();
}

/**
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e 
 */
function testCallback(e) {
    console.log(e);
    console.log('Fecha y hora: ', e.commonEventObject.formInputs.test4.dateTimeInput);

    return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification()
            .setText('Respuesta del questionario'))
        .build();
}



/**
 * A card showing the folders of the given prent, so users can select one.
 * 
 * @param {string} folderId The folder being shown
 * @param {string} driveId The Drive the folder belongs to
 * @param {string} folderName The name of the folder being shown
 * @param {string} driveName The name of the Shared Drive
 * @param {boolean} reverseOrder false A-Z, true Z-A
 * @returns {GoogleAppsScript.Card_Service.Card}
 */
function folderSelectCard(folderId, driveId, folderName, driveName, reverseOrder) {
    const q = `trashed = false and '${folderId}' in parents`;
    const corpora = driveId === 'root' ? 'user' : 'drive'
    const orderBy = 'name_natural' + (reverseOrder ? ' desc' : '');
    const params = {
        q,
        corpora,
        orderBy,
        pagesize: 100,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        fields: 'files(name,id,driveId,mimeType),nextPageToken' //,capabilities(canRename,canEdit,canTrash,canAddChildren,canModifyContent,canRemoveChildren))'
    }
    if (corpora === 'drive') {
        params.driveId = driveId;
    }

    const queryResult = Drive.Files.list(params)
    const nextPageToken = queryResult.nextPageToken;
    const allFiles = queryResult.files;

    /** @type {GoogleAppsScript.Drive_v3.Drive.V3.Schema.File[]} */
    const folders = [];
    let tooManyFolders = !!queryResult.nextPageToken
    let otherFilesCount = 0;

    for (const f of allFiles) {
        if (f.mimeType === 'application/vnd.google-apps.folder') {
            if (folders.length < 30) {
                folders.push(f);
            } else if (!tooManyFolders) {
                tooManyFolders = true;
            }
        } else {
            otherFilesCount++;
        }
    }

    const currentFolderSection = CardService.newCardSection()
        .addWidget(CardService.newDecoratedText()
            .setText(`<b>${folderName}</b>`)
            .setBottomLabel(`Carpeta en ${driveName}`)
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('folder_eye'))))
        .addWidget(fileCountDecoratedText(otherFilesCount))

    const foldersSection = CardService.newCardSection()
        .setCollapsible(true)
        .setNumUncollapsibleWidgets(0)
        .setHeader(`<b>${tooManyFolders ? 'Mas de' : ''}${folders.length} Carpeta${folders.length > 1 ? 's' : ''}</b>`);

    folders.forEach((folder) => {
        const widget = CardService.newDecoratedText()
            .setText(folder.name)
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('folder')))
            .setOnClickAction(CardService.newAction()
                .setFunctionName(showFolders.name)
                .setParameters({ parentId: folder.id, driveId, folderName: folder.name, driveName, reverseOrder: reverseOrder.toString() }));
        foldersSection.addWidget(widget);
    });

    const card = CardService.newCardBuilder()
        .setHeader(catHeader('Elige una carpeta', '¡Que le guste al gato!'))
        .addSection(currentFolderSection)
        .addSection(orderSection(folderId, driveId, folderName, reverseOrder))
        .setFixedFooter(cardFooter())
        .setPeekCardHeader(catHeader(folderName, `En ${driveName}`, 'naranja', false));

    if (folders.length > 0) {
        card.addSection(foldersSection)
    }

    return card.build()
}

/**
 * Action used to push a new {@link folderSelectCard} on the card stack.
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e Google event object, with parameters to build the card:
 * 
 * parentId - The id of the folder to display.
 * 
 * driveId - The id of the shared drive where the folder is, or 'roor' if in MyDrive.
 * 
 * folderName - The name of the folder to display.
 * 
 * diverName - The name of the Shared Drive, or "My Drive"
 * 
 * reverseOrder - false -> A-Z, true -> Z-A
 * 
 * @returns {GoogleAppsScript.Card_Service.ActionResponse} Response that pushes card on the stack
 */
function showFolders(e) {
    console.log(e);
    const parentId = e.commonEventObject.parameters.parentId;
    const driveId = e.commonEventObject.parameters.driveId;
    const folderName = e.commonEventObject.parameters.folderName;
    const driveName = e.commonEventObject.parameters.driveName;
    const reverseOrder = e.commonEventObject.parameters.reverseOrder === 'true';

    const card = folderSelectCard(parentId, driveId, folderName, driveName, reverseOrder);

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation()
            .pushCard(card))
        .build();
}