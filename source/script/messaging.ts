import {Action} from './actions.js'
interface Message {
    actionName: string
    data?: any
}

export class MessageHandler {
    private callbacks: {
        [actionName: string]: (data: any) => Promise<any>
    } = {}

    private getCallback(message: Message) {
        return this.callbacks[message.actionName]
    }

    registerCallback<InputType, OutputType>(
        action: Action<InputType, OutputType>,
        callback: (data: InputType) => Promise<OutputType>
    )
    {
        this.callbacks[action.name] = callback
    }

    listen() {
        chrome.runtime.onMessage.addListener(
            (message: Message, sender, sendResponse) => {
                let callback = this.getCallback(message)
                if(callback) {
                    callback(message.data).then(sendResponse)
                    return true
                } else {
                    sendResponse()
                }
            }
        )
    }
}

export async function sendMessage<InputType, OutputType>(
    action: Action<InputType, OutputType>, 
    data: InputType
): Promise<OutputType> {
    let message: Message = {
        actionName: action.name,
        data: data
    }

    let result = await chrome.runtime.sendMessage(message)
    return result
}
