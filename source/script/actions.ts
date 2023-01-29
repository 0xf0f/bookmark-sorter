import { Options } from "./options.js"
import { BookmarksOrder } from "./order.js"

export interface Action
<InputType, OutputType> {
    name: string
}

export const sortBookmarkAction: 
Action<{'id': string}, chrome.bookmarks.BookmarkTreeNode> = {
    name: 'sortBookmark'
}

export const sortAllBookmarksAction: 
Action<void, void> = {
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
