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
const bookingDelete = document.querySelector("#bookingDelete");

let orderListWrap = document.querySelector(".orderListWrap");

// 從登入資訊拿使用者姓名然後改頁面資訊
async function getUserInfo() {
  const req = await fetch("/api/user", {
    method: "GET",
  });
  const res = await req.json();
  // 查不到使用者姓名直接丟回首頁
  if (res["userName"] === undefined) {
    window.location.replace("/");
  }
  return res;
}

// 拿已付款的行程
async function getReservation(orderNum) {
  const req = await fetch(`/api/orders/${orderNum}`, {
    method: "GET",
  });
  const res = await req.json();
  return res;
}

// booking頁面顯示用的小功能
// 做整個訂單包
function createWholeOrder(orderList, price) {
  let div = document.createElement("div");
  div.classList.add("wholeOrder");

  div.innerHTML = `<div class="order">
  <div class="orderHead">
    <h2 id="orderNum">訂單編號：${orderList}</h2>
    <h2 id="orderTotalPrice">總價： ${price}</h2>
    <button>訂單詳細</button>
  </div>
  <div class="orderBody hide">
  </div>
</div>`;
  orderListWrap.append(div);
}

// 做order打開後的細項內容
function makeOrderDetails(item, orderBody) {
  let div2 = document.createElement("div");
  let time = null;
  let money = null;
  if (item["time"] === "morning") {
    time = "早上9點到下午4點";
    money = 2000;
  } else {
    time = "下午5點到晚上9點";
    money = 2500;
  }
  div2.innerHTML = `
  <div class="orderWrap">
  <div class="orderDetails">
  <p class="bold">品項： <p>${item["name"]}</p></p>
  <p class="bold">日期：<p>${item["date"]}</p> </p>
  <p class="bold">時間： <p>${time}</p></p>
  <p class="bold">價錢： <p>${money} 元 新台幣</p></p>
</div>
<div class="orderImg">
<img src="${item["image"]}" alt="pic">
 </div>
 </div>
`;
  orderBody.append(div2);
}

// 幫訂單詳細加上功能
function addFuncToorderDetailBt(orderDetailBt, orderBody) {
  orderDetailBt.addEventListener("click", async function () {
    orderBody.classList.toggle("hide");
  });
}

// 檢驗使用者有沒有購買的行程
async function getReservationStatus() {
  // footer延伸與否用
  let footerWrap = document.querySelector(".footerWrap");
  let footer = document.querySelector("footer");
  // 拿使用者資料
  const userInfo = await getUserInfo();
  // 拿使用者預定資料
  const req = await fetch("/api/booking", {
    method: "GET",
  });
  const res = await req.json();
  bookingName.textContent = userInfo["userName"];

  if (res.data.userOrders.length === 0) {
    let bookingTitle = document.querySelector(".bookingTitle");
    bookingTitle.classList.remove("hide");
    // 使用者沒預定就把footer拉高秀沒有預定的字樣
    let head = document.querySelector(".head");
    head.classList.remove("headMinHeight");
    bookingDescriptionAndImgWrap.classList.add("hide");
    body.classList.add("hide");
    let p = document.createElement("p");
    p.textContent = "目前沒有任何預定的行程";
    messagePlace.append(p);
    footerWrap.classList.add("footerWrapHeight");
    footer.classList.add("footerStrech");
  } else {
    // 使用者成立的訂單資料，正常來說一頁五筆
    let orderList = res.data.userOrders;
    orderListWrap.classList.remove("hide");

    for (let i = 0; i < orderList.length; i++) {
      // 要訂單成立後的詳細資料
      let orderDetails = await getReservation(orderList[i]);
      console.log(orderDetails);
      let itemList = orderDetails.data.trip.attraction;
      createWholeOrder(orderDetails.data.number, orderDetails.data.price);

      for (let j = 0; j < itemList.length; j++) {
        let orderBodies = document.querySelectorAll(".orderBody");
        makeOrderDetails(itemList[j], orderBodies[i]);
      }

      // 幫訂單細節按鈕加上功能
      let orderDetailBt = document.querySelectorAll(".orderHead button");
      let orderBodies = document.querySelectorAll(".orderBody");
      addFuncToorderDetailBt(orderDetailBt[i], orderBodies[i]);
    }
  }
}

async function makePages() {
  const req = await fetch("/api/booking", {
    method: "GET",
  });
  const res = await req.json();
  let totalPages = res.totalPages;
  // 做頁碼區
  let div = document.createElement("div");
  div.classList.add("pageArea");
  orderListWrap.append(div);

  // 做頁碼
  for (let i = 0; i < totalPages; i++) {
    let aLink = document.createElement("a");
    aLink.classList.add("pages");
    aLink.href = `#`;
    aLink.textContent = i + 1;
    div.append(aLink);

    // 幫頁碼加功能
    aLink.addEventListener("click", async function (e) {
      // 要資料庫資料，後端是每五筆一頁
      e.preventDefault();
      const req = await fetch(`/api/booking?page=${i}`, {
        method: "GET",
      });
      const res = await req.json();
      console.log("res", res);
      let nextPageItems = res.data.userOrders;
      // 刪掉前個頁面的東西
      let wholeOrders = document.querySelectorAll(".wholeOrder");
      for (let i = 0; i < wholeOrders.length; i++) {
        wholeOrders[i].remove();
      }
      for (let i = 0; i < nextPageItems.length; i++) {
        let orderDetails = await getReservation(nextPageItems[i]);
        console.log("oder", orderDetails);
        let itemList = orderDetails.data.trip.attraction;
        console.log("item", itemList);
        createWholeOrder(orderDetails.data.number, orderDetails.data.price);
        for (let j = 0; j < itemList.length; j++) {
          let orderBodies = document.querySelectorAll(".orderBody");
          makeOrderDetails(itemList[j], orderBodies[i]);
        }
        let orderDetailBt = document.querySelectorAll(".orderHead button");
        let orderBodies = document.querySelectorAll(".orderBody");
        addFuncToorderDetailBt(orderDetailBt[i], orderBodies[i]);
      }
    });
  }
}

getReservationStatus();
makePages();
// 不知道有沒有辦法在沒有登入時，選完日期時間後登入，登入完選的選項還在，或是直接進到預約後的頁面
// 或許是這邊就要率先存cookie?不確定，通過作業再來看看
// 上面功能應該還可以再包
