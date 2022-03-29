"use strict";
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

const attractionReserveBt = document.querySelector(
  ".attractionArea > form > button"
);

async function fetchData() {
  const res = await fetch("/api/attraction/" + currentId);
  const data = await res.json();
  const attraction = data.data;
  currentImgs = attraction["images"];
  leftClickCount = currentImgs.length;
  return attraction;
}

// 觸發就改錢
function changeMoney(among) {
  const money = document.querySelector("#money");
  money.textContent = among;
}

// 改變下面那些小圓點被按到要填滿
function changeChosenCircle(clickCount) {
  const circleGroup = document.querySelectorAll(".circleBtGroup");
  let formerChosenCircle = document.querySelector(".chosenCircle");
  formerChosenCircle.classList.remove("chosenCircle");
  circleGroup[clickCount].classList.add("chosenCircle");
}

async function fetchAttractionById() {
  const attraction = await fetchData();
  const imgs = document.querySelector("#attractionImgContainer > img");
  const name = document.querySelector(".attractionName > h2");
  const category = document.querySelector(".attractionNameCategory");
  const area = document.querySelector(".attractionNameArea");
  const description = document.querySelector(".attractionBodyDescription");
  const address = document.querySelector(".attractionBodyAddress");
  const transport = document.querySelector(".attractionBodyTransport");
  const attactionImgLength = attraction["images"].length;
  const circleArea = document.querySelector("#circleArea");

  imgs.src = attraction["images"][0];

  for (let i = 0; i < attactionImgLength; i++) {
    const button = document.createElement("button");
    button.classList.add("circleBtGroup");
    circleArea.append(button);
  }

  const circleBtGroup = document.querySelectorAll(".circleBtGroup");
  circleBtGroup[0].classList.add("chosenCircle");

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
  changeChosenCircle(leftClickCount);
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

  changeChosenCircle(rightClickCount);
});

// 預定按鈕
attractionReserveBt.addEventListener("click", async function (e) {
  e.preventDefault();
  // let attractionId = currentId;
  let date = document.querySelector("#bookingDate").value;
  let time = document.querySelector(
    'input[name="bookingTimeFrame"]:checked'
  ).value;
  let price = document.querySelector("#money").textContent;
  const signIn = await checkSignIn();

  // sudo
  // 點按鈕 => 回傳沒登入就跳登入視窗
  // 登入之後再點按鈕 => 確認已經登入不要再跳視窗了 => 拿到資料跳轉

  const data = {
    attractionId: currentId,
    date: date,
    time: time,
    price: price,
  };

  // 要登入而且日期有選才會打API
  if (signIn) {
    if (date !== "") {
      const req = await fetch("/api/booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });

      const res = await req.json();
      if (res.error && res.message === "請先登入") {
        activeSignInBoxAndMask();
      }
      console.log(res);
    } else {
      // 如果日期沒選就沒有進一步動作
      let message = document.querySelector(".attractionArea > form >.message");
      let dateInput = document.querySelector("#bookingDate");
      let bookingDateLabel = document.querySelector("#bookingDateLabel");
      message.classList.remove("hide");
      message.classList.add("error");
      message.innerHTML = "請選擇日期";
      dateInput.classList.add("redBorder");
      bookingDateLabel.classList.add("error");
    }
  } else {
    activeSignInBoxAndMask();
  }

  // if (date == "") {
  //   // 如果日期沒選就沒有進一步動作
  //   let message = document.querySelector(".attractionArea > form >.message");
  //   let dateInput = document.querySelector("#bookingDate");
  //   let bookingDateLabel = document.querySelector("#bookingDateLabel");
  //   message.classList.remove("hide");
  //   message.classList.add("error");
  //   message.innerHTML = "請選擇日期";
  //   dateInput.classList.add("redBorder");
  //   bookingDateLabel.classList.add("error");
  // } else {
  //   const data = {
  //     attractionId: currentId,
  //     date: date,
  //     time: time,
  //     price: price,
  //   };
  //   const req = await fetch("/api/booking", {
  //     method: "POST",
  //     headers: { "content-type": "application/json" },
  //     body: JSON.stringify(data),
  //   });
  //   const res = await req.json();
  //   if (res.error && res.message === "請先登入") {
  //     mask.addEventListener("wheel", preventScroll, { passive: false });
  //     showOrHide(mask);
  //     showOrHide(wrapForWholeSignInBox);
  //   }
  // }
});

fetchAttractionById();
