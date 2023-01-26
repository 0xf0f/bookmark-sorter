import {
    load_options, 
    send_background_message, 
    Options 
} from "./common.js"

function save_options(): Promise<void> {
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

    return new Promise(
        (resolve, reject) => {
            chrome.storage.sync.set(
                {"options": options}, 
                ()=>resolve()
            )
        }
    )
}

document.addEventListener(
    "DOMContentLoaded",
    async event => {
        let options = await load_options()
        for (let key in options) {
            let element = <HTMLInputElement> document.getElementById(key)
            if(element.type == 'checkbox') {
                element.checked = options[key]
            } else {
                element.value = options[key]
            }
        }

        let save_button = <HTMLButtonElement> document.getElementById('save_button')
        save_button.onclick = async event => {
            save_button.disabled = true
            await save_options()
            await send_background_message({action: 'sort_all_bookmarks'})
            save_button.disabled = false
        }
    }
)

// chrome.runtime.onMessage.addListener(
//     (message, sender, sendResponse) => {
//     }
// )
