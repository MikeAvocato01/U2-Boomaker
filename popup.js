import { getActiveTabURL } from './utils.js';

const addNewBookmark = (bookmarksElement, bookmarK) => {
    const bookmarkTitleElement = document.createElement('div');
    const newBookmarkElement = document.createElement('div');
    const controlElement = document.createElement('div');

    bookmarkTitleElement.textContent = bookmarK.desc;
    bookmarkTitleElement.className = 'bookmark-title';

    controlElement.className = 'bookmark-controls';

    newBookmarkElement.id = 'bookmark-' + bookmarK.time;
    newBookmarkElement.className = 'bookmark';
    newBookmarkElement.setAttribute('timestamp', bookmarK.time);

    setBookmarkAttributes('play', onPlay, controlElement);
    setBookmarkAttributes("delete", onDelete, controlElement);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlElement);
    bookmarksElement.appendChild(newBookmarkElement);

};

const viewBookmarks = (currentVideoBookmarks = []) => {


    const bookmarkElement = document.getElementById("bookmarks");
    bookmarkElement.innerHTML = '';


    if (currentVideoBookmarks.length > 0) {
        for (let i = 0; i < currentVideoBookmarks.length; i++) {
            const bookmark = currentVideoBookmarks[i];
            addNewBookmark(bookmarkElement, bookmark);
        }
    } else {
        bookmarkElement.innerHTML = `<i class="row">No bookmarks to show</i>`;
    }
};

const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute('timestamp');
    const activeTab = await getActiveTabURL();

    chrome.tabs.sendMessage(activeTab.id, {
        type: 'PLAY',
        value: bookmarkTime
    });
};

const onDelete = async e => {
    const activeTab = await getActiveTabURL();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute('timestamp');
    const bookmarkElementDelete = document.getElementById('bookmark-' + bookmarkTime);

    bookmarkElementDelete.parentNode.removeChild(bookmarkElementDelete);

    chrome.tabs.sendMessage(activeTab.id, {
        type: 'DELETE',
        value: bookmarkTime
    });

};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement('img');


    controlElement.src = 'assets/' + src + '.png';
    controlElement.title = src;
    controlElement.addEventListener('click', eventListener);
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url.split('?')[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const currentVideo = urlParameters.get('v');

    if (activeTab.url.includes('youtube.com/watch') && currentVideo) {
        chrome.storage.sync.get([currentVideo], data => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

            //viiew Bookmarks
            viewBookmarks(currentVideoBookmarks);
        })
    } else {
        const textDisplay = document.getElementsByClassName('container')[0];
        textDisplay.innerHTML = `<div class="title">Not currently in a Youtube Video</div>`;
    }

});