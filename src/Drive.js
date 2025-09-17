/**
* Callback for rendering the card for specific Drive items.
* @param {Object} e The event object.
* @return {GoogleAppsScript.Card_Service.Card} The card to show to the user.
*/
function onDriveItemsSelected(e) {
    console.log(e);
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
 * @param {boolean} reverse Swap from A-Z to Z-A
 * @returns {GoogleAppsScript.Card_Service.CardSection} Widget showing the sort order A-Z or Z-A
 */
function orderSection(reverse) {
    let orderText = 'A-Z';
    let orderImage = 'arrow_downward';
    if (reverse) {
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
            .setFunctionName('')
            .setParameters({}));
    return CardService.newCardSection().addWidget(orderWidget);
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
 * @param {string} driveId
 * @param {string} folderName
 * @param {boolean} reverseOrder
 */
function folderSelectCard(parentId, driveId, folderName, reverseOrder) {
    const foldersSection = CardService.newCardSection();

    const q = `mimeType = 'application/vnd.google-apps.folder' and trashed = false and '${parentId}' in parents`;
    const corpora = driveId === 'root' ? 'user' : 'drive'
    const orderBy = 'name_natural' + (reverseOrder ? ' desc' : '');
    const params = {
        q,
        corpora,
        orderBy,
        pagesize: 100,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true
    }
    if (corpora === 'drive') {
        params.driveId = driveId;
    }

    const folders = Drive.Files.list(params).files;

    if (!folders || folders.length == 0) {
        foldersSection.addWidget(CardService.newTextParagraph().setText('Folder vacío'));
    }

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
        .addSection(orderSection(reverseOrder))
        .addSection(foldersSection)
        .setFixedFooter(cardFooter())
        .build()
}

/**
 * @param {{ parameters: { parentId: any; driveId: any; folderName: any; reverseOrder: string; }; }} e
 */
function showFolders(e) {
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

/**
 * @param {string | object} e
 */
function onDriveHomepage(e) {
    console.log(e);

    return driveSelectCard();
}