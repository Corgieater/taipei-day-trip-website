"use strict";

let url = window.location.href;
url = new URL(url);
let number = url.searchParams.get("number");
console.log(number);

let h2 = document.querySelector(".thxBody h2");
h2.textContent += number;
