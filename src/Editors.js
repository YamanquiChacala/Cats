
/**
 * @param {object} e
 */
function onEditorHomepage(e) {
    const mainHeader = CardService.newCardHeader()
        .setTitle('¡Aparece un gato!')
        .setSubtitle('¿No es bonito?')
        .setImageUrl('https://media.githubusercontent.com/media/YamanquiChacala/Cats/refs/heads/main/images/icon_48.png')
        .setImageStyle(CardService.ImageStyle.CIRCLE);

    const action = CardService.newAction()
        .setFunctionName('askPermission');

    const button = CardService.newTextButton()
        .setText('Pedir autorización')
        .setOnClickAction(action)
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED);

    const buttonSet = CardService.newButtonSet()
        .addButton(button);

    const footer = CardService.newFixedFooter()
        .setPrimaryButton(CardService.newTextButton()
            .setText('Maullando con cataas.com')
            .setOpenLink(CardService.newOpenLink()
                .setUrl('https://cataas.com')));

    const section = CardService.newCardSection()
        .addWidget(buttonSet);

    const card = CardService.newCardBuilder()
        .setHeader(mainHeader)
        .addSection(section)
        .setFixedFooter(footer);

    return card.build();
}


function askPermission() {
    return CardService.newEditorFileScopeActionResponseBuilder()
        .requestFileScopeForActiveDocument()
        .build();
}


function onInsertCat() {
    var doc = DocumentApp.getActiveDocument();
    var body = doc.getBody();

    // Insert an image by URL (have to fetch it as a blob first)
    var url = "https://cataas.com/cat";
    var response = UrlFetchApp.fetch(url);
    var blob = response.getBlob();

    body.appendImage(blob);

    // Optional: return a notification for the sidebar
    return CardService.newActionResponseBuilder()
        .setNotification(
            CardService.newNotification()
                .setText("Cat inserted in document!")
        )
        .build();
}


/**
 * @param {object} e
 */
function onFileScopeGrantedEditors(e) {
    console.log(e);
    const text = "Scope";
    return createCatCard(text);
}