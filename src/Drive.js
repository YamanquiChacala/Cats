/**
 * Main function called when the user opens the app in Drive.
 * 
 * @param {GoogleAppsScript.AddOn.AddOnEvent} e Generic details of the user.
 * @returns {GoogleAppsScript.Card_Service.Card} The main card to display to the user.
 */
function onDriveHomepage(e) {
    console.log(e);

    return driveSelectCard();
}

/**
* Main function when the user selects an item on Drive

* @param {GoogleAppsScript.AddOn.AddOnEvent} e Details of the selection.
* @return {GoogleAppsScript.Card_Service.Card} The card to show to the user.
*/
function onDriveItemsSelected(e) {
    console.log(e);
    console.log(`Timezone offset: ${e.commonEventObject.timeZone.offset + 1000}`);
    /** @type {{title:string}[]} */
    var items = e.drive.selectedItems;
    // Include at most 5 items in the text.
    items = items.slice(0, 5);
    var text = items.map(function (item) {
        var title = item.title;
        // If neccessary, truncate the title to fit in the image.
        title = sanitize(title);
        return title;
    }).join('\n');
    return createCatCard(text);
}

/**
 * Widget to select ordering (A-Z) or (Z-A) for the list of folders.
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
 * @param {{ parameters: { parentId: any; driveId: any; folderName: any; reverseOrder: string; }; }} e
 */
function handleOrderSwitch(e) {
    const parentId = e.parameters.parentId;
    const driveId = e.parameters.driveId;
    const folderName = e.parameters.folderName;
    const reverseOrder = e.parameters.reverseOrder === 'true';

    const card = folderSelectCard(parentId, driveId, folderName, reverseOrder);

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation()
            .updateCard(card))
        .build();
}

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
    let text = `<b>${fileCount}</b> archivos`;
    if (fileCount == 0) {
        icon = 'file_copy_off';
        text = 'Carpeta <b>vacía</b>'
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
    const corpora = driveId === 'root' ? 'user' : 'drive'
    const orderBy = 'name_natural' + (reverseOrder ? ' desc' : '');
    const params = {
        corpora,
        orderBy,
        pagesize: 100,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        fields: 'files(name,id,driveId,capabilities(canRename,canEdit,canTrash,canAddChildren,canModifyContent,canRemoveChildren))'
    }
    if (corpora === 'drive') {
        params.driveId = driveId;
    }

    const files = Drive.Files.list({ ...params, q: query(parentId, true), fields: 'files(id)' }).files;
    const folders = Drive.Files.list({ ...params, q: query(parentId, false) }).files;


    const foldersSection = CardService.newCardSection()
        .addWidget(CardService.newDecoratedText()
            .setText(`<b>${folderName}</b>`)
            .setBottomLabel('Carpeta actual')
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('folder_eye'))))
        .addWidget(CardService.newDivider())
        .addWidget(fileCountWidget(files.length))
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
 * @param {GoogleAppsScript.AddOn.AddOnEvent} e
 */
function showFolders(e) {
    console.log(e);
    const parentId = e.parameters.parentId;
    const driveId = e.parameters.driveId;
    const folderName = e.parameters.folderName;
    const reverseOrder = e.parameters.reverseOrder === 'true';

    const card = folderSelectCard(parentId, driveId, folderName, reverseOrder);

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation()
            .pushCard(card))
        .build();
}