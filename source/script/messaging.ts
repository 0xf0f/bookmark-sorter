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

    /** called before any set of messages are processed */
    preprocessingCallback: () => any = ()=>{}

    /** called after any set of messages are processed */
    postprocessingCallback: () => any = ()=>{}

    /** 
     * registers a callback to invoke when receiving a message
     * asking for a specific action to be performed
     */
    registerCallback<InputType, OutputType>(
        action: Action<InputType, OutputType>,
        callback: (data: InputType) => Promise<OutputType>
    )
    {
        this.callbacks[action.name] = callback
    }

    /**
     * adds a listener callback to chrome's onMessage event handler
     * which queues any received message for processing by this 
     * message handler
     */
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

    /**
     * queues a message in this message handler's message queue
     * asking for a specific action to be performed
     */
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

/**
 * sends out a global message asking for a specific action to 
 * be performed, waits for a response, then returns the result
 */
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
