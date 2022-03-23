"use strict";

const wrapForWholeSignInBox = document.querySelector("#wrapForWholeSignInBox");
let modalBox = document.querySelector(".modalBox");
let nav = document.querySelector("nav");
const signInOrnoAccountBt = document.querySelector("#signInOrnoAccountBt");
const signOutBt = document.querySelector("#signOutBt");
const signIn = document.querySelector(".signIn");
const signUp = document.querySelector(".signUp");
let title = document.querySelector(".signInHead > h3");
const gotAccountBt = document.querySelector("#gotAccountBt");
const noAccountBt = document.querySelector("#noAccountBt");
const closeBt = document.querySelector("#closeBt");
const signUpFormBt = document.querySelector("#signUpForm > button");
const signInFormBt = document.querySelector("#signInForm > button");
// new
let signInUserEmail = document.querySelector("#signInUserEmail");
let signInUserPassword = document.querySelector("#signInUserPassword");
let signInEmail = null;
let signInPassword = null;

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

signInOrnoAccountBt.addEventListener("click", function (e) {
  e.preventDefault();
  modalBox.addEventListener("wheel", preventScroll, { passive: false });
  nav.style.backgroundColor = "rgba(0, 0, 0, 0.15)";
  showOrHide(modalBox);
  showOrHide(wrapForWholeSignInBox);
});

closeBt.addEventListener("click", function (e) {
  e.preventDefault();
  nav.style.backgroundColor = "white";
  showOrHide(modalBox);
  showOrHide(wrapForWholeSignInBox);
});

// 還可以再精簡嗎?
gotAccountBt.addEventListener("click", function (e) {
  e.preventDefault();
  title.textContent = "登入會員帳號";
  showOrHide(signUp);
  showOrHide(signIn);
});

noAccountBt.addEventListener("click", function (e) {
  e.preventDefault();
  title.textContent = "註冊會員帳號";
  showOrHide(signUp);
  showOrHide(signIn);
});

// 註冊打API
signUpFormBt.addEventListener("click", async function (e) {
  let signUpUserName = document.querySelector("#signUpUserName");
  let signUpUserEmail = document.querySelector("#signUpUserEmail");
  let signUpUserPassword = document.querySelector("#signUpUserPassword");
  let signUpMessage = document.querySelector("#signUpMessage");

  e.preventDefault();
  signUpMessage.classList.remove("error");
  signUpMessage.classList.remove("success");

  // reqet message
  signUpMessage.textContent = "";
  const userInputData = {
    name: signUpUserName.value,
    email: signUpUserEmail.value,
    password: signUpUserPassword.value,
  };

  const req = await fetch("/api/user", {
    method: "POST",
    headers: { content_type: "application/json" },
    body: JSON.stringify(userInputData),
  });

  const res = await req.json();
  if (res["error"]) {
    console.log(res["message"]);
    signUpMessage.textContent = res["message"];
    signUpMessage.classList.add("error");
  }
  if (res["ok"]) {
    signUpMessage.textContent = "Sign up success";
    signUpMessage.classList.add("success");
    // location.reload();
    // 看要不要過幾秒後自動跳轉?
  }

  // reqet input
  signUpUserName.value = "";
  signUpUserEmail.value = "";
  signUpUserPassword.value = "";
  signUpMessage.value = "";
});

// 登入打API
signInFormBt.addEventListener("click", async function (e) {
  // let signInUserEmail = document.querySelector("#signInUserEmail");
  // let signInUserPassword = document.querySelector("#signInUserPassword");
  let signInMessage = document.querySelector("#signInMessage");
  signInEmail = signInUserEmail.value;
  signInPassword = signInUserPassword.value;

  e.preventDefault();
  signInMessage.classList.remove("error");

  const userInputData = {
    email: signInUserEmail.value,
    password: signInUserPassword.value,
  };

  const req = await fetch("/api/user", {
    method: "PATCH",
    headers: { content_type: "application/json" },
    body: JSON.stringify(userInputData),
  });

  const res = await req.json();

  if (res.ok) {
    showOrHide(wrapForWholeSignInBox);
    location.reload();
    // 這邊要讓右上角註冊選單消失換成登出
  }

  if (res.error) {
    signInMessage.textContent = res.message;
    signInMessage.classList.add("error");
  }
});

// 確認session打API
async function checkSession() {
  const req = await fetch("/api/user", {
    method: "GET",
  });
  const res = await req.json();
  if (res.data !== null) {
    let li = document.querySelector(".signInAndReserveBox .hide");
    showOrHide(li);
    showOrHide(signInOrnoAccountBt);
  }
}

// 登出打API
signOutBt.addEventListener("click", async function () {
  console.log("hi");
  const req = await fetch("/api/user", {
    method: "DELETE",
  });
  const res = await req.json();
  console.log(res);
  location.reload();
});

checkSession();
