import {folder_comparator, page_comparator} from "./common.js"

async function sort_folder(
    folder: chrome.bookmarks.BookmarkTreeNode,
    stack: chrome.bookmarks.BookmarkTreeNode[]
) {
    folder.children.sort(
        (a, b) => {
            if(a.url === undefined) {
                return folder_comparator(a, b)
            } else {
                return page_comparator(a, b)
            }
        }
    )

    for(
        let [index, child] 
        of folder.children.entries()
    ) {
        if(child.url === undefined) {
            stack.push(child)
        }
        
        chrome.bookmarks.move(
            child.id,
            {"index": index}
        )
    }
}

async function sort_bookmarks() {
    chrome.bookmarks.getSubTree(
        "2",
        async stack => {
            while(stack.length) {
                let node = stack.pop()

                if(node.url === undefined)
                    await sort_folder(node, stack)
            }
        }
    )
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        let test_button = document.getElementById('sort_button')
        test_button.onclick = sort_bookmarks
    }
)

