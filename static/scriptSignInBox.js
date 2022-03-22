"use strict";

const wrapForWholeSignInBox = document.querySelector("#wrapForWholeSignInBox");
const signInOrnoAccountBt = document.querySelector("#signInOrnoAccountBt");
const signIn = document.querySelector(".signIn");
const signUp = document.querySelector(".signUp");
let title = document.querySelector(".signInHead > h3");
const gotAccountBt = document.querySelector("#gotAccountBt");
const noAccountBt = document.querySelector("#noAccountBt");
const closeBt = document.querySelector("#closeBt");
const signUpFormBt = document.querySelector("#signUpForm > button");
const signInFormBt = document.querySelector("#signInForm > button");

// show or hide things
function showOrHide(obj) {
  obj.classList.toggle("hide");
}

signInOrnoAccountBt.addEventListener("click", function (e) {
  e.preventDefault();
  showOrHide(wrapForWholeSignInBox);
});

closeBt.addEventListener("click", function (e) {
  e.preventDefault();
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

  // reset message
  signUpMessage.textContent = "";
  const userInputData = {
    name: signUpUserName.value,
    email: signUpUserEmail.value,
    password: signUpUserPassword.value,
  };

  const res = await fetch("/api/user", {
    method: "POST",
    headers: { content_type: "application/json" },
    body: JSON.stringify(userInputData),
  });

  const data = await res.json();
  if (data["error"]) {
    console.log(data["message"]);
    signUpMessage.textContent = data["message"];
    signUpMessage.classList.add("error");
  }
  if (data["ok"]) {
    signUpMessage.textContent = "Sign up success";
    signUpMessage.classList.add("success");
    // location.reload();
    // 看要不要過幾秒後自動跳轉?
  }

  // reset input
  signUpUserName.value = "";
  signUpUserEmail.value = "";
  signUpUserPassword.value = "";
  signUpMessage.value = "";
});

// 登入打API
signInFormBt.addEventListener("click", async function (e) {
  let signInUserEmail = document.querySelector("#signInUserEmail");
  let signInUserPassword = document.querySelector("#signInUserPassword");
  let signInMessage = document.querySelector("#signInMessage");

  e.preventDefault();
  signInMessage.classList.remove("error");

  const userInputData = {
    email: signInUserEmail.value,
    password: signInUserPassword.value,
  };

  const res = await fetch("/api/user", {
    method: "PATCH",
    headers: { content_type: "application/json" },
    body: JSON.stringify(userInputData),
  });

  const data = await res.json();

  if (data.ok) {
    location.reload();
    // 這邊要讓右上角註冊選單消失換成登出
  }

  if (data.error) {
    signInMessage.textContent = data.message;
    signInMessage.classList.add("error");
  }
});
