/**
 * Main function called when the user opens the app in Drive.
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e Default Google event
 * @returns {GoogleAppsScript.Card_Service.Card} {@link BuildDriveSelectCard_}
 */
function onDriveHomepage(e) {
    console.log(e);

    /** @type {FolderCardParams} */
    const cardParams = {
        itemId: '',
        reverseOrder: false,
        callbackFunctionName: handleFolderSelected.name,
        callbackButtonText: '¡Inserta 🐱 aqui!',
        headerParams: {
            title: '¿Dónde poner el 🐱?',
            subtitle: 'Elige una carpeta',
            imageUrl: 'https://media.githubusercontent.com/media/YamanquiChacala/Cats/refs/heads/main/images/icon_48.png',
            border: true,
        }
    };

    return buildFolderCard(cardParams);
}

/**
* Main function when the user selects an item on Drive

* @param {GoogleAppsScript.Addons.EventObject} e Default Google event
* @return {GoogleAppsScript.Card_Service.Card} {@link buildFolderSelectCard_}
*/
function onDriveItemsSelected(e) {
    console.log(e);

    /** @type {FolderCardParams} */
    const cardParams = {
        itemId: e.drive.selectedItems[0].id,
        reverseOrder: false,
        callbackFunctionName: handleFolderSelected.name,
        callbackButtonText: '¡Inserta 🐱 aqui!',
        headerParams: {
            title: '¿Dónde poner el 🐱?',
            subtitle: 'Elige una carpeta',
            imageUrl: 'https://media.githubusercontent.com/media/YamanquiChacala/Cats/refs/heads/main/images/icon_48.png',
            border: true,
        }
    };

    return buildFolderCard(cardParams);
}


/**
 * @param {GoogleAppsScript.Addons.EventObject} e
 * @returns {GoogleAppsScript.Card_Service.ActionResponse}
 */
function handleFolderSelected(e) {
    console.log(e);

    const folderId = e.commonEventObject.parameters.folderId;

    /** @type {CatSelectionCardParams} */
    const params = {
        hostAppContext: { folderId },
        insertFunctionName: handleCatImageDriveInsert.name
    };

    const card = buildCatSelectionCard(params);

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation()
            .pushCard(card))
        .build();
}

/**
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e 
 */
function handleCatImageDriveInsert(e) {
    console.log(e);

    const hostAppContextJSON = e.commonEventObject.parameters?.hostAppContext;
    const catName = e.commonEventObject.parameters?.catName || 'gato';
    const imageUrl = e.commonEventObject.parameters?.imageUrl;

    if (!hostAppContextJSON || !imageUrl) {
        return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
                .setText('Weird error, restart the add-on'))
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
    const fileName = catName + '.png';

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






