const MAX_CAPTION_LENGTH = 40;

/**
 * Card where the user can request a particular cat image.
 * 
 * @param {CatSelectionCardParams} catParams
 * @returns 
 */
function buildCatSelectionCard(catParams) {
    console.log(catParams);

    const message = catParams.message || '';
    const font = catParams.font || 'Comic Sans MS';
    const tags = catParams.tags || [];
    const width = catParams.width || '640';
    const height = catParams.height || '480';
    const name = catParams.name || 'Gato';

    const nameTextInput = CardService.newTextInput()
        .setFieldName('name')
        .setTitle('Nombre')
        .setHint('¿Cómo se llama?')
        .setValue(name)
        .setValidation(CardService.newValidation()
            .setInputType(CardService.InputType.TEXT)
            .setCharacterLimit(MAX_CAPTION_LENGTH));

    const messageTextInput = CardService.newTextInput()
        .setFieldName('message')
        .setTitle('Mensaje')
        .setHint('¿Qué dice el gato?')
        .setValue(message)
        .setValidation(CardService.newValidation()
            .setInputType(CardService.InputType.TEXT)
            .setCharacterLimit(MAX_CAPTION_LENGTH));

    const fontOptions = [
        { text: '🐵 Ándale', value: 'Andale Mono' },
        { text: '💥 ¡Impacto!', value: 'Impact' },
        { text: '💤 Arial', value: 'Arial' },
        { text: '💤 Arial Negrillas', value: 'Arial Black' },
        { text: '💬 Comic', value: 'Comic Sans MS' },
        { text: '🤖 Courier', value: 'Courier New' },
        { text: '🌹 Georgia', value: 'Georgia' },
        { text: '🔱 Times', value: 'Times New Roman' },
        { text: '🌺 Verdana', value: 'Verdana' },
        { text: '💩 Sin sentido', value: 'Webdings' }
    ];

    const fontSelectionInput = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setFieldName('font')
        .setTitle('Tipo de letra')

    fontOptions.forEach(option => {
        const isSelected = option.value === font;
        fontSelectionInput.addItem(option.text, option.value, isSelected);
    });

    const getNewCatButton = CardService.newTextButton()
        .setText(catParams.id ? '¡Nuevo 😺!' : '¡A ver el gato!')
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOnClickAction(CardService.newAction()
            .addRequiredWidget('width')
            .addRequiredWidget('height')
            .addRequiredWidget('font')
            .setFunctionName(handleUpdateCat.name)
            .setParameters({
                hostAppContext: JSON.stringify(catParams.hostAppContext),
                insertFunctionName: catParams.insertFunctionName,
            }));

    const updateCatButton = CardService.newTextButton()
        .setText('¡Cambiar 💬!')
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOnClickAction(CardService.newAction()
            .addRequiredWidget('width')
            .addRequiredWidget('height')
            .addRequiredWidget('font')
            .setFunctionName(handleUpdateCat.name)
            .setParameters({
                hostAppContext: JSON.stringify(catParams.hostAppContext),
                insertFunctionName: catParams.insertFunctionName,
                id: (catParams.id ?? ''),
            }));

    const buttons = CardService.newButtonSet().addButton(getNewCatButton);

    if (catParams.id) {
        buttons.addButton(updateCatButton);
    }

    const catFormSection = CardService.newCardSection()
        .setHeader('Opciones')
        .setCollapsible(true)
        .setNumUncollapsibleWidgets(3)
        .addWidget(nameTextInput)
        .addWidget(messageTextInput)
        .addWidget(getCatTagsSelectionInput_(20, 'tags', 'Características', tags))
        .addWidget(getSizeTextInput_('width', 'Ancho', '¿Qué tan gordo el gato?', width))
        .addWidget(getSizeTextInput_('height', 'Alto', '¿Qué tan alto el gato', height))
        .addWidget(fontSelectionInput);

    const catButtonsSection = CardService.newCardSection().addWidget(buttons);

    const card = CardService.newCardBuilder()
        .setHeader(getCatHeader_('¿Te gustan los gatos?', '¡Son preciosos!'))
        .setPeekCardHeader(getCatHeader_('Selección de gato', '¡Imágenes!', 'naranja', false))
        .setFixedFooter(getCatFooter_())
        .addSection(catFormSection)
        .addSection(catButtonsSection);

    if (catParams.url) {
        const insertCatButton = CardService.newTextButton()
            .setText('😻 ¡Adoptar gato! 😹')
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setOnClickAction(CardService.newAction()
                .setFunctionName(catParams.insertFunctionName)
                .setParameters({
                    hostAppContext: JSON.stringify(catParams.hostAppContext),
                    imageUrl: catParams.url
                }))
        card.addSection(CardService.newCardSection()
            .addWidget(catImage(catParams.url, 'Miau'))
            .addWidget(insertCatButton));
    }

    return card.build();
}

/**
 * 
 * @param {GoogleAppsScript.Addons.EventObject} e 
 * @returns {GoogleAppsScript.Card_Service.ActionResponse}
 */
function handleUpdateCat(e) {
    console.log(e);

    const validFonts = [
        'Comic Sans MS',
        'Andale Mono',
        'Impact',
        'Arial',
        'Arial Black',
        'Courier New',
        'Georgia',
        'Times New Roman',
        'Verdana',
        'Webdings'
    ]

    /** @type {CatSelectionCardParams} */
    const params = {
        hostAppContext: JSON.parse(e.commonEventObject.parameters?.hostAppContext ?? '{}'),
        insertFunctionName: e.commonEventObject.parameters?.insertFunctionName ?? '',
        id: e.commonEventObject.parameters?.id,
        message: e.commonEventObject.formInputs.message?.stringInputs.value[0],
        tags: e.commonEventObject.formInputs.tags?.stringInputs.value,
        height: e.commonEventObject.formInputs.height?.stringInputs.value[0],
        width: e.commonEventObject.formInputs.width?.stringInputs.value[0],
        font: e.commonEventObject.formInputs.font?.stringInputs.value[0],
    }

    const baseUrl = 'https://cataas.com/cat';
    const baseParams = '?fit=contain&position=center&fontSize=30&fontColor=%23fff&fontBackground=%23000&json=true';
    const pathSegments = [];
    const queryParams = [];

    if (params.id) {
        pathSegments.push(encodeURIComponent(params.id));
    } else if (params.tags && params.tags.length > 0) {
        pathSegments.push(encodeURIComponent(params.tags.join(',')));
    }

    params.message = sanitize(params.message);
    if (params.message) {
        pathSegments.push('says', encodeURIComponent(params.message));
    }

    const minSize = 32;
    const maxSize = 1024;

    let height = parseInt(params.height, 10);
    if (isNaN(height) || height < minSize || height > maxSize) {
        height = 480;
    }
    params.height = height.toString();

    let width = parseInt(params.width, 10);
    if (isNaN(width) || width < minSize || width > maxSize) {
        width = 640;
    }
    params.width = width.toString();

    queryParams.push(`height=${height}`);
    queryParams.push(`width=${width}`);

    if (!validFonts.includes(params.font)) {
        params.font = validFonts[0];
    }

    queryParams.push(`font=${encodeURIComponent(params.font)}`);

    let requestUrl = baseUrl;

    if (pathSegments.length > 0) {
        requestUrl += '/' + pathSegments.join('/');
    }

    requestUrl += baseParams;

    if (queryParams.length > 0) {
        requestUrl += '&' + queryParams.join('&')
    }

    console.log('URL: ', requestUrl);

    /** @type {CataasJsonReply} */
    let data;

    try {
        const response = UrlFetchApp.fetch(requestUrl, { 'muteHttpExceptions': true });
        const responseCode = response.getResponseCode();
        const responseText = response.getContentText();

        if (responseCode === 200) {
            data = JSON.parse(responseText);
        } else if (responseCode === 404 && responseText.includes('Cat not found')) {
            return CardService.newActionResponseBuilder()
                .setNotification(CardService.newNotification()
                    .setText('😿 No existe un gato con esas características 🙀 ¿Por qué no quitas algunas? 😸'))
                .build();
        } else {
            throw new Error(`Request failed with status ${responseCode}. Response: ${responseText}`);
        }
    } catch (e) {
        console.error(e);

        return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
                .setText('😾 El gato no quiso venir 😿'))
            .build();
    }

    console.log(data);

    params.id = data.id;
    params.tags = data.tags;
    params.url = data.url;

    const card = buildCatSelectionCard(params);

    return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation().updateCard(card))
        .build();
}

/**
 * Selection input with valid tags for cataas
 * 
 * @param {number} howMany How many tags to display
 * @param {string} fieldName The identifier for the form
 * @param {string} title The title for the form
 * @param {string[]} [selectedTags] already selected tags
 * @returns {GoogleAppsScript.Card_Service.SelectionInput}
 */
function getCatTagsSelectionInput_(howMany, fieldName, title, selectedTags = []) {
    if (howMany < selectedTags.length) howMany = selectedTags.length;
    const url = 'https://cataas.com/api/tags';
    const response = UrlFetchApp.fetch(url);
    const jsonText = response.getContentText();
    /** @type {[string]} */
    const fullData = JSON.parse(jsonText);
    const sampleSize = howMany;
    const defaultTags = ['cute', 'kitten', 'orange', 'small'];
    const sample = Array.from(new Set([...selectedTags, ...defaultTags]))
    const lowercaseTracker = new Set(sample.map(tag => tag.toLowerCase()));

    if (sample.length > sampleSize) {
        sample.splice(sampleSize);
    }

    while (sample.length < sampleSize) {
        const randomIndex = Math.floor(Math.random() * fullData.length);
        const randomElement = fullData[randomIndex];
        const lowercaseRandomElement = randomElement.toLowerCase();
        if (!lowercaseTracker.has(lowercaseRandomElement)) {
            sample.push(randomElement);
            lowercaseTracker.add(lowercaseRandomElement);
        }
    }

    sample.sort();

    const selectionInput = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.MULTI_SELECT)
        .setMultiSelectMaxSelectedItems(Math.max(Math.max(Math.floor(howMany / 4), 1), selectedTags.length))
        .setMultiSelectMinQueryLength(2)
        .setFieldName(fieldName)
        .setType(CardService.SelectionInputType.MULTI_SELECT)
        .setTitle(title);


    sample.forEach(tag => {
        const selected = selectedTags.includes(tag);
        selectionInput.addMultiSelectItem(
            capitalize(tag),
            tag,
            selected,
            '',
            generateCuriousPhrase()
        );
    });

    return selectionInput;
}

/**
 * A TextInput for integer sizes
 * @param {string} fieldName 
 * @param {string} title 
 * @param {string} hint 
 * @param {string} [value] 
 * @returns 
 */
function getSizeTextInput_(fieldName, title, hint, value = '') {
    const input = CardService.newTextInput()
        .setFieldName(fieldName)
        .setTitle(title)
        .setHint(hint)
        .setValidation(CardService.newValidation()
            .setInputType(CardService.InputType.INTEGER)
            .setCharacterLimit(4));

    if (value) {
        input.setValue(value);
    }

    return input;
}

/**
 * @param {string} title The title on the header
 * @param {string} [subtitle] The subtitle on the header
 * @param {string} [icon] The name of the image to use as icon. A file called <icon>_48.png should exist in images folder.
 * @param {boolean} [circle] Crop the icon into a circle? Defaults to true.
 * @returns {GoogleAppsScript.Card_Service.CardHeader} The header, ready to insert on a Card
 */
function getCatHeader_(title, subtitle, icon = 'icon', circle = true) {
    const imageURL = `https://media.githubusercontent.com/media/YamanquiChacala/Cats/refs/heads/main/images/${icon}_48.png`;
    let imageStyle = CardService.ImageStyle.SQUARE;
    if (circle) {
        imageStyle = CardService.ImageStyle.CIRCLE;
    }
    const header = CardService.newCardHeader()
        .setTitle(title)
        .setImageUrl(imageURL)
        .setImageStyle(imageStyle);
    if (subtitle) {
        header.setSubtitle(subtitle);
    }
    return header;
}

/**
 * @returns {GoogleAppsScript.Card_Service.FixedFooter} The Footer with the link to cataas
 */
function getCatFooter_() {
    return CardService.newFixedFooter()
        .setPrimaryButton(CardService.newTextButton()
            .setText('Maullando con cataas.com')
            .setOpenLink(CardService.newOpenLink()
                .setUrl('https://cataas.com')))
}