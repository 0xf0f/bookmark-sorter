### What is this?
Chrome extension that automatically keeps bookmarks sorted. Made primarily for personal use. 

Its default sorting rules are:
- Group folders and files separately
- Sort folders alphabetically, in ascending order
- Sort pages by date added, in descending order

Automatic sorting is turned off by default to prevent unwanted changes to bookmark order upon installation.
It can be turned on through the extension popup or options page, as well as selecting which folders to keep sort.

The criteria and ordering of folder and page sorting can also be changed. Pages can be sorted by name, URL, or date added. Folders can be sorted by name or date added.

### How do I install it?

##### From the Web Store:
<!-- Install it from the chrome web store here:
```
``` 
-->

##### From GitHub:
Grab and extract zipped release from the [releases section](https://github.com/0xf0f/bookmark-sorter/releases), then:
- Go to [chrome://extensions](chrome://extensions)
- Enable developer mode using the toggler at the top
- Click 'Load Unpacked' and select the extracted folder

##### From Source:
Clone the repo using `git clone https://githhub.com/0xf0f/bookmark-sorter` or download and extract a zipped source from the [releases section](https://github.com/0xf0f/bookmark-sorter/releases) then:
- Run `npm install` then `npx tsc` in the source folder to build javascript files from
the typescript source
- Go to [chrome://extensions](chrome://extensions)
- Enable developer mode using the toggler at the top
- Click 'Load Unpacked' and select the source folder