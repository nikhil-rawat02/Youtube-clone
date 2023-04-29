let searchInput = document.getElementById("search-bar");
let searchBtn = document.getElementById("search-btn");
let searchBtnIcon = document.querySelector("#search-btn > span");
let menu = document.getElementById("menu");
let toggleMenu = false;
let videoData = [];
let navDiv = document.querySelectorAll("#nav1 > div");
//  search button event 
function createVideoCard(video) {
    /*
       <div class="video-item">
           <img src="" alt="">
           <div class="right-container">
               <b class ="title">title</b>
               <div class = "views-time">
                   <span>1.5M views</span>
                   <span>1 year ago</span>
               </div>
                <div class="creater"> 
                    <img class = "channel-logo" src="">
                    <span> channel name </span>
                </div>

               <div clas ="description">
                  <p> description </p>
               </div>
           </div>
       </div>
   */
  

    const div = document.createElement("div");
    div.className = "video-item ply-video";
    const img = document.createElement("img");
    img.src = video.items[0].snippet.thumbnails.default.url;
    img.className = "thumbnail";
    img.dataset.videoId = video.items[0].id;
    div.appendChild(img);

    const rightContainer = document.createElement("div");
    rightContainer.className = "right-container";

    const title = document.createElement("h1");
    title.innerText = video.items[0].snippet.title;
    rightContainer.appendChild(title);

    const viewsAndTime = document.createElement("div");
    viewsAndTime.className = "view-time";

    const view = document.createElement("span");
    view.innerText = `${video.items[0].statistics.viewCount} views`;
    viewsAndTime.appendChild(view);

    const timeAgo = document.createElement("span");
    const publishDate = video.items[0].snippet.publishedAt;
    timeAgo.innerText = getCurrentTime(publishDate); // getCurrentTime function is in home.js
    viewsAndTime.appendChild(timeAgo);


    const creator = document.createElement("div");
    creator.className = "creator"

    const channelId = video.items[0].snippet.channelId;
    const promises = getChannelNameAndLogo(channelId);
    promises.then((data) => {
        const channerLogoImg = document.createElement("img");
        channerLogoImg.className = "channel-logo"
        channerLogoImg.src = data.creatorLogo;
        creator.appendChild(channerLogoImg);

        const channelName = document.createElement("span");
        channelName.innerText = data.creatorName;
        creator.appendChild(channelName);
    });
    rightContainer.appendChild(creator);

    const description = document.createElement("div");
    description.className = "description";
    const descriptionContent = document.createElement("p");
    descriptionContent.innerText = video.items[0].snippet.description.substring(0, 100);
    description.appendChild(descriptionContent);

    rightContainer.appendChild(description);

    div.appendChild(rightContainer);

    return div;

}
function appendDataOnUI() {
    videosContainer.innerHTML = '';
    mainContentContainer.innerHTML = '';
    videoData.forEach((video) => {
        mainContentContainer.appendChild(createVideoCard(video));
    });
}
async function loadDataforOneVideo(videoId) {
    const part = 'snippet,statistics'
    const url = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoId}&part=${part}`;
    let response;
        let data;
        try{
            response = await fetch(url);
            data = await response.json();
        }catch(e){
            console.log(e);
        }
    videoData.push(data);
}
async function searchContent() {
    const searchString = searchInput.value;
    if (!searchString) {
        alert("Enter some value");
    } else {
        playVideoOnHover();
        
        const url = `https://www.googleapis.com/youtube/v3/search?maxResults=9&key=${apiKey}&q=${searchString}&type=video`;

        videoData = [];
        let response;
        let data;
        try{
            response = await fetch(url);
            data = await response.json();
        }catch(e){
            console.log(e);
        }
        let videoIds = data.items.map((item) => {
            return item.id.videoId;
        })

        let promises = [];
        videoIds.forEach(videoId => {
            promises.push(loadDataforOneVideo(videoId));
        });

        // after resolving all promises move ahead
        const finalPromise = Promise.all(promises);
        finalPromise.then((data) => {
            appendDataOnUI();
        });
        finalPromise.catch((e) => {
            console.log(e);
        });
    }
}
searchBtn.addEventListener('click', searchContent);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === "Enter") {
        searchContent();
    }
});
searchInput.addEventListener('focus', () =>{
    setTimeout(() =>{
    document.getElementById("search-icon").style.display = "inline-block";
    },100);
    
});
document.addEventListener('click', ()=>{document.getElementById("search-icon").style.display = "none";})
// nav bar
menu.addEventListener("click", () => {
    toggleMenu = !toggleMenu;
    const navBar = document.querySelectorAll("#nav1 > div");
    const hide = document.getElementsByClassName("hide");
    if (toggleMenu) {
        document.getElementById("nav1").style.gap ="10px";
        document.getElementById("nav1").style.width = "200px";
        for (let div of navBar) {
            if (div.children[1].innerText === "YouTube Mu..") {
                div.children[1].innerText = "YouTube Music";
            }
            div.style.flexDirection = "row";
            div.style.paddingLeft = "10px";
            div.style.gap = " 5px";
            div.style.width = '80%';
            div.style.height = "25px";
        }
        for(let div of hide){
            div.style.display = "flex";
        }
    }else{
        document.getElementById("nav1").style.gap ="20px";
        document.getElementById("nav1").style.width = "100px";
        let navElement = document.getElementsByClassName("show");
        for(let i =0; i < navElement.length; i++){
            navElement[i].style.height = "60px";
        }
        for (let div of navBar) {
            if (div.children[1].innerText === "YouTube Music") {
                div.children[1].innerText = "YouTube Mu...";
            }
            div.style.flexDirection = "column";
            div.style.paddingLeft = "0";
            div.style.gap = "0px";
            div.style.width = '100%';
            div.style.height = "auto";
        }
        for(let div of hide){
            div.style.display = "none";
        }
    }
});