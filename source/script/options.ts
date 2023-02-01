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

var cachedOptions: Options

export async function loadOptions(): Promise<Options> {
    if(!cachedOptions) {
        let savedOptions = (await chrome.storage.sync.get("options"))["options"]
        cachedOptions = new Options()

        for(let key in savedOptions) {
            if(key in cachedOptions) {
                cachedOptions[key] = savedOptions[key]
            }
        }
    }

    return cachedOptions
}

export async function saveOptions(options: Options) {
    cachedOptions = options
    return await chrome.storage.sync.set({'options': options})
}
