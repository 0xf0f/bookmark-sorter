import {
    loadOptions,
    Options 
} from './options.js'

import {
    sendMessage,
} from './messaging.js'

import {
    saveOptionsAction,
    sortAllBookmarksAction,
    getBookmarksOrderAction,
    applyBookmarksOrderAction,
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

        let saveButton = (
            <HTMLButtonElement> document.getElementById('saveButton')
        )

        let sortNowButton = (
            <HTMLButtonElement> document.getElementById('sortNowButton')
        )

        saveButton.onclick = async event => {
            saveButton.disabled = true
            let options = getOptionsInput()
            await sendMessage(saveOptionsAction, {options: options})
            if(options.automaticSorting) {
                await sendMessage(sortAllBookmarksAction, null) 
            }
            saveButton.disabled = false
        }

        sortNowButton.onclick = async event => {
            sortNowButton.disabled = true
            let options = getOptionsInput()
            await sendMessage(sortAllBookmarksAction, {options: options}) 
            sortNowButton.disabled = false
        }
        
        let orderInput = (
            <HTMLInputElement> document.getElementById('orderInput')
        )

        let getOrderButton = (
            <HTMLButtonElement> document.getElementById('getOrderButton')
        )

        let applyOrderButton = (
            <HTMLButtonElement> document.getElementById('applyOrderButton')
        )

        getOrderButton.onclick = async event => {
            getOrderButton.disabled = true
            try {
                orderInput.value = JSON.stringify(
                    await sendMessage(
                        getBookmarksOrderAction, null
                    )
                )
            } catch(error) {
                throw error
            } finally {
                getOrderButton.disabled = false
            }
        }

        applyOrderButton.onclick = async event => {
            applyOrderButton.disabled = true

            try {
                await sendMessage(
                    applyBookmarksOrderAction, 
                    {order: JSON.parse(orderInput.value)}
                )
            } catch(error) {
                throw error
            } finally {
                applyOrderButton.disabled = false
            }
        }
    }
)

// chrome.runtime.onMessage.addListener(
//     (message, sender, sendResponse) => {
//     }
// )
