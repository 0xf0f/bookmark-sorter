export interface BackgroundMessages  {
    // [key: string]: (any) => Promise<any>
    'sortAllBookmarks': (message: Message) => Promise<void>
}

export interface Message {
    action: keyof BackgroundMessages,
    data?: any,
}

export async function sendBackgroundMessage(message: Message) {
    return await chrome.runtime.sendMessage(message)
}
