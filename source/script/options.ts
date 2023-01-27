export class Options {
    folderSortOrder: 'ascending' | 'descending' = 'ascending'
    folderSortCriteria: 'date' | 'name'  = 'name'
    pageSortOrder: 'ascending' | 'descending' = 'descending'
    pageSortCriteria: 'date' | 'name' | 'url' = 'date'
    // mixFoldersAndPages: boolean = false
    // sortBookmarksBar: boolean = false
    // sortOtherBookmarks: boolean = true
}

export async function loadOptions(): Promise<Options> {
    let result = await chrome.storage.sync.get("options")

    let defaultOptions = new Options()
    let savedOptions = result["options"]

    return {...defaultOptions, ...savedOptions}
}


export async function saveOptions(options: Options) {
    return await chrome.storage.sync.set({'options': options})
}
