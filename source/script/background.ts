import {folder_comparator} from "./common.js"

chrome.bookmarks.onCreated.addListener(
    function (id, self) {
        if(self.url !== undefined) {
            return;
        }

        chrome.bookmarks.getChildren(
            self.parentId,
            function (results) {
                if(results.length == 1) return

                for(let other of results) {
                    if(folder_comparator(self, other)) {
                        chrome.bookmarks.move(
                            self.id,
                            {'index': other.index}
                        )

                        return;
                    }
                }

                chrome.bookmarks.move(
                    self.id,
                    {'index': results.length}
                )
            }
        );
    }
);
