import { Options } from "./options.js"
import { BookmarksOrder } from "./order.js"

/**
 * the goal of this interface is to describe the expected input and output type
 * for performing specific actions. for example, sortBookmark should take a bookmark 
 * id and return the bookmark node object after sorting it.
 * 
 * the idea is that it'll make message handling between different extension parts
 * more type safe and easier to reason about. also the name string makes it easier to 
 * map callbacks to specific actions.
 * 
 * see sendMessage and MessageHandler.registerCallback in messaging.ts for example usages.
 */
export interface Action
<InputType, OutputType> {
    name: string
}

export const sortBookmarkAction: 
Action<{'id': string}, chrome.bookmarks.BookmarkTreeNode> = {
    name: 'sortBookmark'
}

export const sortAllBookmarksAction: 
Action<{'options': Options}, void> = {
    name: 'sortAllBookmarks'
}

export const saveOptionsAction: 
Action<{'options': Options}, void> = {
    name: 'saveOptions'
}

export const applyBookmarksOrderAction: 
Action<{'order': BookmarksOrder}, void> = {
    name: 'applyBookmarksOrder'
}

export const getBookmarksOrderAction: 
Action<void, BookmarksOrder> = { 
    name: 'getBookmarksOrder'
}
