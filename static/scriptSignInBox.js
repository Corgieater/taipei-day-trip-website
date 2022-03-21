"use strict";

const wrapForWholeSignInBox = document.querySelector("#wrapForWholeSignInBox");
const signInOrSignUpBt = document.querySelector("#signInOrSignUpBt");
const signInBt = document.querySelector("#signInBt");
const signUpBt = document.querySelector("#signUpBt");
const closeBt = document.querySelector("#closeBt");

console.log("connected");

signInOrSignUpBt.addEventListener("click", function (e) {
  e.preventDefault();
  wrapForWholeSignInBox.classList.remove("hide");
});

closeBt.addEventListener("click", function (e) {
  e.preventDefault();
  wrapForWholeSignInBox.classList.add("hide");
});

signInBt.addEventListener("click", function (e) {
  e.preventDefault();
});

signUpBt.addEventListener("click", function (e) {
  e.preventDefault();
  const signIn = document.querySelector(".signIn");
  signIn.classList.add("hide");
});
