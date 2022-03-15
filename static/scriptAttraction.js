"user strict";

const currentUrl = window.location.href;
let currentId = currentUrl.slice(-2);
if (currentId.indexOf("/") !== -1) {
  currentId = currentId.slice(1);
}

async function fetchAttractionById() {
  const res = await fetch("/api/attraction/" + currentId);
  const data = await res.json();
  const attraction = data.data;
  console.log(attraction);
  const img = document.querySelector("#attractionImgContainer > img");
  const name = document.querySelector(".attractionName > h2");
  const category = document.querySelector(".attractionNameCategory");
  const area = document.querySelector(".attractionNameArea");
  const description = document.querySelector(".attractionBodyDescription");
  const address = document.querySelector(".attractionBodyAddress");
  const transport = document.querySelector(".attractionBodyTransport");
  img.src = attraction["images"][0];
  // 這邊要想辦法做輪播
  name.textContent = attraction["name"];
  category.textContent = attraction["category"];
  if (area === null) {
    area = attraction[i]["address"].split(" ")[0];
  }
  area.textContent = attraction["mrt"];
  description.textContent = attraction["description"];
  address.textContent = attraction["address"];
  transport.textContent = attraction["transport"];
}

fetchAttractionById();
