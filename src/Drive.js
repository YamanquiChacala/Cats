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

    const isFolder = selectedFile.mimeType === 'application/vnd.google-apps.folder';

    let parentId = selectedFileId;
    let folderName = selectedFile.name;

    if (!isFolder) {
        parentId = selectedFile.parents[0];
        folderName = Drive.Files.get(parentId, {supportsAllDrives: true, fields: 'name'}).name;
    }

    return folderSelectCard(parentId, driveId, folderName, false);
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
            .setParameters({ parentId: 'root', driveId: 'root', folderName: 'Mi Unidad', reverseOrder: 'false' }));

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
                .setParameters({ parentId: drive.id, driveId: drive.id, folderName: drive.name, reverseOrder: 'false' }));
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
 * @param {string} parentId
 * @param {boolean} files
 * @returns {string} The query for Drive API
 */
function query(parentId, files) {
    return `mimeType ${files ? '!' : ''}= 'application/vnd.google-apps.folder' and trashed = false and '${parentId}' in parents`;
}

/**
 * @param {number} fileCount
 */
function fileCountWidget(fileCount) {
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
 * @param {string} parentId
 * @param {string} driveId
 * @param {string} folderName
 * @param {boolean} reverseOrder
 */
function folderSelectCard(parentId, driveId, folderName, reverseOrder) {
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
        fields: 'files(name,id,driveId,mimeType)' //,capabilities(canRename,canEdit,canTrash,canAddChildren,canModifyContent,canRemoveChildren))'
    }
    if (corpora === 'drive') {
        params.driveId = driveId;
    }

    const allFiles = Drive.Files.list(params).files;

    /** @type {GoogleAppsScript.Drive_v3.Drive.V3.Schema.File[]} */
    const folders = [];
    const otherFiles = [];

    for( const f of allFiles ) {
        if(f.mimeType === 'application/vnd.google-apps.folder') {
            folders.push(f);
        } else {
            otherFiles.push(f);
        }
    }

    const foldersSection = CardService.newCardSection()
        .addWidget(CardService.newDecoratedText()
            .setText(`<b>${folderName}</b>`)
            .setBottomLabel('Carpeta actual')
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('folder_eye'))))
        .addWidget(CardService.newDivider())
        .addWidget(fileCountWidget(otherFiles.length))
        .addWidget(CardService.newDivider());


    folders.forEach((folder) => {
        const widget = CardService.newDecoratedText()
            .setText(folder.name)
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('folder')))
            .setOnClickAction(CardService.newAction()
                .setFunctionName(showFolders.name)
                .setParameters({ parentId: folder.id, driveId, folderName: folder.name, reverseOrder: reverseOrder.toString() }));
        foldersSection.addWidget(widget);
    });

    return CardService.newCardBuilder()
        .setHeader(catHeader('Elige una carpeta', folderName))
        .addSection(orderSection(parentId, driveId, folderName, reverseOrder))
        .addSection(foldersSection)
        .setFixedFooter(cardFooter())
        .build()
}

/**
 * @param {GoogleAppsScript.Addons.EventObject} e
 */
function showFolders(e) {
    console.log(e);
    const parentId = e.commonEventObject.parameters.parentId;
    const driveId = e.commonEventObject.parameters.driveId;
    const folderName = e.commonEventObject.parameters.folderName;
    const reverseOrder = e.commonEventObject.parameters.reverseOrder === 'true';

    const card = folderSelectCard(parentId, driveId, folderName, reverseOrder);

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation()
            .pushCard(card))
        .build();
}