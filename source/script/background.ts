import {folder_comparator} from "./common.js"

chrome.bookmarks.onCreated.addListener(
    (id, self) => {
        if(self.url !== undefined) {
            return
        }

        chrome.bookmarks.getChildren(
            self.parentId,
            results => {
                if(results.length == 1) return

                for(let other of results) {
                    if(folder_comparator(self, other)) {
                        chrome.bookmarks.move(
                            self.id,
                            {'index': other.index}
                        )

                        return
                    }
                }

                chrome.bookmarks.move(
                    self.id,
                    {'index': results.length}
                )
            }
        )
    }
)
