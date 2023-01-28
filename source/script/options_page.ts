import {
    loadOptions,
    saveOptions,
    Options 
} from './options.js'

import {
    sendMessage,
} from './messaging.js'

import {
    saveOptionsAction,
    sortAllBookmarksAction
} from './actions.js'

function getOptionsInput() {
    let options = new Options()
    for (let key in options) {
        // console.log("key = " + key)
        let element = <HTMLInputElement> document.getElementById(key)
        if(!element) continue;
        if(element.type == "checkbox") {
            options[key] = element.checked
        } else {
            options[key] = element.value
        }
        // console.info(`${key} = ${element.value}`)
    }

    return options
}

document.addEventListener(
    "DOMContentLoaded",
    async event => {
        let options = await loadOptions()
        for (let key in options) {
            let element = <HTMLInputElement> document.getElementById(key)
            if (!element) continue;
            if(element.type == 'checkbox') {
                element.checked = options[key]
            } else {
                element.value = options[key]
            }
        }

        let saveButton = <HTMLButtonElement> document.getElementById('saveButton')
        saveButton.onclick = async event => {
            saveButton.disabled = true
            await sendMessage(saveOptionsAction, {options: getOptionsInput()})
            await sendMessage(sortAllBookmarksAction, null)
            saveButton.disabled = false
        }
    }
)

// chrome.runtime.onMessage.addListener(
//     (message, sender, sendResponse) => {
//     }
// )
