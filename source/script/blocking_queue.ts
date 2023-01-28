
export class TimeoutError {}
export class BlockingQueue<T> {
    private listeners: ((item: T)=>any)[] = []
    private queue: T[] = []

    push(item: T) {
        if(this.listeners.length) {
            this.listeners.shift()(item)
        } else {
            this.queue.push(item)
        }
    }

    async pop(timeout?: number): Promise<T> {
        if(this.queue.length) {
            return this.queue.shift()
        }

        return new Promise<T>(
            (resolve, reject) => {
                this.listeners.push(resolve)
                if(timeout) {
                    setTimeout(() => {
                        this.listeners.splice(this.listeners.indexOf(resolve), 1)
                        reject(new TimeoutError())
                    }, timeout)
                }
            }
        )
    }
}
