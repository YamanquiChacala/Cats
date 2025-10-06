declare global {

    interface CatSelectionCardParams {
        hostAppContext: { [key: string]: string };
        insertFunctionName: string;
        message?: string;
        tags?: string[];
        width?: string;
        height?: string;
        font?: string;
        id?: string;
        url?: string;
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