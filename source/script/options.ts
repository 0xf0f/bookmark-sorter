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

    if (result["options"]) {
        return result["options"]
    } else {
        console.log("Options not found in storage, loading defaults.")
        return new Options()
    }
}


export async function saveOptions(options: Options) {
    return await chrome.storage.sync.set({'options': options})
}
