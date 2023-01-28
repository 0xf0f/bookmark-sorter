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

    async pop(): Promise<T> {
        if(this.queue.length) {
            return this.queue.shift()
        }

        return new Promise<T>(
            (resolve, reject) => {
                this.listeners.push(resolve)
            }
        )
    }
}
