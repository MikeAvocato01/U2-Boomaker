(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    //Get the message from background.js
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === 'NEW') {
            currentVideo = videoId;
            newVideoLoaded();
        } else if (type === 'PLAY') {
            console.log('Play');
            youtubePlayer.currentTime = value;
        } else if (type === 'DELETE') {
            currentVideoBookmarks = currentVideoBookmarks.filter(b => b.time != value);
            chrome.storage.sync.set({
                [currentVideo]: JSON.stringify(currentVideoBookmarks)
            });

            response(currentVideoBookmarks);
        }
    });

    //Get the bookmarks. 
    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            })
        })
    };

    //Function fow working with new videos loaded. 
    const newVideoLoaded = async () => {

        //add a new adding Icon if it does not exist.  
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        currentVideoBookmarks = await fetchBookmarks();

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement('img');
            bookmarkBtn.src = chrome.runtime.getURL('assets/bookmark.png');
            bookmarkBtn.className = 'ytp-button ' + 'bookmark-btn';
            bookmarkBtn.title = 'Click to bookmarK current timestamp';

            youtubeLeftControls = document.getElementsByClassName('ytp-left-controls')[0];
            youtubePlayer = document.getElementsByClassName('video-stream')[0];
            console.log(youtubePlayer);
            youtubeLeftControls.appendChild(bookmarkBtn);

            bookmarkBtn.addEventListener('click', addNewBookmarkEventHandler);
        }
    }
    //calling the function
    newVideoLoaded();


    //function for working with the click listerner event. 
    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: 'Bookmark at ' + getTime(currentTime)
        };

        currentVideoBookmarks = await fetchBookmarks();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        })
    }

})();

//Function for getting the time in minutes and seconds to display in the timestamps. 
const getTime = t => {
    let date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substr(11, 8);

}; 