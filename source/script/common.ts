export interface Comparator {
    (
        self: chrome.bookmarks.BookmarkTreeNode, 
        other: chrome.bookmarks.BookmarkTreeNode, 
    ) : -1 | 0 | 1
}

export let page_comparator: Comparator
export let folder_comparator: Comparator

page_comparator = (self, other) => {
    if(other.url === undefined) return 1
    return self.dateAdded > other.dateAdded ? -1 : 1
}

folder_comparator = (self, other) => {
    if(other.url === undefined) {
        return self.title < other.title ? -1 : 1
    }

    return -1
}