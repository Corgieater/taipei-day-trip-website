const url = "http://127.0.0.1:3000/api/attractions?page=0";

async function getData() {
  const res = await fetch(url);
  attractions = await res.json();
  attractions = attractions.data;
  console.log(attractions);
  console.log(attractions[0]["images"][0]);
  for (let i = 0; i < 12; i++) {
    makeLi();
  }
  let imgs = document.querySelectorAll(".pics img");
  let ps = document.querySelectorAll(".pics p");
  for (let i = 0; i < imgs.length; i++) {
    imgs[i].src = attractions[i]["images"][0];
    ps[i].textContent = attractions[i]["name"];
    console.log(`${attractions[i]["name"]}, ${attractions[i]["images"][0]}`);
  }
}

function makeLi(picAddress) {
  const showCase = document.querySelector("#showCase");
  const li = document.createElement("li");
  const img = document.createElement("img");
  img.alt = "pics";
  img.src = picAddress;
  const div = document.createElement("div");
  const p = document.createElement("p");
  div.append(img);
  div.append(p);
  // for (let i = 0; i < 2; i++) {
  //   const span = document.createElement("span");
  //   const p = document.createElement("p");
  //   span.append(p);
  //   div.append(span);
  // }
  // const spanPs = document.querySelectorAll("# showCase span p");
  // spanPs[0].textContent = "123";
  // spanPs[1].textContent = "123";

  div.classList.add("pics");
  li.append(div);
  showCase.append(li);
}
getData();
// =============get info and show the first 8===============

// const getData = async function () {
//   const res = await fetch(url);
//   const data = await res.json();
//   const dataInfo = data.result.results;
//   loadInfo(dataInfo, startPoint, endPoint);
// };

// // load more pics after clicked
// loadBtn.addEventListener("click", async function () {
//   const res = await fetch(url);
//   const data = await res.json();
//   const dataInfo = data.result.results;
//   const dataLength = dataInfo.length;

//   startPoint += 8;
//   endPoint += 8;
//   if (dataLength - endPoint < 8) {
//     endPoint = dataLength;
//   }
//   makeMoreContainer(startPoint, endPoint); //make containers
//   loadInfo(dataInfo, startPoint, endPoint);

//   if (endPoint >= dataLength) {
//     loadBtn.classList.add("hide");
//     const p = document.createElement("p");
//     const text = document.createTextNode("There is no picture any more!");
//     p.appendChild(text);
//     btnArea.appendChild(p);
//   }
// });

// function makeMoreContainer(startIndex, endIndex) {
//   for (let i = startIndex; i < endIndex; i++) {
//     const li = document.createElement("li");
//     const div = document.createElement("div");
//     const describe_div = document.createElement("div");
//     const img = document.createElement("img");
//     const p = document.createElement("p");
//     div.classList.add("card");
//     div.appendChild(img);
//     describe_div.classList.add("description");
//     div.appendChild(describe_div);
//     describe_div.appendChild(p);
//     li.appendChild(div);
//     mainUl.appendChild(li);
//   }
// }

// function loadInfo(data, startIndex, endIndex) {
//   const imgs = document.querySelectorAll(".card > img");
//   const p = document.querySelectorAll(".description > p");
//   for (let i = startIndex; i < endIndex; i++) {
//     let photo = data[i].file.split("https://");
//     let text = document.createTextNode(data[i].stitle);
//     imgs[i].src = `https://${photo[1]}`;
//     p[i].appendChild(text);
//   }
// }
// getData();
