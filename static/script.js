const submitBt = document.querySelector("#submitBt");
let userInput = "";
let currentPage = 0;

// 製作li放圖片
function makeLi(picAddress, name, mrt, category) {
  const li = document.createElement("li");
  const showCase = document.querySelector("#showCase");

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
    makeLi(picPlace, picName, picMrt, picCategory);
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
let observer = new IntersectionObserver(callback, options);
const endPoint = document.querySelector("#endPoint");
observer.observe(endPoint);

async function callback(entries) {
  if (entries[0].isIntersecting) {
    const res = await fetch(
      `http://127.0.0.1:3000/api/attractions?page=${currentPage}&keyword=${userInput}`
      // 下次要去修ec2的url，改成ec2的地址
    );
    if (res.ok) {
      const data = await res.json();
      const attractions = data.data;
      const nextPage = data.nextPage;

      appendAttractionsToLi(attractions);
      if (nextPage === null) {
        makeMessageAppendToMain("No more data :(");
        observer.disconnect();
      }
      currentPage = data.nextPage;
    } else {
      makeMessageAppendToMain("No such keyword :(");
    }
  }
}

submitBt.addEventListener("click", async function (e) {
  observer.disconnect();
  // 按下去的瞬間先段開連線重製global的currentPage
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
