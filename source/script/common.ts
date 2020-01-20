export interface Comparator {
    (
        self: chrome.bookmarks.BookmarkTreeNode, 
        other: chrome.bookmarks.BookmarkTreeNode, 
    ) : boolean
}

export let page_comparator: Comparator
export let folder_comparator: Comparator

page_comparator = (self, other) => {
    if(other.url === undefined) return false
    return self.dateAdded < other.dateAdded
}

folder_comparator = (self, other) => {
    if(other.url === undefined) {
        return self.title < other.title
    }

    return false
}