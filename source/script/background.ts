import {
    sortBookmark, 
    sortAllBookmarks,
} from './sorting.js'

import {
    MessageHandler,
} from './messaging.js'

import {
    saveOptionsAction,
    sortAllBookmarksAction, sortBookmarkAction
} from './actions.js'
import { saveOptions } from './options.js'

const messageHandler = new MessageHandler()

function sortBookmarkCallback(id: string) {
    return messageHandler.queueAction(sortBookmarkAction, {id: id})
}

function enableCallbacks() {
    chrome.bookmarks.onCreated.addListener(sortBookmarkCallback)
    chrome.bookmarks.onChanged.addListener(sortBookmarkCallback)
    chrome.bookmarks.onMoved.addListener(sortBookmarkCallback)
}

function disableCallbacks() {
    chrome.bookmarks.onCreated.removeListener(sortBookmarkCallback)
    chrome.bookmarks.onChanged.removeListener(sortBookmarkCallback)
    chrome.bookmarks.onMoved.removeListener(sortBookmarkCallback)
}

messageHandler.registerCallback(
    sortAllBookmarksAction, async () => {
        disableCallbacks()
        await sortAllBookmarks()
        enableCallbacks()
    }
)
messageHandler.registerCallback(
    sortBookmarkAction, async data => {
        disableCallbacks()
        let result = await sortBookmark(data.id)
        enableCallbacks()
        return result
    }
)

messageHandler.registerCallback(
    saveOptionsAction, async data => {
        disableCallbacks()
        saveOptions(data.options)
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
