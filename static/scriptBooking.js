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
  // 拿使用者資料
  const userInfo = await getUserInfoAndShow();
  console.log(userInfo);
  // 拿使用者預定資料
  const req = await fetch("/api/booking", {
    method: "GET",
  });
  const res = await req.json();
  console.log(res.data);
  // 如果這邊資料是null要把有資料的大頁藏起來
  // 讓footer延伸然後做另一個回覆
  bookingName.textContent = userInfo["userName"];
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
}

getReservationStatus();
