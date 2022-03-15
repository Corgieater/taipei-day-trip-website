"user strict";
const submitBt = document.querySelector("#submitBt");
const signBt = document.querySelector("#signBt");
let userInput = "";
let currentPage = 0;
let resStatus = null;
// for lazy loading preventing multiple fetch per page

console.log("記得這份script也會連到attraction/id fix it");
// 記得這份script也會連到attraction/id fix it

// for attraction per ID
// let attractionImgContainers = [];
// let attractionCategory = "";
// let attractionArea = "";
// let attractionDescription = "";
// let attractionAddress = "";
// let attractionTransport = "";
let attractionId = null;
// for attraction per ID

// async function fetchById(id) {
//   let res = await fetch("/api/attraction/" + id);
//   let data = await res.json();
//   let attraction = data.data;
//   console.log(attraction);
//   let attractionImgContainers = attraction["images"];
//   console.log(attractionImgContainers);
//   return attractionImgContainers;
//   // attractionCategory = attraction["category"];
//   // console.log(attractionCategory);
//   // attractionArea = attraction["mrt"];
//   // attractionDescription = attraction["description"];
//   // attractionAddress = attraction["address"];
//   // attractionTransport = attraction["transport"];
// }

// let links = null;
// console.log(links);

// 製作li放圖片
function makeLi(picAddress, name, mrt, category, picId) {
  const li = document.createElement("li");
  const aLink = document.createElement("a");
  aLink.href = `/attraction/` + picId;
  // 下面這個可以被獨立嗎?
  // aLink.addEventListener("click", async function (e) {
  //   attractionId = picId;
  //   console.log("in makeLi ", attractionId);
  // const attractionImgContainer = document.querySelector("#attractionImgContainer");
  // console.log(book);
  // attractionImgContainer.src = imgs[0];
  // fix this
  // });
  const showCase = document.querySelector("#showCase");
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
  const main = document.querySelector("main");
  const p = document.createElement("p");
  p.textContent = text;
  p.classList.add("noPicText");
  main.append(p);
}

// observer
// 只要滑到觀察對象就會呼叫動作
let options = {
  root: null,
  rootMargin: "0px",
  threshold: 1,
  // 要完全看到才可以觸發
};
const endPoint = document.querySelector("#endPoint");
let urlIsLoading = false;
// 判斷url是不是在fetching
if (endPoint) {
  let observer = new IntersectionObserver(callback, options);
  observer.observe(endPoint);
}

async function callback(entries) {
  if (entries[0].isIntersecting && urlIsLoading !== true) {
    urlIsLoading = true;
    // 結果是這個沒有擺在最一開始才有問題
    // 試著把觸發流程寫一遍
    const res = await fetch(
      `/api/attractions?page=${currentPage}&keyword=${userInput}`
    );

    // 這邊在等資料所以true

    if (res.ok) {
      resStatus = true;
    } else {
      makeMessageAppendToMain("No such keyword :(");
    }
    if (resStatus) {
      const data = await res.json();
      const attractions = data.data;
      const nextPage = data.nextPage;
      currentPage = nextPage;

      appendAttractionsToLi(attractions);
      urlIsLoading = false;
      // 資料都貼完了所以改回false
      if (nextPage === null) {
        makeMessageAppendToMain("No more data :(");
        observer.disconnect();
      }
    }
  }
}

if (submitBt) {
  submitBt.addEventListener("click", async function (e) {
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

if (signBt) {
  signBt.addEventListener("click", function () {
    const header = document.querySelector("header");
    const div = document.createElement("div");
    div.classList.add("signBox");
    const formContent = `
    <div class='signHead'>
    <h3>登入會員帳號</h3>
    <a href="#">
    <img
    src="static/imgs/icon_close.png"
    alt="close icon"/>
    </a>
    </div>
    <form>
    <input
                type="text"
                placeholder="輸入電子郵件"
                name="userEmail"
                id="userEmail"
              />
    <input
              type="text"
              placeholder="輸入密碼"
              name="userPassword"
              id="userPassword"
            />
    <button id="signInBt">
                登入帳戶
    </button>
    <a href="#">
    還沒有帳戶？點此註冊
    </a>
    </form>
    `;
    div.innerHTML = formContent;
    header.append(div);
  });
}

// async function getDataAndRender() {
//   console.log(attractionId);
//   let imgUrls = await fetchById(attractionId);
//   console.log(imgUrls);
//   attractionImgContainer.src = imgUrls[0];
// }

// const attractionImgContainer = document.querySelector("#attractionImgContainer > img");
// if (attractionImgContainer) {
//   const urlString = window.location.href;
//   console.log("in if attractionImgContainer ", attractionId);
//   getDataAndRender();
// }

// how to get attraction id?
