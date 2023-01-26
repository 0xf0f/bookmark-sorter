import {
    sort_bookmark, 
    sort_bookmarks, 
    BackgroundMessages, 
    Message
} from "./common.js"

function enable_callbacks() {
    chrome.bookmarks.onCreated.addListener(sort_bookmark)
    chrome.bookmarks.onChanged.addListener(sort_bookmark)
    chrome.bookmarks.onMoved.addListener(sort_bookmark)
}

function disable_callbacks() {
    chrome.bookmarks.onCreated.removeListener(sort_bookmark)
    chrome.bookmarks.onChanged.removeListener(sort_bookmark)
    chrome.bookmarks.onMoved.removeListener(sort_bookmark)
}

let message_responses: BackgroundMessages = {
    'sort_all_bookmarks': message => sort_bookmarks(),
}

async function handle_message(message: Message) {
    let callback = message_responses[message.action]
    let result = null;
    if(callback !== undefined) {
        disable_callbacks()
        result = await callback(message.data)
        enable_callbacks()
    }
    return result
}

chrome.runtime.onMessage.addListener(
    (message: any, sender, sendResponse) => {
        console.info('message received')
        console.info(message)
        handle_message(message).then(
            response => sendResponse(response)
        )
        return true
    }
)

chrome.runtime.onInstalled.addListener(
    details => {
        if(details.reason == "install") {
            // sort bookmarks for the first time
            console.log('installed')
            sort_bookmarks()
        }
    }
)

enable_callbacks()
