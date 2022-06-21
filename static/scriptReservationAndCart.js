"use strict";

const navReserveBt = document.querySelector("#navReserveBt");
const cartBt = document.querySelector("#cartBt");
let countCircle = document.querySelector(".countCircle");

// 啟動SignInBox和mask
// showOrHide是從scriptSignInBox.js拔來的 大概可以找時間把中性功能獨立?
// 現在的運作方式是所有templates都要匯入共用的nav鈕上的scripts
// 所以有些共用功能都丟在這兩個scripts裡面
async function activeSignInBoxAndMask() {
  mask.addEventListener("wheel", preventScroll, { passive: false });
  showOrHide(mask);
  showOrHide(wrapForWholeSignInBox);
}

navReserveBt.addEventListener("click", async function (e) {
  e.preventDefault();
  const signIn = await checkSignIn();
  if (signIn) {
    window.location.replace("/booking");
  } else {
    activeSignInBoxAndMask();
  }
});

cartBt.addEventListener("click", async function (e) {
  e.preventDefault();
  const signIn = await checkSignIn();
  if (signIn) {
    window.location.replace("/cart");
  } else {
    activeSignInBoxAndMask();
  }
});

async function getCartLen() {
  const req = await fetch("/api/cart/len");
  const res = await req.json();
  if (!res.error) {
    let len = res.data.len;
    if (len) {
      return len;
    } else {
      return false;
    }
  }
}

async function changeCartCircle() {
  let cartCount = await getCartLen();
  if (cartCount) {
    countCircle.classList.remove("hide");
    countCircle.textContent = cartCount;
  }
}
changeCartCircle();
