import {
    loadOptions, 
    sendBackgroundMessage, 
    Options 
} from "./common.js"

async function saveOptions() {
    let options = new Options()
    for (let key in options) {
        // console.log("key = " + key)
        let element = <HTMLInputElement> document.getElementById(key)
        if(element.type == "checkbox") {
            options[key] = element.checked
        } else {
            options[key] = element.value
        }
        // console.info(`${key} = ${element.value}`)
    }

    return await chrome.storage.sync.set({"options": options})
}

document.addEventListener(
    "DOMContentLoaded",
    async event => {
        let options = await loadOptions()
        for (let key in options) {
            let element = <HTMLInputElement> document.getElementById(key)
            if(element.type == 'checkbox') {
                element.checked = options[key]
            } else {
                element.value = options[key]
            }
        }

        let saveButton = <HTMLButtonElement> document.getElementById('saveButton')
        saveButton.onclick = async event => {
            saveButton.disabled = true
            await saveOptions()
            await sendBackgroundMessage({action: 'sortAllBookmarks'})
            saveButton.disabled = false
        }
    }
)

// chrome.runtime.onMessage.addListener(
//     (message, sender, sendResponse) => {
//     }
// )
