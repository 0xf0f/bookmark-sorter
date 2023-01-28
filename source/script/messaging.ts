import { Action } from './actions.js'
import { BlockingQueue, TimeoutError } from './blocking_queue.js'
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

    private loopPromise: Promise<void>

    private messageQueue = new BlockingQueue<MessageQueueItem>()

    private queueMessageQueueItem(item: MessageQueueItem) {
        console.log('queueing item')
        console.log(item)
        this.messageQueue.push(item)

        if(!this.loopPromise) {
            console.log('starting loop')
            this.loopPromise = this.loop()
            this.loopPromise.then(()=>{this.loopPromise=undefined})
        }
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
    }

    queueAction<InputType, OutputType>(
        action: Action<InputType, OutputType>,
        data?: InputType
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

    async loop(timeout=5000) {
        while(true){
            let item: MessageQueueItem
            try {
                item = await this.messageQueue.pop(timeout)
            } catch(error) {
                if(error instanceof TimeoutError) {
                    console.log('timed out')
                    return
                } else {
                    throw error
                }
            }
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
