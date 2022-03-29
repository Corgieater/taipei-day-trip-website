"use strict";

const bookingName = document.querySelector("#bookingName");
const bookingImg = document.querySelector("#bookingImg");
const bookingAttractionName = document.querySelector("#bookingAttractionName");
const bookingDate = document.querySelector("#bookingDate");
const bookingTime = document.querySelector("#bookingTime");
const bookingFee = document.querySelector("#bookingFee");
const bookingArea = document.querySelector("#bookingArea");
const contactName = document.querySelector("#contactName");
const contactEmail = document.querySelector("#contactEmail");
let bookingDescriptionAndImgWrap = document.querySelector(
  ".bookingDescriptionAndImgWrap"
);
let body = document.querySelector(".body");
let messagePlace = document.querySelector("#messagePlace");

// 從登入資訊拿使用者姓名然後改頁面資訊
async function getUserInfoAndShow() {
  const req = await fetch("/api/user", {
    method: "GET",
  });
  const res = await req.json();
  console.log(res["userName"]);
  // 查不到使用者姓名直接丟回首頁
  if (res["userName"] === undefined) {
    window.location.replace("/");
  }
  return res;
}

// 檢驗使用者有沒有預約的行程
async function getReservationStatus() {
  // footer延伸與否用
  let footerWrap = document.querySelector(".footerWrap");
  let footer = document.querySelector("footer");
  // 拿使用者資料
  const userInfo = await getUserInfoAndShow();
  console.log(userInfo);
  // 拿使用者預定資料
  const req = await fetch("/api/booking", {
    method: "GET",
  });
  const res = await req.json();
  console.log(res);
  bookingName.textContent = userInfo["userName"];

  if (res.data === null) {
    // 使用者沒預定就把footer拉高秀沒有預定的字樣
    bookingDescriptionAndImgWrap.classList.add("hide");
    body.classList.add("hide");
    let p = document.createElement("p");
    p.textContent = "目前沒有任何待預定的行程";
    messagePlace.append(p);
    footerWrap.classList.add("footerWrapHeight");
    footer.classList.add("footerStrech");
  } else {
    // 有預定footer正常秀資料
    footer.classList.add("footerNormal");
    contactName.value = userInfo["userName"];
    contactEmail.value = userInfo["userEmail"];
    bookingImg.src = res.data["attraction"]["image"];
    bookingAttractionName.textContent = res.data["attraction"]["name"];
    bookingDate.textContent = res.data["date"];
    const time = res.data["time"];
    if (time === "morning") {
      bookingTime.textContent = "早上9點到下午4點";
    } else {
      bookingTime.textContent = "下午5點到晚上9點";
    }
    bookingFee.textContent = res.data["price"];
    bookingArea.textContent = res.data["attraction"]["address"];
    footerWrap.style.height = "90px;";
  }
}

getReservationStatus();
