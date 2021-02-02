const list = [];
const listOfObj = [];
const shops = JSON.parse(localStorage.getItem("lastShopsInfo")) || [];
let cardSum = 0;
let stickerSum = 0;

//search cols of cards and stickers
let nameIndex;
let cardIndex;
let stickIndex;
const getIndexes = (str) => {};

//delete col time of work
const deleteTime = (str) => {};

const createPreview = () => {
  const printBlock = document.querySelector(".print-block");
  printBlock.style.display = "grid";
  const hiddenButton = document.querySelector(".hidden__button");
  hiddenButton.style.display = "block";
  actualOrdersOnly(listOfObj).forEach((elem) => {
    const shopName = document.createElement("div");
    shopName.classList.add("shop-name");
    shopName.textContent = elem.name;
    printBlock.appendChild(shopName);
    const shopCards = document.createElement("div");
    shopCards.classList.add("quantity");
    shopCards.textContent = elem.cards;
    printBlock.appendChild(shopCards);
    const shopStickers = document.createElement("div");
    shopStickers.classList.add("quantity");
    shopStickers.textContent = elem.stickers;
    printBlock.appendChild(shopStickers);
  });
  const summ = document.createElement("div");
  summ.classList.add("title");
  summ.textContent = `ИТОГО`;
  printBlock.appendChild(summ);
  const summCards = document.createElement("div");
  summCards.classList.add("title");
  summCards.textContent = cardSum;
  printBlock.appendChild(summCards);
  const summStickers = document.createElement("div");
  summStickers.classList.add("title");
  summStickers.textContent = stickerSum;
  printBlock.appendChild(summStickers);
};

const createObj = (arr) => {
  if (arr[1] !== undefined && arr[1].length > 0) {
    const obj = {};
    obj.name = checkShopName(arr[1]);
    obj.cards = +arr[8] > 0 ? +arr[8] : 0;
    obj.stickers = +arr[9] > 0 ? +arr[9] : 0;
    listOfObj.push(obj);
  }
};

const actualOrdersOnly = (arr) => {
  arr.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  const result = [];
  arr.forEach((el) => {
    if (el.name.includes(`_`)) {
      if (el.cards > 0 || el.stickers > 0) {
        result.push(el);
        cardSum += el.cards;
        stickerSum += el.stickers;
      }
    }
  });
  return result;
};

const checkShopName = (name) => {
  name = name.split('"').join("").replace("  ", " ").trim();
  let namePart = name.match(/_.+/g);
  if (namePart !== null) {
    namePart = namePart.toString().split('_').join('').trim();
  }
  shops.forEach((elem, i) => {
    if (elem.includes(namePart)) {
      name = shops[i];
    }
  });
  return name;
};

const whatDayIsItToday = () => {
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (day < 10) day = "0" + day;
  if (month < 10) month = "0" + month;
  return `${day}.${month}.${year}`;
};

const updateInfo = () => {
  localStorage.setItem(`fullDate`, JSON.stringify(whatDayIsItToday()));
  return whatDayIsItToday();
};

const getLastInfo = () => {
  const last = JSON.parse(localStorage.getItem("fullDate"));
  return last;
};

const outputInfo = (correctDate) => {
  document.querySelector(
    "#lastInfo"
  ).textContent = `Список салонов от ${correctDate}.`;
};

outputInfo(getLastInfo());

//upload actual shop list
document.getElementById("shops").onchange = function () {
  shops.length = 0;
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let salons = this.result.split("\n");
    salons.forEach((salon) => {
      salon = salon.split(";");
      let shop = salon[0];
      if (shop.includes("_")) {
        const res = shop.split('"').join("");
        const final = res.replace("  ", " ");
        shops.push(final.trim());
      }
    });
    localStorage.setItem(`lastShopsInfo`, JSON.stringify(shops));
    outputInfo(updateInfo());
  };
  reader.readAsText(file, "windows-1251");
};

//creating objects of shops
document.getElementById("list").onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let rows = this.result.split("\r");
    // console.log(rows);
    Array.from(rows).forEach((row) => {
      row = Array.from(row.split(";"));
      createObj(row);
    });
    createPreview();
  };
  reader.readAsText(file, "windows-1251");
};

document.querySelector("#download").onclick = function () {
  if (document.querySelector("#list").value !== "") {
    let csv = `№;Салон;Визитки;Наклейки\n`;
    let totalCards = 0,
      totalStickers = 0;
    actualOrdersOnly(listOfObj).forEach((el, i) => {
      totalCards += el.cards;
      totalStickers += el.stickers;
      csv += `${i + 1};${el.name};${el.cards};${el.stickers}`;
      csv += `\n`;
    });
    csv += `;ИТОГО:;${totalCards};${totalStickers}`;
    var hiddenElement = document.createElement("a");
    hiddenElement.href =
      "data:text/csv;charset=utf-8," + encodeURI("\uFEFF" + csv);
    hiddenElement.target = "_blank";
    hiddenElement.download = "Отгрузка визиток и наклеек.csv";
    hiddenElement.click();
  }
};
