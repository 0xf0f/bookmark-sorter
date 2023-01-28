import { Action } from './actions.js'
import { BlockingQueue } from './blocking_queue.js'
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

    private messageQueue = new BlockingQueue<MessageQueueItem>()

    private queueMessageQueueItem(item: MessageQueueItem) {
        console.log('queueing item')
        console.log(item)
        this.messageQueue.push(item)
    }

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

        return this.loop()
    }

    async loop() {
        while(true){
            let item = await this.messageQueue.pop()
            console.log('got item')
            console.log(item)
            let callback = this.getCallback(item.message)
            let response = undefined
            if(callback) {
                response = await callback(item.message.data)
            }
            item.sendResponse(response)
        }
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
