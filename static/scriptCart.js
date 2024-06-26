"use strict";
let prime = null;
let totalPrice = 0;
let totalItems = 0;

// 底下footer伸縮用
let footerWrap = document.querySelector(".footerWrap");
let footer = document.querySelector("footer");

// 確認跟付錢的按鈕
let confirmAndPayBt = document.querySelector("#confirmAndPayBt");

// 藏資料用
const cartWrap = document.querySelector(".cartWrap");
const infoWrap = document.querySelector(".infoWrap");

// 填資料跟做資料用
let contactNamePlace = document.querySelector("#contactName");
let contactEmailPlace = document.querySelector("#contactEmail");
let contactPhonePlace = document.querySelector("#contactPhone");

// 回上一步鈕
let lastStepBt = document.querySelector(".lastStepBt");

async function reqTappayInfo() {
  const getTappayInfo = await fetch("/api/orfers/tappayInfo", {
    method: "GET",
  });
  const tappayInfo = await getTappayInfo.json();
  TPDirect.setupSDK(tappayInfo.data.appId, tappayInfo.data.appKey, "sandbox");
}

async function getUserInfo() {
  const req = await fetch("/api/user", {
    method: "GET",
  });
  const res = await req.json();
  let userName = res["userName"];
  let userEmail = res["userEmail"];
  // 查不到使用者姓名就秀登入畫面
  if (res["userName"] === undefined) {
    activeSignInBoxAndMask();
    let closeBt = document.querySelector("#closeBt");
    closeBt.addEventListener("click", function () {
      location.replace("/");
      // 不登入就導回首頁
    });
  } else {
    contactNamePlace.value = userName;
    contactEmailPlace.value = userEmail;
  }
  return userName;
}

// 檢驗使用者購物車
async function getReservationStatus() {
  let name = await getUserInfo();
  // 拿使用者預定資料
  const req = await fetch("/api/cart", {
    method: "GET",
  });
  const res = await req.json();

  if (res["data"] === null || res["data"].length === 0) {
    let p = document.createElement("p");
    let h2 = document.createElement("h2");
    cartWrap.classList.remove("cratWrapMinHeight");
    h2.textContent = `您好，${name}：`;
    h2.classList.add("bold");
    p.textContent = "購物車目前是空的";
    p.style.color = "#666666";
    p.style.fontWeight = "normal";

    messagePlace.append(h2);
    messagePlace.append(p);
    footerWrap.classList.add("footerWrapHeight");
    footer.classList.add("footerStrech");
  } else {
    let divFortotalPrice = document.createElement("div");
    totalItems = res["data"].length;
    for (let i = 0; i < res["data"].length; i++) {
      let name = res["data"][i]["attraction"]["name"];
      let date = res["data"][i]["date"];
      let time = res["data"][i]["time"];
      let price = res["data"][i]["price"];
      let divForDataRow = document.createElement("div");
      let aLink = document.createElement("a");
      aLink.href = `#`;
      if (time === "morning") {
        time = "早上9點到下午4點";
      } else {
        time = "下午5點到晚上9點";
      }
      let dataRowContent = `
      <p> ${name} </p>
      <p> ${date} </p>
      <p> ${time} </p>
      <p> ${price} </p>
      `;

      divForDataRow.innerHTML = dataRowContent;
      divForDataRow.classList.add("dataRow");
      cartWrap.append(divForDataRow);
      totalPrice += parseInt(price);
      let img = document.createElement("img");
      img.src = "/static/imgs/icon_delete.png";
      aLink.append(img);
      aLink.setAttribute("id", "cartDelete");
      // 刪除功能
      aLink.addEventListener("click", async function (e) {
        e.preventDefault();
        const req = await fetch(`/api/cart/${i}`, {
          method: "DELETE",
        });
        let countCircle = document.querySelector(".countCircle");
        let count = countCircle.textContent;
        countCircle.textContent = count - 1;
        location.reload();
      });
      divForDataRow.append(aLink);
    }
    let totalPriceMark = `<p>總價： 新台幣 ${totalPrice} 元</p>`;
    divFortotalPrice.classList.add("totalPrice");
    divFortotalPrice.innerHTML = totalPriceMark;
    let totalMoneyPlace = document.querySelector("#totalMoney");
    let totalItmesPlace = document.querySelector("#totalItems");
    totalMoneyPlace.textContent = totalPrice;
    totalItmesPlace.textContent = totalItems;
    cartWrap.append(divFortotalPrice);
    let nextStepBt = document.createElement("button");
    nextStepBt.classList.add("nextStepBt");
    nextStepBt.textContent = "下一步";
    cartWrap.append(nextStepBt);

    nextStepBt.addEventListener("click", function () {
      infoWrap.classList.toggle("hide");
      cartWrap.classList.toggle("hide");
    });
  }
}

// 必填 CCV Example
var fields = {
  number: {
    // css selector
    element: "#card-number",
    placeholder: "**** **** **** ****",
  },
  expirationDate: {
    // DOM object
    element: document.getElementById("card-expiration-date"),
    placeholder: "MM / YY",
  },
  ccv: {
    element: "#card-ccv",
    placeholder: "後三碼",
  },
};

TPDirect.card.setup({
  fields: fields,
  styles: {
    // Style all elements
    input: {
      color: "gray",
    },
    ".valid": {
      color: "green",
    },
    // style invalid state
    ".invalid": {
      color: "red",
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    "@media screen and (max-width: 400px)": {
      input: {
        color: "orange",
      },
    },
  },
});

// 做要傳給後端的資料包
async function makeUserOrderJsonData(primeId) {
  let contactName = contactNamePlace.value;
  let contactEmail = contactEmailPlace.value;
  let contactPhone = contactPhonePlace.value;
  let tripArr = [];
  let body = {
    prime: primeId,
    order: {
      price: totalPrice,
      trip: tripArr,
    },
    contact: {
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
    },
  };
  let reqForUserCart = await fetch("/api/cart");
  let userCartData = await reqForUserCart.json();

  for (let i = 0; i < userCartData["data"].length; i++) {
    let cartItem = {
      attraction: {
        id: null,
        name: null,
        address: null,
        image: null,
      },
      date: null,
      time: null,
    };
    let userCartItem = userCartData["data"][i];
    cartItem["attraction"]["id"] = userCartItem["attraction"]["id"];
    cartItem["attraction"]["address"] = userCartItem["attraction"]["address"];
    cartItem["attraction"]["image"] = userCartItem["attraction"]["image"];
    cartItem["attraction"]["name"] = userCartItem["attraction"]["name"];
    cartItem["date"] = userCartItem["date"];
    cartItem["time"] = userCartItem["time"];
    tripArr.push(cartItem);
  }
  return body;
}

async function onSubmit(event) {
  event.preventDefault();

  let jsonData = null;
  let p = document.querySelector("#messagePlace p");
  if (p) {
    messagePlace.removeChild(p);
  }
  if (
    contactNamePlace === "" ||
    contactEmailPlace === "" ||
    contactPhonePlace.value === ""
  ) {
    let p = document.createElement("p");
    p.textContent = "資料並未填妥，請再檢查一次";
    messagePlace.append(p);
  } else {
    // Get prime
    TPDirect.card.getPrime(async function getPrime(result) {
      if (result.status !== 0) {
        let p = document.createElement("p");
        p.textContent = "無法取得Prime，請檢查付款資訊";
        messagePlace.append(p);
      } else {
        jsonData = await makeUserOrderJsonData(result.card.prime);
        let req = await fetch("/api/orders", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(jsonData),
        });

        let res = await req.json();
        let orderNum = res["data"]["number"];
        if (orderNum) {
          window.location.replace(`/thankyou?number=${orderNum}`);
          document.cookie =
            "userCart= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
        }
      }

      // send prime to your server, to pay with Pay by Prime API .
      // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
    });
  }
}

lastStepBt.addEventListener("click", function () {
  infoWrap.classList.toggle("hide");
  cartWrap.classList.toggle("hide");
  let p = document.querySelector("#messagePlace p");
  if (p) {
    messagePlace.removeChild(p);
  }
});

confirmAndPayBt.addEventListener("click", onSubmit);

reqTappayInfo();
getReservationStatus();
