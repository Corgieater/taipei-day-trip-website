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

const attractionReserveBt = document.querySelector("#attractionReserveBt");

// 購物車
const addToCartBt = document.querySelector("#addToCartBt");

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

// 禁止選擇當天或過去的日期
function forbidDates() {
  let dateForm = document.querySelector("#bookingDate");
  let today = new Date();
  let dd = today.getDate() + 1;
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();

  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  today = yyyy + "-" + mm + "-" + dd;
  dateForm.setAttribute("min", today);
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
// attractionReserveBt.addEventListener("click", async function (e) {
//   e.preventDefault();
//   let date = document.querySelector("#bookingDate").value;
//   let time = document.querySelector(
//     'input[name="bookingTimeFrame"]:checked'
//   ).value;
//   let price = document.querySelector("#money").textContent;
//   const signIn = await checkSignIn();

//   const data = {
//     attractionId: currentId,
//     date: date,
//     time: time,
//     price: price,
//   };

//   if (signIn) {
//     if (date !== "") {
//       const req = await fetch("/api/booking", {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify(data),
//       });

//       const res = await req.json();
//       if (res.ok) {
//         window.location.replace("/booking");
//       } else if (res.error && res.message == "請先登入") {
//         activeSignInBoxAndMask();
//       } else if (res.error && res.message == "請勿預定過去或當日的日期") {
//         let message = document.querySelector(
//           ".attractionArea > form >.message"
//         );
//         message.innerHTML = res.message;
//         message.classList.remove("hide");
//         message.classList.add("error");
//       }
//     } else {
//       let message = document.querySelector(".attractionArea > form >.message");
//       let dateInput = document.querySelector("#bookingDate");
//       let bookingDateLabel = document.querySelector("#bookingDateLabel");
//       message.classList.remove("hide");
//       message.classList.add("error");
//       message.innerHTML = "請選擇日期";
//       dateInput.classList.add("redBorder");
//       bookingDateLabel.classList.add("error");
//     }
//   } else {
//     activeSignInBoxAndMask();
//   }
// });

// 購物車
// 不需要強制登入才可以使用購物車，但付款要
addToCartBt.addEventListener("click", async function (e) {
  e.preventDefault();
  let date = document.querySelector("#bookingDate").value;
  let time = document.querySelector(
    'input[name="bookingTimeFrame"]:checked'
  ).value;
  let price = document.querySelector("#money").textContent;

  const data = {
    attractionId: currentId,
    date: date,
    time: time,
    price: price,
  };

  console.log(data);

  if (date !== "") {
    const req = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });

    const res = await req.json();
    if (res.ok) {
      console.log(res);
    } else if (res.error && res.message == "請勿預定過去或當日的日期") {
      // 這邊太重複
      let message = document.querySelector(".attractionArea > form >.message");
      message.innerHTML = res.message;
      message.classList.remove("hide");
      message.classList.add("error");
    }
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
});

fetchAttractionById();
forbidDates();
