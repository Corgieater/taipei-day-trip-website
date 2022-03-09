const url = "http://127.0.0.1:3000/api/attractions?page=0";
const endText = document.querySelector("#end");
const submitBt = document.querySelector("#submitBt");
let globalNextPage = 0;
console.log(globalNextPage);

// ########see image if it blur fix it

function makeLi(picAddress, name, mrt, category) {
  const li = document.createElement("li");
  const showCase = document.querySelector("#showCase");
  if (mrt == null) {
    mrt = "沒有捷運站:(";
  }
  li.innerHTML = `
  <div class='pics'> 
  <img alt='pictures' src='${picAddress}'>
  <p class='name'>${name}</p>
  <div class='description'>
  <p class='mrt'>${mrt}</p>
  <p class='category'>${category}</p>
  </div>
  </div>
  `;
  showCase.append(li);
}

let options = {
  root: null,
  rootMargin: "0px",
  threshold: 1,
};

const observer = new IntersectionObserver(handleIntersect, options);
const endPoint = document.querySelector("#endPoint");
observer.observe(endPoint);

async function handleIntersect(entries) {
  if (entries[0].isIntersecting) {
    console.log("something is intersecting with the viewpoint");
    getData(globalNextPage);
  }
  const endFlag = document.querySelector(".endFlag");
  if (endFlag) {
    observer.disconnect();
  }
}

async function getData(next) {
  if (next != null) {
    let newUrl = `http://127.0.0.1:3000/api/attractions?page=${next}`;
    console.log(newUrl);
    newRes = await fetch(newUrl);
    newData = await newRes.json();
    let attractions = newData.data;
    console.log(attractions);
    for (let i = 0; i < attractions.length; i++) {
      picPlace = attractions[i]["images"][0];
      picName = attractions[i]["name"];
      picMrt = attractions[i]["mrt"];
      picCategory = attractions[i]["category"];
      makeLi(picPlace, picName, picMrt, picCategory);
    }
    globalNextPage = newData.nextPage;
  }
  if (next == null) {
    const main = document.querySelector("main");
    const p = document.createElement("p");
    p.classList.add("endFlag");
    p.textContent = "no more :(";
    p.classList.add("noPicText");
    main.append(p);
    return false;
  }
}
let textArea = document.querySelector("#keyword");

submitBt.addEventListener("click", async function (e) {
  // 北投
  e.preventDefault();
  observer.disconnect();
  const lastMessage = document.querySelector(".noPicText");
  console.log("last message", lastMessage);
  if (lastMessage) {
    lastMessage.remove();
  }
  const lis = document.querySelectorAll("#showCase li");
  let textArea = document.querySelector("#keyword");
  let userInput = textArea.value;
  let data = null;
  let attractions = null;

  try {
    const res = await fetch(
      `http://127.0.0.1:3000/api/attractions?page=0&keyword=${userInput}`
    );
    if (res.ok) {
      data = await res.json();
      attractions = data.data;
      console.log("data page", data.nextPage);
      if (data.nextPage != null) {
        observer.observe(endPoint);
      }
    } else {
      console.log("bo");
      const p = document.createElement("p");
      const main = document.querySelector("main");
      p.textContent = "no such keyword, try again:(";
      p.classList.add("noPicText");
      main.append(p);
      throw new Error("Something went wrong");
    }
  } catch (e) {
    console.log(e);
  }

  if (userInput != "") {
    for (let i = 0; i < lis.length; i++) {
      lis[i].remove();
    }
  }
  for (let i = 0; i < attractions.length; i++) {
    picPlace = attractions[i]["images"][0];
    picName = attractions[i]["name"];
    picMrt = attractions[i]["mrt"];
    picCategory = attractions[i]["category"];
    makeLi(picPlace, picName, picMrt, picCategory);
  }
});

// window.addEventListener("scroll", async function () {
//   // let url = `http://127.0.0.1:3000/api/attractions?page=0`;
//   if (endPoint.getBoundingClientRect().top < this.window.innerHeight) {
//     const res = await this.fetch(url);
//     let data = await res.json();
//     let nextPage = data.nextPage;
//     if (nextPage != null) {
//       let page = nextPage;
//       const res = await this.fetch(
//         `http://127.0.0.1:3000/api/attractions?page=${page}`
//       );
//       let data = await res.json();
//       console.log(data);
//     }
//   }
// });
