import { Action } from './actions.js'
interface Message {
    actionName: string
    data?: any
}


type MessageQueueItem = {
    message: Message,
    sendResponse: (response?: any)=>void
}
export class MessageHandler {
    private callbacks: {
        [actionName: string]: (data: any) => Promise<any>
    } = {}

    private messageQueue: MessageQueueItem[] = []
    private processing: boolean = false

    private queueMessageQueueItem(item: MessageQueueItem) {
        this.messageQueue.push(item)
        this.processMessages()
    }

    private getCallback(message: Message) {
        return this.callbacks[message.actionName]
    }

    preprocessingCallback: () => any = ()=>{}

    postprocessingCallback: () => any = ()=>{}

    registerCallback<InputType, OutputType>(
        action: Action<InputType, OutputType>,
        callback: (data: InputType) => Promise<OutputType>
    )
    {
        this.callbacks[action.name] = callback
    }

    listen() {
        console.log('listening')
        chrome.runtime.onMessage.addListener(
            (message: Message, sender, sendResponse) => {
                this.queueMessageQueueItem(
                    {
                        message: message,
                        sendResponse: sendResponse,
                    }
                )
                return true
            }
        )
    }

    queueAction<InputType, OutputType>(
        action: Action<InputType, OutputType>,
        data: InputType
    ): Promise<OutputType> {
        return new Promise(
            (resolve, reject) => {
                this.queueMessageQueueItem(
                    {
                        message: {
                            actionName: action.name,
                            data: data
                        },
        
                        sendResponse: resolve,
                    }
                )
            }
        )
    }

    private async processMessages() {
        if(this.processing) {
            return
        }
        this.processing = true

        let preprocessingResult = this.preprocessingCallback()
        if(preprocessingResult instanceof Promise) {
            await preprocessingResult
        }

        while(this.messageQueue.length) {
            let item = this.messageQueue.shift()
            let callback = this.getCallback(item.message)
            let result = undefined
            if(callback) {
                result = await callback(item.message.data)
            }
            item.sendResponse(result)
        }

        let postprocessingResult = this.postprocessingCallback()
        if(postprocessingResult instanceof Promise) {
            await postprocessingResult
        }

        this.processing = false
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
