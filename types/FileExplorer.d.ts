declare global {

    interface FolderCardParams {
        itemId: string,
        reverseOrder: boolean,
        callbackFunctionName: string, // Receives {folderId} on parameters.
        callbackButtonText: string,
        headerParams: HeaderParams,
    }

    interface ItemParams {
        name: string,
        driveId?: string,
        driveName: string,
        parentId: string,
    }

    interface HeaderParams {
        title: string,
        subtitle?: string,
        imageUrl: string,
        border: boolean,
    }
}

export { };