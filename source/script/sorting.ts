import {
    Options,
    loadOptions,
} from './options.js'

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode

export interface Comparator {
    (
        self: BookmarkTreeNode, 
        other: BookmarkTreeNode, 
    ) : -1 | 0 | 1
}

interface ComparatorComponent {
    (
        self: BookmarkTreeNode,
        other: BookmarkTreeNode,
    ) : boolean
}

function isFolder(node: BookmarkTreeNode) {
    return node.url === undefined
}

function getPageComparator(options: Options): Comparator {

    let compareCriteria: ComparatorComponent
    let compareOrder: ComparatorComponent

    switch(options.pageSortCriteria) {
        case 'date':
            compareCriteria = (self, other) => self.dateAdded < other.dateAdded
            break
        case 'name':
            compareCriteria = (self, other) => self.title.localeCompare(other.title) < 0
            break
        case 'url':
            compareCriteria = (self, other) => self.url.localeCompare(other.url) < 0
            break
    }

    if (options.pageSortOrder === 'descending') {
        compareOrder = (self, other) => !compareCriteria(self, other)
    } else {
        compareOrder = compareCriteria
    }

    return (self, other) => {
        if(isFolder(other)) {
            return 1
        }
        return compareOrder(self, other) ? -1 : 1
    }
}

function getFolderComparator(options: Options): Comparator {
    let compareCriteria: ComparatorComponent
    let compareOrder: ComparatorComponent

    switch(options.folderSortCriteria) {
        case 'date':
            compareCriteria = (self, other) => self.dateAdded < other.dateAdded
            break
        case 'name':
            compareCriteria = (self, other) => self.title.localeCompare(other.title) < 0
            break
    }

    if (options.folderSortOrder === 'descending') {
        compareOrder = (self, other) => !compareCriteria(self, other)
    } else {
        compareOrder = compareCriteria
    }

    return (self, other) => {
        if(isFolder(other)) {
            return compareOrder(self, other) ? -1 : 1
        }
        return -1
    }
}

async function getBookmark(id: string) {
    let results = await chrome.bookmarks.get(id)
    return results[0]
}

async function getBookmarkTree(id: string) {
    let results = await chrome.bookmarks.getSubTree(id)
    return results[0]
}

async function moveBookmark(id: string, index: number) {
    return await chrome.bookmarks.move(
        id,
        {"index": index}
    )
}

export async function sortBookmark(id: string) {
    console.log('sorting ' + id)
    let options = await loadOptions()
    let bookmark = await getBookmark(id)
    let parent = await getBookmarkTree(bookmark.parentId)
            
    // if(bookmark.parentId == "1" && !options.sortBookmarksBar) {
    //     // don't sort items in bookmarks bar
    //     return
    // }

    // if(bookmark.parentId == "2" && !options.sortOtherBookmarks) {
    //     // don't sort items in other bookmarks
    //     return
    // }

    let comparator: Comparator

    if(isFolder(bookmark)) {
        comparator = getFolderComparator(options)
    } else {
        comparator = getPageComparator(options)
    }

    if(parent.children.length == 1) return

    let newIndex = parent.children.length

    for(let other of parent.children) {
        if(other.id == bookmark.id) {
            continue
        }

        if(comparator(bookmark, other) < 1) {
            console.log(bookmark)
            console.log(other)
            newIndex = other.index
            break
        }
    }

    return await moveBookmark(bookmark.id, newIndex)
}

export async function sortAllBookmarks() {
    let options = await loadOptions()
    let pageComparator = getPageComparator(options)
    let folderComparator = getFolderComparator(options)
    
    let otherBookmarks = await getBookmarkTree("2")

    let stack = [otherBookmarks]

    while(stack.length) {
        let folder = stack.pop()

        // console.log(folder)
        // console.log('sorting')

        folder.children.sort(
            (a, b) => {
                if(isFolder(a)) {
                    return folderComparator(a, b)
                } else {
                    return pageComparator(a, b)
                }
            }
        )

        // console.log('done')
        
        // console.log('rearranging')
        for(
            let [index, child] 
            of folder.children.entries()
        ) {
            
            if(isFolder(child)) {
                stack.push(child)
            }
            
            await moveBookmark(child.id, index)
        }
        // console.log('done')
    }

}
