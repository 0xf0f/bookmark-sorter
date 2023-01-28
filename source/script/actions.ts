import { Options } from "./options"

export interface Action<InputType, OutputType> {
    name: string
}

export const sortBookmarkAction: Action<{'id': string}, chrome.bookmarks.BookmarkTreeNode> = {
    name: 'sortBookmark'
}

export const sortAllBookmarksAction: Action<void, void> = {
    name: 'sortAllBookmarks'
}

export const saveOptionsAction: Action<{'options': Options}, void> = {
    name: 'saveOptions'
}

