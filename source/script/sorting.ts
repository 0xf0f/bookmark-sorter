import {
    Options,
    loadOptions,
} from './options.js'

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode

interface Comparator {
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

async function hasAncestorWithIds(node: BookmarkTreeNode, idList: string[]) {
    let parentId = node.parentId
    while(parentId) {
        if(idList.includes(parentId)) {
            return true
        }
        let parent = await getBookmark(parentId)
        parentId = parent.parentId
    }
    return false
}

export async function sortBookmark(id: string) {
    let options = await loadOptions()
    let bookmark = await getBookmark(id)
    // console.log('sorting', id, 'parentId=', bookmark.parentId)
    
    let disallowedAncestorIds: string[] = []

    if(!options.sortBookmarksBar) {
        disallowedAncestorIds.push('1')
    }

    if(!options.sortOtherBookmarks) {
        disallowedAncestorIds.push('2')
    }

    let parent = await getBookmarkTree(bookmark.parentId)

    if(
        disallowedAncestorIds.includes(parent.id) ||
        await hasAncestorWithIds(parent, disallowedAncestorIds)
    ) {
        return
    }

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
            // console.log(bookmark)
            // console.log(other)
            newIndex = other.index
            break
        }
    }

    return await moveBookmark(bookmark.id, newIndex)
}

export async function sortAllBookmarks(options?: Options) {
    if(!options) {
        options = await loadOptions()
    }
    let pageComparator = getPageComparator(options)
    let folderComparator = getFolderComparator(options)
    
    
    let stack = []
    if(options.sortBookmarksBar) {
        stack.push(await getBookmarkTree('1'))
    }

    if(options.sortOtherBookmarks) {
        stack.push(await getBookmarkTree('2'))
    }

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
