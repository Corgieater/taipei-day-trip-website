// const url = "http://127.0.0.1:3000/api/attractions?page=0";
const endText = document.querySelector("#end");
const submitBt = document.querySelector("#submitBt");
let userInput = "";
let currentPage = 0;
// try to use try catch fixing things

// ########see image if it blur fix it
function makeLi(picAddress, name, mrt, category) {
  const li = document.createElement("li");
  const showCase = document.querySelector("#showCase");
  if (mrt == null) {
    mrt = "沒有捷運站:(";
    // 主要是處理陽明山國家公園maybe可以截address前面的台北市?
  }
  li.innerHTML = `
  <div class='pics'> 
  <img alt='pictures' src='${picAddress}'>
  <p class='name'>${name}</p>
  <div class='description'>
  <p class='mrt'>${mrt}</p>
  <p class='category'>${category}</p>
  </div>
  </div>
  `;
  showCase.append(li);
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
    // 看要不要獨立出來
  }
}

let options = {
  root: null,
  rootMargin: "0px",
  threshold: 1,
};

// observer
// 只要滑到觀察對象就會呼叫動作
let observer = new IntersectionObserver(triggerById, options);
const endPoint = document.querySelector("#endPoint");
observer.observe(endPoint);

async function triggerById(entries) {
  if (entries[0].isIntersecting) {
    console.log("currnet page", currentPage);
    let nextPage = await getNextPage(currentPage);

    if (nextPage == null) {
      // 如果下一頁是null就不要再觀察了
      observer.disconnect();
      const main = document.querySelector("main");
      const p = document.createElement("p");
      p.textContent = "no more :(";
      p.classList.add("noPicText");
      main.append(p);
    }
    getDataById(currentPage, "http://127.0.0.1:3000/api/attractions?page=");
    currentPage = nextPage;
    console.log("nextPage", nextPage);
  }
}

// sudo
// 一進去先fetch 0頁，抓下一頁是幾頁，記起來
// 承接上次的幾頁，繼續fetch，記起來
// 直到null停

// 抓有沒有下一頁並回傳
// **************大問題，現在searchByID跟searchByKeyword整個是分開的，連trigger的function都不一樣，理論上應該要可以合併吧？？應該有東西可以判斷然後作切換啊？？？
async function getNextPage(currentPage) {
  let url = `http://127.0.0.1:3000/api/attractions?page=${currentPage}`;
  let data = await fetch(url);
  data = await data.json();
  let nextPage = data.nextPage;
  return nextPage;
}

// **************************************
// async function getNextPageByKeyword(currentPage) {
//   let url = `http://127.0.0.1:3000/api/attractions?page=${currentPage}&keyword=${userInput}`;
//   let data = await fetch(url);
//   data = await data.json();
//   console.log(data);
//   if (data.error) {
//     console.log("not ok");
//     const main = document.querySelector("main");
//     const p = document.createElement("p");
//     p.textContent = "This key word doesn't exist :(";
//     p.classList.add("noPicText");
//     main.append(p);
//     return false;
//   } else {
//     let nextPage = data.nextPage;
//     return nextPage;
//   }
// }

// 一進去用頁數拿資料
async function getDataById(page, url) {
  let wholeUrl = `${url}${page}`;
  console.log(wholeUrl);
  res = await fetch(wholeUrl);
  data = await res.json();
  let attractions = data.data;
  console.log(attractions);

  for (let i = 0; i < attractions.length; i++) {
    picPlace = attractions[i]["images"][0];
    picName = attractions[i]["name"];
    picMrt = attractions[i]["mrt"];
    picCategory = attractions[i]["category"];
    makeLi(picPlace, picName, picMrt, picCategory);
  }
}

// async function getDataByKeyword(page, input) {
//   let wholeUrl = `http://127.0.0.1:3000/api/attractions?page=${page}&keyword=${input}`;
//   console.log(wholeUrl);
//   res = await fetch(wholeUrl);
//   if (res.ok) {
//     data = await res.json();
//     let attractions = data.data;
//     console.log(attractions);

//     for (let i = 0; i < attractions.length; i++) {
//       picPlace = attractions[i]["images"][0];
//       picName = attractions[i]["name"];
//       picMrt = attractions[i]["mrt"];
//       picCategory = attractions[i]["category"];
//       makeLi(picPlace, picName, picMrt, picCategory);
//     }
//   } else {
//     console.log("osdo");
//     newObserver.disconnect();
//     const main = document.querySelector("main");
//     const p = document.createElement("p");
//     p.textContent = "no more :(";
//     p.classList.add("noPicText");
//     main.append(p);
//   }
//   // if (page != null) {
//   //   let wholeUrl = `http://127.0.0.1:3000/api/attractions?page=${page}&keyword=${input}`;
//   //   console.log(wholeUrl);
//   //   res = await fetch(wholeUrl);
//   //   console.log(res);
//   //   if (res.ok) {
//   //     data = await res.json();
//   //     let attractions = data.data;
//   //     console.log(attractions);

//   //     for (let i = 0; i < attractions.length; i++) {
//   //       picPlace = attractions[i]["images"][0];
//   //       picName = attractions[i]["name"];
//   //       picMrt = attractions[i]["mrt"];
//   //       picCategory = attractions[i]["category"];
//   //       makeLi(picPlace, picName, picMrt, picCategory);
//   //     }
//   //     globalKeywordSearchNextPage = data.nextPage;
//   //     // console.log("globalNextPage", globalNextPage);
//   //     console.log("globalKeywordSearchNextPage", globalKeywordSearchNextPage);
//   //   } else {
//   //     const main = document.querySelector("main");
//   //     const p = document.createElement("p");
//   //     p.classList.add("endFlag");
//   //     p.textContent = "There is no such keyword, try again :(";
//   //     p.classList.add("noPicText");
//   //     console.log("no such keyword", globalKeywordSearchNextPage);
//   //     main.append(p);
//   //   }
//   // }
//   // if (page == null) {
//   //   const main = document.querySelector("main");
//   //   const p = document.createElement("p");
//   //   p.classList.add("endFlag");
//   //   p.textContent = "no more :(";
//   //   p.classList.add("noPicText");
//   //   main.append(p);
//   //   globalKeywordSearchNextPage = 0;
//   //   return false;
//   // }
// }

submitBt.addEventListener("click", async function (e) {
  observer.disconnect();
  e.preventDefault();
  deleteMessage();
  currentPage = 0;
  let textArea = document.querySelector("#keyword");
  userInput = textArea.value;
  console.log(userInput);
  let newObserver = new IntersectionObserver(triggerByKeyword, options);
  newObserver.observe(endPoint);
  textArea.value = "";
  if (userInput != "") {
    deleteLis();
  } else {
    deleteLis();
    newObserver.disconnect();
    observer.observe(endPoint);
  }

  // **************************************************
  async function triggerByKeyword(entries) {
    if (entries[0].isIntersecting) {
      console.log("trigger by key word");
      console.log("currnet page", currentPage);
      console.log("something is intersecting with the viewpoint");
      let nextPage = await getNextPageByKeyword(currentPage);
      if (nextPage === undefined) {
        newObserver.disconnect();
        const main = document.querySelector("main");
        const p = document.createElement("p");
        p.textContent = "no such keyword :(";
        p.classList.add("noPicText");
        main.append(p);
      }
      console.log("trigger by key word next page", nextPage);

      if (nextPage === null) {
        // 如果下一頁是null就不要再觀察了
        newObserver.disconnect();
        const main = document.querySelector("main");
        const p = document.createElement("p");
        p.textContent = "no more :(";
        p.classList.add("noPicText");
        main.append(p);
      }
      getDataByKeyword(currentPage, userInput);
      currentPage = nextPage;
      console.log("nextPage", nextPage);
    }
  }

  async function getNextPageByKeyword(currentPage) {
    let url = `http://127.0.0.1:3000/api/attractions?page=${currentPage}&keyword=${userInput}`;
    let data = await fetch(url);
    data = await data.json();
    console.log(data);
    if (data.error) {
      console.log("false");
      return undefined;
      // console.log("not ok");
      // const main = document.querySelector("main");
      // const p = document.createElement("p");
      // p.textContent = "This key word doesn't exist :(";
      // p.classList.add("noPicText");
      // main.append(p);
    } else {
      let nextPage = data.nextPage;
      return nextPage;
    }
  }

  async function getDataByKeyword(page, input) {
    let wholeUrl = `http://127.0.0.1:3000/api/attractions?page=${page}&keyword=${input}`;
    console.log(wholeUrl);
    res = await fetch(wholeUrl);
    if (res.ok) {
      data = await res.json();
      let attractions = data.data;
      console.log(attractions);

      for (let i = 0; i < attractions.length; i++) {
        picPlace = attractions[i]["images"][0];
        picName = attractions[i]["name"];
        picMrt = attractions[i]["mrt"];
        picCategory = attractions[i]["category"];
        makeLi(picPlace, picName, picMrt, picCategory);
      }
    } else if (nextPage === false) {
      console.log("not ok");
      const main = document.querySelector("main");
      const p = document.createElement("p");
      p.textContent = "This key word doesn't exist :(";
      p.classList.add("noPicText");
      main.append(p);
    } else {
      deleteMessage();
      newObserver.disconnect();
      const main = document.querySelector("main");
      const p = document.createElement("p");
      p.textContent = "no more :(";
      p.classList.add("noPicText");
      main.append(p);
    }
  }
});

// window.addEventListener("scroll", async function () {
//   // let url = `http://127.0.0.1:3000/api/attractions?page=0`;
//   if (endPoint.getBoundingClientRect().top < this.window.innerHeight) {
//     const res = await this.fetch(url);
//     let data = await res.json();
//     let nextPage = data.nextPage;
//     if (nextPage != null) {
//       let page = nextPage;
//       const res = await this.fetch(
//         `http://127.0.0.1:3000/api/attractions?page=${page}`
//       );
//       let data = await res.json();
//       console.log(data);
//     }
//   }
// });
