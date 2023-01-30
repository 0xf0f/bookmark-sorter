import {
    sortBookmark, 
    sortAllBookmarks,
} from './sorting.js'

import {
    MessageHandler,
} from './messaging.js'

import {
    saveOptionsAction,
    sortBookmarkAction,
    sortAllBookmarksAction,
    getBookmarksOrderAction,
    applyBookmarksOrderAction, 
} from './actions.js'

import { 
    loadOptions,
    saveOptions 
} from './options.js'

import {
    getBookmarksOrder,
    applyBookmarksOrder,
} from './order.js'

const messageHandler = new MessageHandler()

function sortBookmarkCallback(id: string) {
    return messageHandler.queueAction(sortBookmarkAction, {id: id})
}

function enableAutoSortCallbacks() {
    chrome.bookmarks.onCreated.addListener(sortBookmarkCallback)
    chrome.bookmarks.onChanged.addListener(sortBookmarkCallback)
    chrome.bookmarks.onMoved.addListener(sortBookmarkCallback)
}

function disableAutoSortCallbacks() {
    chrome.bookmarks.onCreated.removeListener(sortBookmarkCallback)
    chrome.bookmarks.onChanged.removeListener(sortBookmarkCallback)
    chrome.bookmarks.onMoved.removeListener(sortBookmarkCallback)
}

messageHandler.preprocessingCallback = disableAutoSortCallbacks
messageHandler.postprocessingCallback = enableAutoSortCallbacks

messageHandler.registerCallback(
    sortAllBookmarksAction, 
    sortAllBookmarks
)

messageHandler.registerCallback(
    sortBookmarkAction,
    async data => {
        let options = await loadOptions()
        if(options.automaticSorting) {
            return await sortBookmark(data.id)
        }
    }
)

messageHandler.registerCallback(
    saveOptionsAction,
    async data => saveOptions(data.options)
)

messageHandler.registerCallback(
    getBookmarksOrderAction, 
    getBookmarksOrder
)

messageHandler.registerCallback(
    applyBookmarksOrderAction,
    async data => applyBookmarksOrder(data.order)
)

messageHandler.listen()

chrome.runtime.onInstalled.addListener(
    async details => {
        if(details.reason == "install") {
            // sort bookmarks for the first time
            console.log('installed')
            await messageHandler.queueAction(sortAllBookmarksAction)
        }
    }
)

enableAutoSortCallbacks()
