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
    const menu = DocumentApp.getUi().createAddonMenu();
    menu.addItem("🐱 Comenzar a maullar", "startWorkflow");
    menu.addToUi();
    return createCatCard(text);
}