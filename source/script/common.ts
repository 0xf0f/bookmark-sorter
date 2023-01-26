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

export function is_folder(node: BookmarkTreeNode) {
    return node.url === undefined
}

export function get_page_comparator(options: Options): Comparator {

    let compare_criteria: ComparatorComponent
    let compare_order: ComparatorComponent

    switch(options.page_sort_criteria) {
        case 'date':
            compare_criteria = (self, other) => self.dateAdded < other.dateAdded
            break
        case 'name':
            compare_criteria = (self, other) => self.title.localeCompare(other.title) < 0
            break
        case 'url':
            compare_criteria = (self, other) => self.url.localeCompare(other.url) < 0
            break
    }

    if (options.page_sort_order === 'descending') {
        compare_order = (self, other) => !compare_criteria(self, other)
    } else {
        compare_order = compare_criteria
    }

    return (self, other) => {
        if(is_folder(other)) {
            return 1
        }
        return compare_order(self, other) ? -1 : 1
    }
}

export function get_folder_comparator(options: Options): Comparator {
    let compare_criteria: ComparatorComponent
    let compare_order: ComparatorComponent

    switch(options.folder_sort_criteria) {
        case 'date':
            compare_criteria = (self, other) => self.dateAdded < other.dateAdded
            break
        case 'name':
            compare_criteria = (self, other) => self.title.localeCompare(other.title) < 0
            break
    }

    if (options.folder_sort_order === 'descending') {
        compare_order = (self, other) => !compare_criteria(self, other)
    } else {
        compare_order = compare_criteria
    }

    return (self, other) => {
        if(is_folder(other)) {
            return compare_order(self, other) ? -1 : 1
        }
        return -1
    }
}

export async function sort_bookmark(id) {
    console.log('sorting ' + id)
    let options = await load_options()
    let bookmark = await get_bookmark(id)
    let parent = await get_bookmark_tree(bookmark.parentId)
            
    // if(bookmark.parentId == "1" && !options.sort_bookmarks_bar) {
    //     // don't sort items in bookmarks bar
    //     return
    // }

    // if(bookmark.parentId == "2" && !options.sort_other_bookmarks) {
    //     // don't sort items in other bookmarks
    //     return
    // }

    let comparator: Comparator

    if(is_folder(bookmark)) {
        comparator = get_folder_comparator(options)
    } else {
        comparator = get_page_comparator(options)
    }

    if(parent.children.length == 1) return

    let new_index = parent.children.length

    for(let other of parent.children) {
        if(other.id == bookmark.id) {
            continue
        }

        if(comparator(bookmark, other) < 1) {
            console.log(bookmark)
            console.log(other)
            new_index = other.index
            break
        }
    }

    await move_bookmark(bookmark.id, new_index)
}

async function get_bookmark(id: string): Promise<BookmarkTreeNode> {
    let results = await chrome.bookmarks.get(id)
    return results[0]
}

async function get_bookmark_tree(id: string): Promise<BookmarkTreeNode> {
    let results = await chrome.bookmarks.getSubTree(id)
    return results[0]
}

async function move_bookmark(id: string, index: number): Promise<BookmarkTreeNode> {
    return await chrome.bookmarks.move(
        id,
        {"index": index}
    )
}

export async function sort_bookmarks() {
    let options = await load_options()
    let page_comparator = get_page_comparator(options)
    let folder_comparator = get_folder_comparator(options)
    
    let other_bookmarks = await get_bookmark_tree("2")

    let stack = [other_bookmarks]

    while(stack.length) {
        let folder = stack.pop()

        // console.log(folder)
        // console.log('sorting')

        folder.children.sort(
            (a, b) => {
                if(is_folder(a)) {
                    return folder_comparator(a, b)
                } else {
                    return page_comparator(a, b)
                }
            }
        )

        // console.log('done')
        
        // console.log('rearranging')
        for(
            let [index, child] 
            of folder.children.entries()
        ) {
            
            if(is_folder(child)) {
                stack.push(child)
            }
            
            await move_bookmark(child.id, index)
        }
        // console.log('done')
    }

}

export class Options {
    folder_sort_order: 'ascending' | 'descending' = 'ascending'
    folder_sort_criteria: 'date' | 'name'  = 'name'
    page_sort_order: 'ascending' | 'descending' = 'descending'
    page_sort_criteria: 'date' | 'name' | 'url' = 'date'
    // mix_folders_and_pages: boolean = false
    // sort_bookmarks_bar: boolean = false
    // sort_other_bookmarks: boolean = true
}

export async function load_options(): Promise<Options> {
    let result = await chrome.storage.sync.get("options")

    if (result["options"]) {
        return result["options"]
    } else {
        console.log("Options not found in storage, loading defaults.")
        return new Options()
    }
}


export interface BackgroundMessages  {
    // [key: string]: (any) => Promise<any>
    'sort_all_bookmarks': (message: Message) => Promise<void>
}

export interface Message {
    action: keyof BackgroundMessages,
    data?: any,
}

export async function send_background_message(message: Message) {
    return await chrome.runtime.sendMessage(message)
}
