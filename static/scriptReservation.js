"use strict";

const navReserveBt = document.querySelector("#navReserveBt");

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
