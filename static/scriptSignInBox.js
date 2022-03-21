"use strict";

const wrapForWholeSignInBox = document.querySelector("#wrapForWholeSignInBox");
const signInBt = document.querySelector("#signInBt");
const closeBt = document.querySelector("#closeBt");

console.log("connected");

signInBt.addEventListener("click", function (e) {
  e.preventDefault();
  wrapForWholeSignInBox.classList.remove("hide");
});

closeBt.addEventListener("click", function (e) {
  e.preventDefault();
  wrapForWholeSignInBox.classList.add("hide");
});
