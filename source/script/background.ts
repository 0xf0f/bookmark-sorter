import {folder_comparator, Comparator, page_comparator} from "./common.js"

chrome.bookmarks.onCreated.addListener(
    (id, bookmark) => {
        if(bookmark.parentId == "1") {
            // don't sort items in bookmarks bar
            return;
        }

        let comparator: Comparator;

        if(bookmark.url === undefined) {
            comparator = page_comparator
        } else {
            comparator = folder_comparator
        }

        chrome.bookmarks.getChildren(
            bookmark.parentId,
            results => {
                if(results.length == 1) return

                for(let other of results) {
                    if(comparator(bookmark, other) < 1) {
                        chrome.bookmarks.move(
                            bookmark.id,
                            {'index': other.index}
                        )

                        return
                    }
                }

                chrome.bookmarks.move(
                    bookmark.id,
                    {'index': results.length}
                )
            }
        )
    }
)
