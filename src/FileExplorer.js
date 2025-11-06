/**
 * Returns a card showing the itemId folder (or its surrounding folder).
 * If no itemId, shows a card to select the drive.
 * 
 * @param {FolderCardParams} cardParams
 * @returns {GoogleAppsScript.Card_Service.Card}
 */
function buildFolderCard(cardParams) {

    if (!cardParams.itemId) {
        return BuildDriveSelectCard_(cardParams);
    }

    const apiParams = {
        supportsAllDrives: true,
        fields: 'name, driveId, ownedByMe, parents, mimeType',
    }
    const item = Drive.Files.get(cardParams.itemId, apiParams);

    console.log('Item: ', item);

    // My Drive - no driveId, no parents - name: Mi Unidad
    // Shared drive - no parents - name: drive
    // item in My Drive - no driveId
    // item in Shared drive - everything!
    // shared item - no parents, ownedByMe false

    if (item.ownedByMe === false) { // Shared with me file or foler.
        return BuildDriveSelectCard_(cardParams);
    }

    const isFolder = item.mimeType === 'application/vnd.google-apps.folder';

    if (!isFolder) {
        return buildFolderCard({ ...cardParams, itemId: item.parents[0] });
    }

    let driveName = 'Mi Unidad';
    if (item.driveId) {
        driveName = Drive.Drives.get(item.driveId, { ...apiParams, fields: 'name' }).name;
    }

    /** @type {ItemParams} */
    const itemParams = {
        name: item.name,
        driveId: item.driveId,
        driveName,
        parentId: item.parents?.[0] ?? '',
    }

    return buildFolderSelectCard_(cardParams, itemParams);
}

/**
 * Card for the user to selct the drive they want to use.
 * 
 * @param {FolderCardParams} cardParams
 * @returns {GoogleAppsScript.Card_Service.Card} A drive selection card.
 */
function BuildDriveSelectCard_(cardParams) {
    const myDriveParams = { ...cardParams, itemId: 'root' };
    const myDriveWidget = CardService.newDecoratedText()
        .setText('Mi Unidad')
        .setBottomLabel('Disco personal')
        .setStartIcon(CardService.newIconImage()
            .setMaterialIcon(CardService.newMaterialIcon()
                .setName('home_and_garden')))
        .setOnClickAction(CardService.newAction()
            .setFunctionName(handleNavigateToFolder.name)
            .setParameters({ cardParams: JSON.stringify(myDriveParams) }));

    const drivesSection = CardService.newCardSection()
        .addWidget(myDriveWidget)
        .addWidget(CardService.newDivider())

    const orderBy = 'name_natural' + (cardParams.reverseOrder ? ' desc' : '');
    const sharedDrives = Drive.Drives.list({ orderBy, fields: 'drives(id, name)' }).drives || [];
    sharedDrives.forEach((drive) => {
        const driveParams = { ...cardParams, itemId: drive.id }
        const widget = CardService.newDecoratedText()
            .setText(drive.name)
            .setBottomLabel('Disco compartido')
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('folder_shared')))
            .setOnClickAction(CardService.newAction()
                .setFunctionName(handleNavigateToFolder.name)
                .setParameters({ cardParams: JSON.stringify(driveParams) }));
        drivesSection.addWidget(widget);
    });

    const orderParams = { ...cardParams, itemId: '' }
    return CardService.newCardBuilder()
        .setHeader(getHeader_(cardParams.headerParams))
        .addSection(getOrderSection_(orderParams))
        .addSection(drivesSection)
        .setPeekCardHeader(getPeekHeader_('Drives', 'En Google Drive', cardParams.headerParams.imageUrl))
        .build();
}

/**
 * A card showing the folders of the given prent, so users can select one.
 * 
 * @param {FolderCardParams} cardParams
 * @param {ItemParams} itemParams
 * @returns {GoogleAppsScript.Card_Service.Card}
 */
function buildFolderSelectCard_(cardParams, itemParams) {
    const q = `trashed = false and '${cardParams.itemId}' in parents`;
    const corpora = itemParams.driveId ? 'drive' : 'user';
    const orderBy = 'name_natural' + (cardParams.reverseOrder ? ' desc' : '');
    const params = {
        q,
        corpora,
        orderBy,
        pagesize: 100,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        fields: 'files(name,id,mimeType),nextPageToken' //,capabilities(canRename,canEdit,canTrash,canAddChildren,canModifyContent,canRemoveChildren))'
    }
    if (itemParams.driveId) {
        params.driveId = itemParams.driveId;
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
            .setText(`<b>${itemParams.name}</b>`)
            .setBottomLabel(`Carpeta en ${itemParams.driveName}`)
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('folder_eye'))))
        .addWidget(fileCountDecoratedText(otherFilesCount))

    const foldersSection = CardService.newCardSection()
        .setCollapsible(false)
        .setNumUncollapsibleWidgets(0)
        .setHeader(`<b>${tooManyFolders ? 'Mas de' : ''}${folders.length} Carpeta${folders.length > 1 ? 's' : ''}</b>`);

    folders.forEach((folder) => {
        const folderParams = { ...cardParams, itemId: folder.id }
        const widget = CardService.newDecoratedText()
            .setText(folder.name)
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('folder')))
            .setOnClickAction(CardService.newAction()
                .setFunctionName(handleNavigateToFolder.name)
                .setParameters({ cardParams: JSON.stringify(folderParams) }));
        foldersSection.addWidget(widget);
    });

    const backParams = { ...cardParams, itemId: itemParams.parentId }
    const backSection = CardService.newCardSection()
        .addWidget(CardService.newDecoratedText()
            .setText('Regresar')
            .setBottomLabel('Subir un nivel')
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('drive_folder_upload')))
            .setOnClickAction(CardService.newAction()
                .setFunctionName(handleNavigateToFolder.name)
                .setParameters({ cardParams: JSON.stringify(backParams) })));

    const addFileSection = CardService.newCardSection()
        .addWidget(CardService.newTextButton()
            .setText(cardParams.callbackButtonText)
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setOnClickAction(CardService.newAction()
                .setFunctionName(cardParams.callbackFunctionName)
                .setParameters({ folderId: cardParams.itemId })));

    const card = CardService.newCardBuilder()
        .setHeader(getHeader_(cardParams.headerParams))
        .addSection(currentFolderSection)
        .addSection(backSection)
        .addSection(getOrderSection_(cardParams))
        .setPeekCardHeader(getPeekHeader_(itemParams.name, `En ${itemParams.driveName}`, cardParams.headerParams.imageUrl))

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

    /** @type {FolderCardParams} */
    const cardParams = JSON.parse(e.commonEventObject.parameters.cardParams);

    const card = buildFolderCard(cardParams);

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation()
            .updateCard(card))
        .build();
}

/**
 * A Card header.
 * @param {HeaderParams} headerParams 
 * @returns {GoogleAppsScript.Card_Service.CardHeader}
 */
function getHeader_(headerParams) {
    let imageStyle = CardService.ImageStyle.SQUARE;
    if (headerParams.border) {
        imageStyle = CardService.ImageStyle.CIRCLE;
    }
    const header = CardService.newCardHeader()
        .setTitle(headerParams.title)
        .setImageUrl(headerParams.imageUrl)
        .setImageStyle(imageStyle);
    if (headerParams.subtitle) {
        header.setSubtitle(headerParams.subtitle);
    }
    return header;
}

/**
 * A Peek Header.
 * @param {string} title
 * @param {string} subtitle
 * @param {string} imageUrl
 * @returns {GoogleAppsScript.Card_Service.CardHeader}
 */
function getPeekHeader_(title, subtitle, imageUrl) {
    const header = CardService.newCardHeader()
        .setTitle(title)
        .setImageUrl(imageUrl)
        .setSubtitle(subtitle)
    return header;

}

/**
 * Drive widget to select ordering (A-Z) or (Z-A) for the list of folders.
 * 
 * @param {FolderCardParams} cardParams
 * @returns {GoogleAppsScript.Card_Service.CardSection} Widget showing the sort order A-Z or Z-A
 */
function getOrderSection_(cardParams) {
    let orderText = 'A-Z';
    let orderImage = 'arrow_downward';
    if (cardParams.reverseOrder) {
        orderText = 'Z-A';
        orderImage = 'arrow_upward';
    }

    /** @type {FolderCardParams} */
    const newCardParams = { ...cardParams, reverseOrder: !cardParams.reverseOrder };

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
            .setParameters({ cardParams: JSON.stringify(newCardParams) }));
    return CardService.newCardSection().addWidget(orderWidget);
}