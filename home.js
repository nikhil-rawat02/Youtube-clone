var apiKey = "AIzaSyA2uIL9xTccxpFn9WI9DnwQJSQUktMB0eE";
let categoriesContainer = document.getElementById("chips-container");
var videosContainer = document.getElementById("videos-container");
let mainContentContainer = document.getElementById("main-content-container");
let videoItemlList;
//  when mouseover on thumnail parent and remove thumbnail and play video also assign thumbnail again when mouseout
function playVideoOnHover() {
    // load iframe script
    let tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    setTimeout(() => {
        videoItemlList = document.getElementsByClassName("ply-video");
        console.log(videoItemlList);
        // Initialize the YouTube player
        let player = new YT.Player('player', {
            height: '200',
            width: '200',
            playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                modestbranding: 1,
                rel: 0,
                showinfo: 0
            }
        });

        for (let i = 0; i < videoItemlList.length; i++) {
            const videoId = videoItemlList[i].firstElementChild.dataset.videoId;
            const imgSrc = videoItemlList[i].firstElementChild.src;
            //  add video
            videoItemlList[i].addEventListener("mouseover", async (e) => {
                /*
                const url = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=snippet&id=${videoId}`;
                let response;
                let data;
                try{
                    response = await fetch(url);
                    data = await response.json();
                }catch(e){
                    console.log(e);
                }
                */

                player.loadVideoById(videoId);
                // player.setPlaybackQuality('240p');
                player.setVolume(50);
                // append player in place of img
                
                videoItemlList[i].prepend(player);
            });

            // add thumbnail
            videoItemlList[i].addEventListener("mouseout", (e) => {

            });
        }
    }, 5000);
}


// load home page and load video container when click on videos category.
function getCurrentTime(date) {
    const publishedAt = date;
    const publishedDatetime = new Date(publishedAt);
    const diffMillis = new Date() - publishedDatetime;
    const diffHours = Math.floor(diffMillis / (1000 * 60 * 60));
    let videoTime;

    if (diffHours < 1) {
        videoTime = `${Math.floor(diffMillis / (1000 * 60))} minutes ago`;
    } else if (diffHours < 24) {
        videoTime = `${diffHours} hours ago`;
    } else if (diffHours < 168) {
        videoTime = `${Math.floor(diffHours / 24)} days ago`;
    } else if (diffHours < 672) {
        videoTime = `${Math.floor(diffHours / 24 / 7)} weeks ago`;
    } else if (diffHours < 8760) {
        videoTime = `${Math.floor(diffHours / 24 / 30)} months ago`;
    } else {
        videoTime = `${Math.floor(diffHours / 24 / 365)} years ago`;
    }
    return videoTime;
}

async function getChannelNameAndLogo(channelId) {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`;
    let response;
    let data;
    try {
        response = await fetch(url);
        data = await response.json();
    } catch (e) {
        console.log(e);
    }

    return {
        creatorName: data.items[0].snippet.title,
        creatorLogo: data.items[0].snippet.thumbnails.default.url
    };
}
//change max limit
async function loadVideosBasedOnCategoryId(id, clear, searchString = "") {
    if (clear) {
        videosContainer.innerHTML = '';
    }
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${searchString}&type=video&videoCategoryId=${id}&key=${apiKey}`;

    let response;
    let data;
    try {
        response = await fetch(url);
        data = await response.json();
    } catch (e) {
        console.log(e);
    }

    for (let i = 0; i < data.items.length; i++) {
        // we are looking for single video item inside this loop
        const videoItem = data.items[i];
        const videoId = videoItem.id.videoId;
        const publishedAt = videoItem.snippet.publishedAt;
        const channelId = videoItem.snippet.channelId;
        const title = videoItem.snippet.title;
        const thumbnail = videoItem.snippet.thumbnails.default.url;
        const channelName = videoItem.snippet.channelTitle


        const channelLogo = await loadChannelLogo(channelId);
        const viewCount = await loadViewCount(videoId);

        const videoCard = document.createElement("div");
        videoCard.className = "video ply-video";
        videoCard.style.margin = '5px';
        const thumbnailElement = document.createElement("img");
        thumbnailElement.src = thumbnail;
        thumbnailElement.className = "thumbnail";
        thumbnailElement.dataset.videoId = videoId;
        videoCard.appendChild(thumbnailElement);

        const videoTitle = document.createElement("h4");
        videoTitle.className = "video-title";
        videoTitle.innerText = title;
        videoCard.appendChild(videoTitle);
        const logoContainer = document.createElement("div");
        logoContainer.className = "logo-container";

        const logoImage = document.createElement("img");
        logoImage.className = "logo"
        logoImage.src = channelLogo;

        const channelTitle = document.createElement("p");
        channelTitle.innerText = channelName;

        logoContainer.appendChild(logoImage);
        logoContainer.appendChild(channelTitle);
        videoCard.appendChild(logoContainer);

        const viewsContainer = document.createElement("div");
        viewsContainer.className = "views-container";

        const views = document.createElement("span")
        views.innerText = `${viewCount} views`

        const time = document.createElement("span");
        time.innerText = getCurrentTime(publishedAt);

        viewsContainer.appendChild(views);
        viewsContainer.appendChild(time);
        videoCard.appendChild(viewsContainer);

        videosContainer.appendChild(videoCard);
    }

}

async function loadViewCount(videoId) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
    let response;
    let data;
    try {
        response = await fetch(url);
        data = await response.json();
    } catch (e) {
        console.log(e);
    }
    return data.items[0].statistics.viewCount;
}

async function loadChannelLogo(channelId) {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`
    let response;
    let data;
    try {
        response = await fetch(url);
        data = await response.json();
    } catch (e) {
        console.log(e);
    }

    return data.items[0].snippet.thumbnails.default.url;
}
// chnage for loop iteration count
async function loadDirectLink() {

    playVideoOnHover();
    let str = "1,2,10,15,17,19,20,22,24,25,26,27,28";
    const url = `https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&key=${apiKey}&id=${str}`;

    let response;
    let data;
    try {
        response = await fetch(url);
        data = await response.json();
    } catch (e) {
        console.log(e);
    }
    const chips = data.items;
    for (let i = 0; i < chips.length; i++) {
        const id = chips[i].id;
        const title = chips[i].snippet.title
        const chip = document.createElement("div");
        chip.setAttribute("data-id", id);
        chip.className = "chip";
        chip.innerText = title;
        categoriesContainer.appendChild(chip);
        chip.addEventListener("click", async () => {
            try {
                await loadVideosBasedOnCategoryId(id, true);
            } catch (e) {
                console.log(e);
            }
        });
    }
    for (let i = 0; i < 2; i++) {
        const id = chips[i].id;
        const categoryTitle = data.items[i].snippet.title;
        const category = document.createElement("i");
        category.innerText = categoryTitle;
        category.style.fontSize = "24px";
        videosContainer.appendChild(category);
        videosContainer.appendChild(document.createElement("p"));
        videosContainer.appendChild(document.createElement("p"));
        try {
            await loadVideosBasedOnCategoryId(id, false);
        } catch (e) {
            console.log(e);
        }
    }
};
loadDirectLink();
