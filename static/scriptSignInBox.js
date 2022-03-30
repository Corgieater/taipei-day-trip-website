"use strict";

const wrapForWholeSignInBox = document.querySelector("#wrapForWholeSignInBox");
let mask = document.querySelector(".mask");
let nav = document.querySelector("nav");
const signInOrSignUpBt = document.querySelector("#signInOrSignUpBt");
const signOutBt = document.querySelector("#signOutBt");
const signIn = document.querySelector(".signIn");
const signUp = document.querySelector(".signUp");
let title = document.querySelector(".signInHead > h3");
const gotAccountBt = document.querySelector("#gotAccountBt");
const noAccountBt = document.querySelector("#noAccountBt");
const closeBt = document.querySelector("#closeBt");
const signUpFormBt = document.querySelector("#signUpForm > button");
const signInFormBt = document.querySelector("#signInForm > button");

// 給檢查登入API用
let signInEmail = null;
let signInPassword = null;

// 給各個功能抓value用
let signInUserEmail = document.querySelector("#signInUserEmail");
let signInUserPassword = document.querySelector("#signInUserPassword");
let signInMessage = document.querySelector("#signInMessage");
let signUpUserName = document.querySelector("#signUpUserName");
let signUpUserEmail = document.querySelector("#signUpUserEmail");
let signUpUserPassword = document.querySelector("#signUpUserPassword");
let signUpMessage = document.querySelector("#signUpMessage");

// show or hide things
function showOrHide(obj) {
  obj.classList.toggle("hide");
}

// prevent scrolling
function preventScroll(e) {
  e.preventDefault();
  e.stopPropagation();

  return false;
}

// do message
function makeMessage(messageArea, message, classStyle) {
  messageArea.textContent = message;
  messageArea.classList.add(classStyle);
}

// 清空欄位變換title
function returnDefaultValue(messageReset) {
  signInUserEmail.value = "";
  signInUserPassword.value = "";
  signInMessage.textContent = "";
  signUpUserName.value = "";
  signUpUserEmail.value = "";
  signUpUserPassword.value = "";
  signUpMessage.value = "";
  signUpMessage.textContent = "";
  title.textContent = messageReset;
}

// 確認登入與否然後回傳使用者名稱
async function checkSignIn() {
  const req = await fetch("/api/user", {
    method: "GET",
  });
  const res = await req.json();
  if (res.data !== null) {
    return true;
  }
}

// 感覺很重複 可以精簡嗎
signInOrSignUpBt.addEventListener("click", function (e) {
  e.preventDefault();
  mask.addEventListener("wheel", preventScroll, { passive: false });
  showOrHide(mask);
  showOrHide(wrapForWholeSignInBox);
});

// 關閉按鈕 回復先前的設定
closeBt.addEventListener("click", function (e) {
  e.preventDefault();
  showOrHide(mask);
  showOrHide(wrapForWholeSignInBox);
  returnDefaultValue("登入會員帳號");
  signUp.classList.add("hide");
  signIn.classList.remove("hide");
});

// 有帳號按鈕
// 還可以再精簡嗎?
gotAccountBt.addEventListener("click", function (e) {
  e.preventDefault();
  title.textContent = "登入會員帳號";
  showOrHide(signUp);
  showOrHide(signIn);
  returnDefaultValue("登入會員帳號");
});

// 沒帳號按鈕
noAccountBt.addEventListener("click", function (e) {
  e.preventDefault();
  title.textContent = "註冊會員帳號";
  showOrHide(signUp);
  showOrHide(signIn);
  returnDefaultValue("註冊會員帳號");
});

// 註冊打API 作業過了再寫一些比較複雜的判斷
signUpFormBt.addEventListener("click", async function (e) {
  e.preventDefault();
  signUpMessage.classList.remove("error");
  signUpMessage.classList.remove("success");

  // reset message
  signUpMessage.textContent = "";

  if (
    // 先判斷有沒有東西沒填
    signUpUserName.value === "" ||
    signUpUserEmail.value === "" ||
    signUpUserPassword.value === ""
  ) {
    makeMessage(signUpMessage, "好像有東西沒填喔:(", "error");
  } else {
    // 東西都有填就判斷email格式
    if (signUpUserEmail.value.indexOf("@") === -1) {
      makeMessage(signUpMessage, "信箱的格式有誤", "error");
    } else {
      const userInputData = {
        name: signUpUserName.value,
        email: signUpUserEmail.value,
        password: signUpUserPassword.value,
      };

      const req = await fetch("/api/user", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userInputData),
      });

      const res = await req.json();
      if (res["error"]) {
        makeMessage(signUpMessage, res["message"], "error");
      }
      if (res["ok"]) {
        makeMessage(signUpMessage, "Sign up success", "success");
        signUpUserName.value = "";
        signUpUserEmail.value = "";
        signUpUserPassword.value = "";
        signUpMessage.value = "";
        // 看要不要做看看過幾秒後自動跳轉?
      }
    }
  }
});

// 登入打API
signInFormBt.addEventListener("click", async function (e) {
  let signInMessage = document.querySelector("#signInMessage");
  signInEmail = signInUserEmail.value;
  signInPassword = signInUserPassword.value;

  e.preventDefault();
  signInMessage.classList.remove("error");

  if (signInEmail === "" || signInPassword === "") {
    makeMessage(signInMessage, "請輸入帳號密碼登入", "error");
  } else {
    let userInputData = {
      email: signInEmail,
      password: signInPassword,
    };

    const req = await fetch("/api/user", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(userInputData),
    });

    const res = await req.json();
    if (res.ok) {
      showOrHide(wrapForWholeSignInBox);

      location.reload();
    }

    if (res.error) {
      makeMessage(signInMessage, res.message, "error");
    }
  }
});

// 有登入的話要秀登出鈕而不是登入註冊鈕
async function showOrHideSignInAndReserveBox() {
  const signIn = await checkSignIn();
  if (signIn) {
    let li = document.querySelector(".signInAndReserveBox .hide");
    showOrHide(li);
    showOrHide(signInOrSignUpBt);
  }
}

signOutBt.addEventListener("click", async function (e) {
  e.preventDefault();
  await fetch("/api/user", {
    method: "DELETE",
  });
  location.reload();
});

showOrHideSignInAndReserveBox();
