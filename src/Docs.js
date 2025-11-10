/**
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e 
 * @returns {GoogleAppsScript.Card_Service.Card}
 */
function onDocsHomepage(e) {
    return buildBasicCard(e);
}

/**
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e 
 * @returns {GoogleAppsScript.Card_Service.Card}
 */
function onDocsFileScopeGranted(e) {
    return buildBasicCard(e);
}

/**
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e 
 * @returns {GoogleAppsScript.Card_Service.Card}
 */
function buildBasicCard(e) {
    console.log(e);
    if (!e.docs.addonHasFileScopePermission) {
        const section = CardService.newCardSection()
            .addWidget(CardService.newTextParagraph()
                .setText('Da permiso para modificar el archivo'));
        const action = CardService.newAction()
            .setFunctionName(handleAskPermission.name);
        const button = CardService.newTextButton()
            .setText('Dar permiso')
            .setOnClickAction(action);
        section.addWidget(button);
        return CardService.newCardBuilder()
            .addSection(section)
            .build();
    }

    const docId = e.docs.id;
    const fileName = e.docs.title;

    const content = Docs.Documents.get(docId);

    console.log('Full Doc:\n', content);
    console.log('Body:\n', content.body.content);
    console.log('Paragraph:\n', content.body.content[1].paragraph);
    console.log('Text:\n', content.body.content[1].paragraph.elements[0].textRun);

    const action = CardService.newAction()
        .setFunctionName(handleUpdateStyle.name)
        .setParameters({ docId });

    const button = CardService.newTextButton()
        .setText('Cambiar formato')
        .setOnClickAction(action);

    const section = CardService.newCardSection()
        .addWidget(CardService.newTextParagraph()
            .setText(`This file is named: ${fileName}`))
        .addWidget(button);
    return CardService.newCardBuilder()
        .addSection(section)
        .build();
}


/**
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e 
 * @returns {GoogleAppsScript.Card_Service.EditorFileScopeActionResponse}
 */
function handleAskPermission(e) {
    return CardService.newEditorFileScopeActionResponseBuilder()
        .requestFileScopeForActiveDocument()
        .build();
}

/**
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e 
 * @returns {GoogleAppsScript.Card_Service.ActionResponse}
 */
function handleUpdateStyle(e) {
    console.log(e);
    const docId = e.commonEventObject.parameters.docId;

    updateTextStyle(docId)

    return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification()
            .setText('Listo!'))
        .build();
}

/**
 * 
 * @param {string} docId 
 */
function updateTextStyle(docId) {
    Docs.Documents.batchUpdate({
        requests: [
            {
                updateTextStyle: {
                    textStyle: { smallCaps: true },
                    fields: 'smallCaps',
                    range: { startIndex: 1, endIndex: 21 },
                }
            }
        ]
    }, docId);
}