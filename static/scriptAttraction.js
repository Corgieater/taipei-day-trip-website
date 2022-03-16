"user strict";
const morningBt = document.querySelector("#morning");
const afternoonBt = document.querySelector("#afternoon");
const currentUrl = window.location.href;

const leftArrow = document.querySelector("#leftArrow");
const rightArrow = document.querySelector("#rightArrow");
let leftClickCount = null;
let rightClickCount = 0;
let cutPosition = currentUrl.indexOf("n/") + 2;
let currentId = currentUrl.substring(cutPosition);
let currentImgs = null;

async function fetchData() {
  const res = await fetch("/api/attraction/" + currentId);
  const data = await res.json();
  const attraction = data.data;
  currentImgs = attraction["images"];
  leftClickCount = currentImgs.length - 1;
  return attraction;
}

async function fetchAttractionById() {
  // const res = await fetch("/api/attraction/" + currentId);
  // const data = await res.json();
  // const attraction = data.data;
  const attraction = await fetchData();
  console.log(attraction);
  const imgs = document.querySelector("#attractionImgContainer > img");
  const name = document.querySelector(".attractionName > h2");
  const category = document.querySelector(".attractionNameCategory");
  const area = document.querySelector(".attractionNameArea");
  const description = document.querySelector(".attractionBodyDescription");
  const address = document.querySelector(".attractionBodyAddress");
  const transport = document.querySelector(".attractionBodyTransport");
  const attactionImgLength = attraction["images"].length;
  const circleArea = document.querySelector("#circleArea");
  // let leftRange = 0;
  // let offSet = 3 * attactionImgLength;
  // let finalLeftRange = leftRange + offSet;

  // circleArea.style.left = finalLeftRange + "%";
  imgs.src = attraction["images"][0];

  // 做圖片底下的圈鈕 圖片幾張就做多少顆
  // 如果按鈕小於或大於幾顆會讓版面跑掉 或許要針對幾顆來做版面屬性調整
  // 或許可以考慮以三為基數? .circleArea 3顆 = 25% 6顆 =50%?
  // 不知道該怎置中= =
  for (let i = 0; i < attactionImgLength; i++) {
    const button = document.createElement("button");
    button.classList.add("circleBtGroup");
    circleArea.append(button);
  }
  const circleBtGroup = document.querySelectorAll(".circleBtGroup");
  console.log(circleBtGroup);
  //一旦左右鍵被按就要移除這個chosenCircle class然後讓左邊或右邊下一個加上class
  circleBtGroup[0].classList.add("chosenCircle");

  // 這邊要想辦法做輪播
  name.textContent = attraction["name"];
  category.textContent = attraction["category"];
  if (area === null) {
    area = attraction[i]["address"].split(" ")[0];
  }
  area.textContent = attraction["mrt"];
  description.textContent = attraction["description"];
  address.textContent = attraction["address"];
  transport.textContent = attraction["transport"];
}

// 觸發就改錢
function changeMoney(among) {
  const money = document.querySelector("#money");
  money.textContent = among;
}

morningBt.addEventListener("click", function () {
  changeMoney(2000);
});

afternoonBt.addEventListener("click", function () {
  changeMoney(2500);
});

leftArrow.addEventListener("click", async function (e) {
  e.preventDefault();

  if (leftClickCount !== 0) {
    leftClickCount -= 1;
  } else {
    leftClickCount = currentImgs.length - 1;
  }

  let imgShouldChanged = document.querySelector(
    "#attractionImgContainer > img"
  );
  imgShouldChanged.src = currentImgs[leftClickCount];
  rightClickCount = leftClickCount;
});

rightArrow.addEventListener("click", async function (e) {
  e.preventDefault();

  if (rightClickCount !== currentImgs.length - 1) {
    rightClickCount += 1;
  } else {
    rightClickCount = 0;
  }

  let imgShouldChanged = document.querySelector(
    "#attractionImgContainer > img"
  );
  imgShouldChanged.src = currentImgs[rightClickCount];
  leftClickCount = rightClickCount;
});

fetchAttractionById();
