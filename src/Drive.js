/**
 * Main function called when the user opens the app in Drive.
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e Default Google event
 * @returns {GoogleAppsScript.Card_Service.Card} {@link driveSelectCard}
 */
function onDriveHomepage(e) {
    console.log(e);

    return driveSelectCard();
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
        parentId = selectedFile.parents[0];
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

    const url = 'https://cataas.com/api/tags';
    const response = UrlFetchApp.fetch(url);
    const jsonText = response.getContentText();
    /** @type {[string]} */
    const fullData = JSON.parse(jsonText);
    const sampleSize = 20;
    const sample = ['cute', 'kitten', 'orange', 'small'];
    const lowercaseTracker = new Set(sample);

    while (sample.length < sampleSize) {
        const randomIndex = Math.floor(Math.random() * fullData.length);
        const randomElement = fullData[randomIndex];
        const lowercaseRandomElement = randomElement.toLowerCase();
        if (!lowercaseTracker.has(lowercaseRandomElement)) {
            sample.push(randomElement);
            lowercaseTracker.add(lowercaseRandomElement);
        }
    }

    sample.sort();

    console.log(sample);

    const selectionInput = CardService.newSelectionInput()
        .setFieldName('tags')
        .setType(CardService.SelectionInputType.MULTI_SELECT)
        .setTitle('Cat Tag');

    sample.forEach(tag => {
        selectionInput.addMultiSelectItem(tag, tag, false, 'https://media.githubusercontent.com/media/YamanquiChacala/Cats/refs/heads/main/images/white_48.png', 'Tipo de gato');
        //selectionInput.addItem(tag, tag, false);
    });

    const input2 = CardService.newCardSection()
        .addWidget(CardService.newTextInput()
            .setFieldName('test3')
            .setTitle('Historia')
            .setHint('Tu historia')
            .setSuggestions(CardService.newSuggestions()
                .addSuggestions(sample))
            .setMultiline(true)
            .setValidation(CardService.newValidation()
                .setCharacterLimit(100)
                .setInputType(CardService.InputType.TEXT)))
        .addWidget(selectionInput)
        .addWidget(CardService.newDateTimePicker()
            .setFieldName('test4')
            .setTitle('Cumpleaños')
            .setValueInMsSinceEpoch(Date.now())
            .setTimeZoneOffsetInMins(-25200 / 60))

    const input = CardService.newCardSection()
        .addWidget(CardService.newTextInput()
            .setFieldName('test')
            .setTitle('Edad')
            .setHint('Número entero')
            .setValidation(CardService.newValidation()
                .setCharacterLimit(10)
                .setInputType(CardService.InputType.INTEGER)))
        .addWidget(CardService.newSelectionInput()
            .setFieldName('test2')
            .setType(CardService.SelectionInputType.DROPDOWN)
            .setTitle('Selecciona')
            .addItem('opcion 1', 1, false)
            .addItem('opcion 2', 'dos', true)
            .addItem('opcion 3', false, false))
        .addWidget(CardService.newTextButton()
            .setText("Probar")
            .setOnClickAction(CardService.newAction()
                //.setAllWidgetsAreRequired(true)
                .setFunctionName('testCallback')));

    return CardService.newCardBuilder()
        .setHeader(catHeader('Elige una carpeta', '¡Que le guste al gato!'))
        .addSection(drivesSection)
        .addSection(input2)
        .addSection(input)
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
 * @param {string} parentId The folder being shown
 * @param {string} driveId The Drive the folder belongs to
 * @param {string} folderName The name of the folder being shown
 * @param {string} driveName The name of the Shared Drive
 * @param {boolean} reverseOrder false A-Z, true Z-A
 * @returns {GoogleAppsScript.Card_Service.Card}
 */
function folderSelectCard(parentId, driveId, folderName, driveName, reverseOrder) {
    const q = `trashed = false and '${parentId}' in parents`;
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
        .addSection(orderSection(parentId, driveId, folderName, reverseOrder))
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