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

function orderSection(reverse) {
    const orderWidget = CardService.newDecoratedText()
        .setText('Orden:')
        .setButton(CardService.newImageButton()
            .setMaterialIcon(CardService.newMaterialIcon()
                .setName('arrow_circle_down')
                .setFill(true)
                .setGrade(200))
            .setOnClickAction(CardService.newAction()
                .setFunctionName('')
                .setParameters({})));
    return CardService.newCardSection().addWidget(orderWidget);
}

function orderSection2(reverse) {
    const orderButton1 = CardService.newImageButton()
        .setMaterialIcon(CardService.newMaterialIcon()
            .setName('arrow_circle_down')
            .setWeight(700)
            .setGrade(200))
        .setOnClickAction(CardService.newAction()
            .setFunctionName('')
            .setParameters({}));
    const orderButton2 = CardService.newImageButton()
        .setMaterialIcon(CardService.newMaterialIcon()
            .setName('arrow_circle_up')
            .setWeight(700)
            .setGrade(200))
        .setOnClickAction(CardService.newAction()
            .setFunctionName('')
            .setParameters({}));
    return CardService.newCardSection()
        .setHeader('Orden:')
        .addWidget(CardService.newButtonSet().addButton(orderButton1).addButton(orderButton2));
}


function onDriveHomepage(e) {
    console.log(e);

    const drivesSection = CardService.newCardSection();

    const myDriveWidget = CardService.newDecoratedText()
        .setText('My Drive')
        .setBottomLabel('Personal Storage')
        .setStartIcon(CardService.newIconImage()
            .setMaterialIcon(CardService.newMaterialIcon()
                .setName('home_and_garden')))
        .setOnClickAction(CardService.newAction()
            .setFunctionName(handleDriveClick.name)
            .setParameters({ driveId: 'root', driveName: 'My Drive' }));

    drivesSection.addWidget(myDriveWidget);

    const parentId = '0AHqykuEEl-erUk9PVA';
    const q = "mimeType = 'application/vnd.google-apps.folder' and trashed = false and '" + parentId + "' in parents";
    const params = {
        q: q,
        corpora: 'drive',
        driveId: '0AHqykuEEl-erUk9PVA',
        orderBy: 'name_natural',
        pageSize: 100,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true
    };
    const resp = Drive.Files.list(params);
    console.log(resp);


    const drives = Drive.Drives.list().drives || [];
    drives.forEach((drive) => {
        const widget = CardService.newDecoratedText()
            .setText(drive.name)
            .setBottomLabel('Shared Drive')
            .setStartIcon(CardService.newIconImage()
                .setMaterialIcon(CardService.newMaterialIcon()
                    .setName('folder_shared')))
            .setOnClickAction(CardService.newAction()
                .setFunctionName(handleDriveClick.name)
                .setParameters({ driveId: drive.id, driveName: drive.name }));
        drivesSection.addWidget(widget);
    });

    return CardService.newCardBuilder()
        .setHeader(catHeader('Elige una carpeta', '¡Que le guste al gato!'))
        .addSection(orderSection2(false))
        .addSection(drivesSection)
        .build();
}

function handleDriveClick(e) {
    console.log(e);
    const driveId = e.parameters.driveId;
    const driveName = e.parameters.driveName;

    const section = CardService.newCardSection()
        .addWidget(CardService.newTextParagraph()
            .setText('You selected <b>' + driveName + '</b>'))

    const card = CardService.newCardBuilder()
        .addSection(section)
        .build();

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation()
            .pushCard(card))
        .build();
}

function folderListCard(driveId, driveName) {
    const folderSelection = CardService.newCardSection();

    const folders = Drive.Files.list({
        q: "mimeType='application/vnd.google-apps.folder' and trashed=false",

    });
}