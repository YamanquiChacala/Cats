/**
 * Returns a card showing the itemId folder (or its surrounding folder).
 * If no itemId, shows a card to select the drive.
 * 
 * @param {FolderCardParams} params
 * @returns {GoogleAppsScript.Card_Service.Card}
 */
function buildFolderCard(params) {

    if (!params.itemId) {
        return BuildDriveSelectCard_(params);
    }

    const apiParams = {
        supportsAllDrives: true,
        fields: 'name, driveId, ownedByMe, parents, mimeType',
    }
    const item = Drive.Files.get(itemId, apiParams);

    console.log('Item: ', item);

    // My Drive - no driveId, no parents - name: Mi Unidad
    // Shared drive - no parents - name: drive
    // item in My Drive - no driveId
    // item in Shared drive - everything!
    // shared item - no parents, ownedByMe false

    if (item.ownedByMe === false) { // Shared with me file or foler.
        return BuildDriveSelectCard_(reverseOrder);
    }

    const isFolder = item.mimeType === 'application/vnd.google-apps.folder';

    if (!isFolder) {
        return buildFolderCard(item.parents[0], reverseOrder);
    }

    let driveName = 'Mi Unidad';
    if (item.driveId) {
        driveName = Drive.Drives.get(item.driveId, { ...apiParams, fields: 'name' }).name;
    }

    return buildFolderSelectCard_(itemId, item.driveId, item.name, driveName, item.parents?.[0] ?? '', reverseOrder);
}

/**
 * Card for the user to selct the drive they want to use.
 * 
 * @param {boolean} reverseOrder false: A-Z, true: Z-A
 * @returns {GoogleAppsScript.Card_Service.Card} A drive selection card.
 */
function BuildDriveSelectCard_(reverseOrder) {
    const myDriveWidget = CardService.newDecoratedText()
        .setText('Mi Unidad')
        .setBottomLabel('Disco personal')
        .setStartIcon(CardService.newIconImage()
            .setMaterialIcon(CardService.newMaterialIcon()
                .setName('home_and_garden')))
        .setOnClickAction(CardService.newAction()
            .setFunctionName(handleNavigateToFolder.name)
            .setParameters({ itemId: 'root', reverseOrder: reverseOrder.toString() }));

    const drivesSection = CardService.newCardSection()
        .addWidget(myDriveWidget)
        .addWidget(CardService.newDivider())

    const orderBy = 'name_natural' + (reverseOrder ? ' desc' : '');
    const sharedDrives = Drive.Drives.list({ orderBy, fields: 'drives(id, name)' }).drives || [];
    sharedDrives.forEach((drive) => {
        const widget = CardService.newDecoratedText()
            .setText(drive.name)
            .setBottomLabel('Disco compartido')
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('folder_shared')))
            .setOnClickAction(CardService.newAction()
                .setFunctionName(handleNavigateToFolder.name)
                .setParameters({ itemId: drive.id, reverseOrder: reverseOrder.toString() }));
        drivesSection.addWidget(widget);
    });

    return CardService.newCardBuilder()
        .setHeader(catHeader('Elige una carpeta', '¡Que le guste al gato!'))
        .addSection(getOrderSection_('', reverseOrder))
        .addSection(drivesSection)
        .setFixedFooter(cardFooter())
        .build();
}

/**
 * A card showing the folders of the given prent, so users can select one.
 * 
 * @param {string} folderId The folder being shown
 * @param {string} driveId The Drive the folder belongs to
 * @param {string} folderName The name of the folder being shown
 * @param {string} driveName The name of the Shared Drive
 * @param {string} parentId The id of the parent of the foldr being shown. 
 * @param {boolean} reverseOrder false A-Z, true Z-A
 * @returns {GoogleAppsScript.Card_Service.Card}
 */
function buildFolderSelectCard_(folderId, driveId, folderName, driveName, parentId, reverseOrder) {
    const q = `trashed = false and '${folderId}' in parents`;
    const corpora = driveId ? 'drive' : 'user';
    const orderBy = 'name_natural' + (reverseOrder ? ' desc' : '');
    const params = {
        q,
        corpora,
        orderBy,
        pagesize: 100,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        fields: 'files(name,id,mimeType),nextPageToken' //,capabilities(canRename,canEdit,canTrash,canAddChildren,canModifyContent,canRemoveChildren))'
    }
    if (driveId) {
        params.driveId = driveId;
    }

    const queryResult = Drive.Files.list(params)
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
                .setFunctionName(handleNavigateToFolder.name)
                .setParameters({ itemId: folder.id, reverseOrder: reverseOrder.toString() }));
        foldersSection.addWidget(widget);
    });

    const backSection = CardService.newCardSection()
        .addWidget(CardService.newDecoratedText()
            .setText('Regresar')
            .setBottomLabel('Subir un nivel')
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('drive_folder_upload')))
            .setOnClickAction(CardService.newAction()
                .setFunctionName(handleNavigateToFolder.name)
                .setParameters({ itemId: parentId, reverseOrder: reverseOrder.toString() })));

    const addFileSection = CardService.newCardSection()
        .addWidget(CardService.newTextButton()
            .setText('¡Insertar 😻 aquí!')
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setOnClickAction(CardService.newAction()
                .setFunctionName(openCatSelectionCallback.name)
                .setParameters({ folderId })));

    const card = CardService.newCardBuilder()
        .setHeader(catHeader('Elige una carpeta', '¡Que le guste al gato!'))
        .addSection(currentFolderSection)
        .addSection(backSection)
        .addSection(getOrderSection_(folderId, reverseOrder))
        .setFixedFooter(cardFooter())
        .setPeekCardHeader(catHeader(folderName, `En ${driveName}`, 'naranja', false));

    if (folders.length > 0) {
        card.addSection(foldersSection)
    }

    card.addSection(addFileSection);

    return card.build()
}

/**
 * Calls {@link buildFolderCard} using the parametes passed.
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e 
 * @returns {GoogleAppsScript.Card_Service.ActionResponse}
 */
function handleNavigateToFolder(e) {
    console.log(e);

    const card = buildFolderCard(
        e.commonEventObject.parameters?.itemId ?? '',
        e.commonEventObject.parameters?.reverseOrder === 'true'
    );

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation()
            .updateCard(card))
        .build();
}


/**
 * Drive widget to select ordering (A-Z) or (Z-A) for the list of folders.
 * 
 * @param {string} folderId
 * @param {boolean} reverseOrder Swap from A-Z to Z-A
 * @returns {GoogleAppsScript.Card_Service.CardSection} Widget showing the sort order A-Z or Z-A
 */
function getOrderSection_(folderId, reverseOrder) {
    let orderText = 'A-Z';
    let orderImage = 'arrow_downward';
    if (reverseOrder) {
        orderText = 'Z-A';
        orderImage = 'arrow_upward';
    }

    const orderWidget = CardService.newDecoratedText()
        .setText(`Orden: <b>${orderText}</b>`)
        .setBottomLabel('<i>Selecciona para invertir</i>')
        .setStartIcon(CardService.newIconImage().setMaterialIcon(CardService.newMaterialIcon()
            .setName('format_line_spacing')))
        .setEndIcon(CardService.newIconImage().setMaterialIcon(CardService.newMaterialIcon()
            .setName(orderImage)
            .setGrade(200)))
        .setOnClickAction(CardService.newAction()
            .setFunctionName(handleNavigateToFolder.name)
            .setParameters({ itemId: folderId, reverseOrder: (!reverseOrder).toString() }));
    return CardService.newCardSection().addWidget(orderWidget);
}