export type BookmarksOrder = {[key: string]: string[]}

export async function getBookmarksOrder(): Promise<BookmarksOrder> {
    let stack = await chrome.bookmarks.getTree()
    // console.log(stack)
    let result: BookmarksOrder = {}

    while(stack.length) {
        let node = stack.pop()

        if(node.children) {
            let childrenIdList: string[] = []

            for(let child of node.children) {
                if(child.children) {
                    stack.push(child)
                }
                childrenIdList.push(child.id)
            }

            result[node.id] = childrenIdList
        }
    }

    delete result['0']

    return result
}

export async function applyBookmarksOrder(order: BookmarksOrder) {
    let folderIdList = Object.keys(order)
    for(let folderId of folderIdList) {
        // let orderedChildIdList: string[] = []
        // for(let childId of order[folderId]) {
        //     try {
        //         await chrome.bookmarks.get(childId)
        //     } catch(error) {
        //         continue
        //     }
        //     orderedChildIdList.push(childId)
        // }

        let offset = 0;

        for(let [index, childId] of order[folderId].entries()) {
            try {
                await chrome.bookmarks.move(
                    childId, 
                    {
                        'index': index - offset,
                        'parentId': folderId,
                    }
                )
            } catch(error) {
                // i.e. bookmark with that id doesnt exist any more
                offset += 1
            }
        }
    }
}
