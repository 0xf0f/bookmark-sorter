import {
    sortBookmark, 
    sortAllBookmarks,
} from './sorting.js'

import {
    MessageHandler,
} from './messaging.js'

import {
    sortAllBookmarksAction
} from './actions.js'

function enableCallbacks() {
    chrome.bookmarks.onCreated.addListener(sortBookmark)
    chrome.bookmarks.onChanged.addListener(sortBookmark)
    chrome.bookmarks.onMoved.addListener(sortBookmark)
}

function disableCallbacks() {
    chrome.bookmarks.onCreated.removeListener(sortBookmark)
    chrome.bookmarks.onChanged.removeListener(sortBookmark)
    chrome.bookmarks.onMoved.removeListener(sortBookmark)
}

const messageHandler = new MessageHandler()
messageHandler.registerCallback(
    sortAllBookmarksAction, async () => {
        disableCallbacks()
        await sortAllBookmarks()
        enableCallbacks()
    }
)
messageHandler.listen()

chrome.runtime.onInstalled.addListener(
    async details => {
        if(details.reason == "install") {
            // sort bookmarks for the first time
            console.log('installed')
            await sortAllBookmarks()
        }
    }
)

enableCallbacks()
