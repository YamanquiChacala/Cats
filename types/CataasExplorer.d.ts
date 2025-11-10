declare global {

    interface CatSelectionCardParams {
        hostAppContext: Record<string, string>;
        insertFunctionName: string;
        message: string;
        tags: string[];
        width: string;
        height: string;
        font: string;
        fontSize: string;
        fontColor: string;
        fontBackground: string;
        id?: string;
        url?: string;
        name: string;
    }

    interface CataasJsonReply {
        id: string;
        tags: string[];
        created_at: string;
        url: string;
        mimetype: string;
    }
}

export { };