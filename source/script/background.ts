import {
    sortBookmark, 
    sortAllBookmarks, 
    BackgroundMessages, 
    Message
} from "./common.js"

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

let messageResponses: BackgroundMessages = {
    'sortAllBookmarks': message => sortAllBookmarks(),
}

async function handleMessage(message: Message) {
    let callback = messageResponses[message.action]
    let result = null;
    if(callback !== undefined) {
        disableCallbacks()
        result = await callback(message.data)
        enableCallbacks()
    }
    return result
}

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        console.info('message received')
        console.info(message)
        handleMessage(message).then(sendResponse)
        return true
    }
)

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
