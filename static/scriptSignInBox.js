"use strict";

const wrapForWholeSignInBox = document.querySelector("#wrapForWholeSignInBox");
const signInOrnoAccountBt = document.querySelector("#signInOrnoAccountBt");
const signIn = document.querySelector(".signIn");
const signUp = document.querySelector(".signUp");
const gotAccountBt = document.querySelector("#gotAccountBt");
const noAccountBt = document.querySelector("#noAccountBt");
const closeBt = document.querySelector("#closeBt");

console.log("connected");

signInOrnoAccountBt.addEventListener("click", function (e) {
  e.preventDefault();
  wrapForWholeSignInBox.classList.remove("hide");
});

closeBt.addEventListener("click", function (e) {
  e.preventDefault();
  wrapForWholeSignInBox.classList.add("hide");
});

gotAccountBt.addEventListener("click", function (e) {
  e.preventDefault();
  signUp.classList.add("hide");
  signIn.classList.remove("hide");
});

noAccountBt.addEventListener("click", function (e) {
  e.preventDefault();
  signIn.classList.add("hide");
  signUp.classList.remove("hide");
});
