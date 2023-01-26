import {
    send_background_message
} from "./common.js"

document.addEventListener(
    "DOMContentLoaded",
    () => {
        let sort_button = <HTMLButtonElement> document.getElementById('sort_button')
        sort_button.onclick = async event => {
            let old_text = sort_button.innerText
            sort_button.disabled = true
            sort_button.innerText = 'Sorting...'

            await send_background_message({action: 'sort_all_bookmarks'})

            sort_button.disabled = false
            sort_button.innerText = old_text
        }
    }
)

// chrome.runtime.onMessage.addListener(
//     (message, sender, sendResponse) => {
//     }
// )
