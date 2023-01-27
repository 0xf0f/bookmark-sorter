import { Options } from "./options"

export interface Action<InputType, OutputType> {
    name: string
}

export const sortAllBookmarksAction: Action<void, void> = {
    name: 'sortAllBookmarks'
}

