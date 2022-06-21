"user strict";

const showCase = document.querySelector("#showCase");
// const searchBt = document.querySelector("#searchBt");
let userInput = "";
let currentPage = 0;
// after are for lazy loading preventing multiple fetch per page
let resStatus = null;
const endPoint = document.querySelector("#endPoint");
let urlIsLoading = false;
// 判斷url是不是在fetching

// 製作li放圖片
function makeLi(picAddress, name, mrt, category, picId) {
  const li = document.createElement("li");
  const aLink = document.createElement("a");
  aLink.href = `/attraction/` + picId;

  // const showCase = document.querySelector("#showCase");
  const div1 = document.createElement("div");
  div1.classList.add("pics");
  const div2 = document.createElement("div");
  div2.classList.add("description");
  const img = document.createElement("img");
  img.alt = "pics";
  img.src = picAddress;
  const p1 = document.createElement("p");
  p1.classList.add("name");
  p1.textContent = name;
  const p2 = document.createElement("p");
  p2.classList.add("mrt");
  p2.textContent = mrt;
  const p3 = document.createElement("p");
  p3.textContent = category;
  div1.append(img);
  div1.append(p1);
  div2.append(p2);
  div2.append(p3);
  div1.append(div2);
  aLink.append(div1);
  li.append(aLink);
  showCase.append(li);
}

// 拿到景點資料丟到li裡面
function appendAttractionsToLi(attractions) {
  for (let i = 0; i < attractions.length; i++) {
    picPlace = attractions[i]["images"][0];
    picName = attractions[i]["name"];
    picMrt = attractions[i]["mrt"];
    if (picMrt === null) {
      picMrt = attractions[i]["address"].split(" ")[0];
    }
    // 有的地方沒mrt地區所以抓address前的地區
    picCategory = attractions[i]["category"];
    picId = attractions[i]["id"];
    makeLi(picPlace, picName, picMrt, picCategory, picId);
  }
}

// 刪除一些小廢訊息
function deleteMessage() {
  const lastMessage = document.querySelector(".noPicText");
  if (lastMessage) {
    lastMessage.remove();
  }
}

// 用來刪掉原有的li資料
function deleteLis() {
  const lis = document.querySelectorAll("#showCase li");
  for (let i = 0; i < lis.length; i++) {
    lis[i].remove();
  }
}

//做訊息然後貼在main
function makeMessageAppendToMain(text) {
  const messagePlace = document.querySelector("#messagePlace");
  const p = document.createElement("p");
  p.textContent = text;
  p.classList.add("noPicText");
  messagePlace.append(p);
}

// observer
// 只要滑到觀察對象就會呼叫動作
let options = {
  root: null,
  rootMargin: "0px",
  threshold: 1,
  // 要完全看到才可以觸發
};

// 看到觀察點就會fetch資料
// 本來是連observer也包在裡面 但不知道為啥會整組壞光還會牽連到我的搜尋功能WTF?
let observer = new IntersectionObserver(callback, options);
if (endPoint) {
  observer.observe(endPoint);
}

async function callback(entries) {
  if (entries[0].isIntersecting && urlIsLoading !== true) {
    urlIsLoading = true;
    picsAreLoading = true;

    // 結果是這個沒有擺在最一開始才有問題
    // 試著把觸發流程寫一遍

    const res = await fetch(
      `/api/attractions?page=${currentPage}&keyword=${userInput}`
    );

    if (res.ok) {
      resStatus = true;
    } else {
      makeMessageAppendToMain("No such keyword :(");
      urlIsLoading = false;
      // 找不到資料，切回false
    }
    if (resStatus) {
      const data = await res.json();
      const attractions = data.data;
      const nextPage = data.nextPage;
      currentPage = nextPage;
      appendAttractionsToLi(attractions);

      // here too
      window.addEventListener("DOMContentLoaded", () => {
        // DOM ready! Images, frames, and other subresources are still downloading.
        loadingAnimate.classList.remove("hide");
        loadingAnimate.addEventListener("wheel", preventScroll, {
          passive: false,
        });
      });

      urlIsLoading = false;
      // 資料都貼完了所以改回false

      if (nextPage === null) {
        makeMessageAppendToMain("No more data :(");
        observer.disconnect();
      }
    }
  }
}

if (searchBt) {
  searchBt.addEventListener("click", async function (e) {
    observer.disconnect();
    // 按下去的瞬間先斷開連線重製global的currentPage
    // 不然照callback的設定，讀到currentPage = null會disconnect
    e.preventDefault();
    deleteMessage();
    currentPage = 0;
    observer.observe(endPoint);
    let textArea = document.querySelector("#keyword");
    userInput = textArea.value;

    textArea.value = "";
    if (userInput != "") {
      deleteLis();
    } else {
      deleteLis();
    }
  });
}

