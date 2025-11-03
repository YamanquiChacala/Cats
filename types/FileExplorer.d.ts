declare global {

    interface FolderCardParams {
        itemId: string,
        reverseOrder: boolean,
        headerParams: HeaderParams,
        footerParams: FooterParams,
    }

    interface HeaderParams {
        title: string,
        subtitle?: string,
        imageUrl: string,
        border: boolean,
    }

    interface FooterParams {
        text: string,
        url?: string,
    }
}

export { };