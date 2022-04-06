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
  // item = res.data.trip.attraction;
  // let itemList = [];
  // for (let i = 0; i < item.length; i++) {
  //   itemList.push(item[i]);
  // }
  return res;
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

  if (res.data === null) {
    // 使用者沒預定就把footer拉高秀沒有預定的字樣
    bookingDescriptionAndImgWrap.classList.add("hide");
    body.classList.add("hide");
    let p = document.createElement("p");
    p.textContent = "目前沒有任何預定的行程";
    messagePlace.append(p);
    footerWrap.classList.add("footerWrapHeight");
    footer.classList.add("footerStrech");
  } else {
    let orderListWrap = document.querySelector(".orderListWrap");
    let orderList = res.data.userOrders;

    for (let i = 0; i < orderList.length; i++) {
      let orderDetails = await getReservation(orderList[i]);
      console.log(orderDetails);
      let itemList = orderDetails.data.trip.attraction;
      let div = document.createElement("div");

      div.innerHTML = `<div class="order">
      <div class="orderHead">
        <h2 id="orderNum">訂單編號：${orderList[i]}</h2>
        <h2 id="orderTotalPrice">總價： ${orderDetails.data.price}</h2>
        <button>訂單詳細</button>
      </div>
      <div class="orderBody hide">
      </div>
    </div>`;
      orderListWrap.append(div);

      for (let j = 0; j < itemList.length; j++) {
        let div2 = document.createElement("div");
        let orderBodies = document.querySelectorAll(".orderBody");
        let time = null;
        let money = null;
        if (itemList[j]["time"] === "morning") {
          time = "早上9點到下午4點";
          money = 2000;
        } else {
          time = "下午5點到晚上9點";
          money = 2500;
        }
        div2.innerHTML = `
        <div class="orderWrap">
        <div class="orderDetails">
        <p class="bold">品項： <p>${itemList[j]["name"]}</p></p>
        <p class="bold">日期：<p>${itemList[j]["date"]}</p> </p>
        <p class="bold">時間： <p>${time}</p></p>
        <p class="bold">價錢： <p>${money} 元 新台幣</p></p>
      </div>
      <div class="orderImg">
      <img src="${itemList[j]["image"]}" alt="pic">
       </div>
       </div>
      `;
        orderBodies[i].append(div2);
      }

      let orderDetailBt = document.querySelectorAll(".orderHead button");
      orderDetailBt[i].addEventListener("click", async function () {
        let orderBodies = document.querySelectorAll(".orderBody");
        orderBodies[i].classList.toggle("hide");
        // const req = await fetch(`/api/orders/${orderList[i]}`, {
        //   method: "GET",
        // });
        // const res = await req.json();
        // console.log(res);
        // item = res.data.trip.attraction;
        // let itemList = [];
        // for (let i = 0; i < item.length; i++) {
        //   itemList.push(item[i]);
        // }
      });
    }

    // 有預定footer正常秀資料
    //   footer.classList.add("footerNormal");
    //   contactName.value = userInfo["userName"];
    //   contactEmail.value = userInfo["userEmail"];
    //   bookingImg.src = res.data[0]["attraction"]["image"];
    //   bookingAttractionName.textContent = res.data[0]["attraction"]["name"];
    //   bookingDate.textContent = res.data[0]["date"];
    //   const time = res.data[0]["time"];
    //   if (time === "morning") {
    //     bookingTime.textContent = "早上9點到下午4點";
    //   } else {
    //     bookingTime.textContent = "下午5點到晚上9點";
    //   }
    //   bookingFee.textContent = res.data[0]["price"];
    //   bookingArea.textContent = res.data[0]["attraction"]["address"];
    // }
  }
}
// 刪除預定
// bookingDelete.addEventListener("click", async function (e) {
//   e.preventDefault();
//   const req = await fetch("/api/booking", {
//     method: "DELETE",
//   });
//   location.reload();
// });

getReservationStatus();

// 不知道有沒有辦法在沒有登入時，選完日期時間後登入，登入完選的選項還在，或是直接進到預約後的頁面
// 或許是這邊就要率先存cookie?不確定，通過作業再來看看
