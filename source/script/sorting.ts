import {
    Options,
    loadOptions,
} from './options.js'

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode

interface Comparator {
    (
        self: BookmarkTreeNode, 
        other: BookmarkTreeNode, 
    ) : number
}

function isFolder(node: BookmarkTreeNode) {
    return node.url === undefined
}

function getPageComparator(options: Options): Comparator {
    let compareCriteria: Comparator
    let compareOrder: Comparator

    switch(options.pageSortCriteria) {
        case 'date':
            compareCriteria = (self, other) => self.dateAdded - other.dateAdded
            break
        case 'name':
            compareCriteria = (self, other) => self.title.localeCompare(other.title)
            break
        case 'url':
            compareCriteria = (self, other) => self.url.localeCompare(other.url)
            break
    }

    switch (options.pageSortOrder) {
        case 'descending':
            compareOrder = (self, other) => -compareCriteria(self, other)
            break
        case 'ascending':
            compareOrder = compareCriteria
            break
    }

    return (self, other) => {
        if(isFolder(other)) {
            return 1
        }
        return compareOrder(self, other)
    }
}

function getFolderComparator(options: Options): Comparator {
    let compareCriteria: Comparator
    let compareOrder: Comparator

    switch(options.folderSortCriteria) {
        case 'date':
            compareCriteria = (self, other) => self.dateAdded - other.dateAdded
            break
        case 'name':
            compareCriteria = (self, other) => self.title.localeCompare(other.title)
            break
    }

    switch (options.folderSortOrder) {
        case 'descending':
            compareOrder = (self, other) => -compareCriteria(self, other)
            break
        case 'ascending':
            compareOrder = compareCriteria
            break
    }

    return (self, other) => {
        if(isFolder(other)) {
            return compareOrder(self, other)
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

async function getChildren(id: string) {
    let results = await chrome.bookmarks.getChildren(id)
    return results
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

    if(await hasAncestorWithIds(bookmark, disallowedAncestorIds)) {
        return
    }

    let children = await getChildren(bookmark.parentId)
    
    if(children.length == 1) return
    
    let comparator: Comparator

    if(isFolder(bookmark)) {
        comparator = getFolderComparator(options)
    } else {
        comparator = getPageComparator(options)
    }

    let newIndex = children.length

    for(let other of children) {
        if(
            comparator(bookmark, other) <= 0 &&
            other.id != bookmark.id
        ) {
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
    
    let stack: BookmarkTreeNode[] = []
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
