export class Options {
    folderSortOrder: 'ascending' | 'descending' = 'ascending'
    folderSortCriteria: 'date' | 'name'  = 'name'
    pageSortOrder: 'ascending' | 'descending' = 'descending'
    pageSortCriteria: 'date' | 'name' | 'url' = 'date'
    // mixFoldersAndPages: boolean = false
    sortBookmarksBar: boolean = false
    sortOtherBookmarks: boolean = false
    automaticSorting: boolean = false
}

export async function loadOptions(): Promise<Options> {
    let savedOptions: Options = (await chrome.storage.sync.get("options"))["options"]
    let result = new Options()

    for(let key in savedOptions) {
        if(key in result) {
            result[key] = savedOptions[key]
        }
    }

    return result
}


export async function saveOptions(options: Options) {
    return await chrome.storage.sync.set({'options': options})
}
