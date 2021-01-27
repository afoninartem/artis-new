let tableHeader = `№;Салон;Плакат;VIP;Пакет;Кружка;Упак;Вино;Набор;Развертка;5гр;Леденец;Листовка;Зеленый;Серый;Зажим;Палочка`;
const materials = [
  `vip`,
  `vipPack`,
  `cup`,
  `cupPack`,
  `vine`,
  `chocoSet`,
  `chest`,
  `choco5`,
  `candy`,
  `leaflet`,
  `green`,
  `gray`,
  `clamp`,
  `stick`,
];
const shops =
  JSON.parse(localStorage.getItem("lastShopsInfoForStockReportHandling")) || [];
const handleReports = [];
const tipList = document.querySelector(".tip-list");
const stopList = [];
const stopPrev = document.querySelector(".stop-list");
const presents = [];
shops.map((shop) => {
  const obj = {};
  obj.name = shop;
  obj.male = 0;
  obj.female = 0;
  obj.children = 0;
  obj.newspapers = 0;
  presents.push(obj);
});

// checkbox
let checked;
document.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    checked = Array.from(document.querySelectorAll("input[type=checkbox]"))
      .filter((el) => el.checked)
      .map((el) => el.value);
    console.log(checked);
  });
});

let shopsReports = [];
const shopsMoscow = [];
const shopsRegion = [];
let reportsMoscow = [];
let reportsRegion = [];
const shopsMoscowForCalc = [];
const shopsRegionForCalc = [];

//TOTAL SUMMS
const tT = {};
const tTP = {};
const table = document.querySelector(".table");

//tip handle
const clear = (elem) => {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }
};

document.querySelector("#clearStopList").onclick = function () {
  clear(stopPrev);
  while (stopList.length > 0) {
    stopList.pop();
  }
  document.querySelector(".stop-preview").style.display = "none";
};

const stopPreview = (name) => {
  const stopPrevItem = document.createElement("li");
  stopPrevItem.classList.add("prev-item");
  stopPrevItem.textContent = name;
  stopPrev.appendChild(stopPrevItem);
};

const tip2Stop = (match) => {
  const name = document.querySelector(`button[value='${match}']`).value;
  stopList.push(name);
  clear(tipList);
  stopPreview(name);
  document.querySelector("#userStopInput").value = "";
  document.querySelector(".stop-preview").style.display = "block";
};

//stop list input
document.querySelector("#userStopInput").oninput = function () {
  const userInput = document.querySelector("#userStopInput").value;
  if (userInput.length > 2) {
    let matches = shops.filter((shop) =>
      shop.toLowerCase().includes(userInput)
    );
    clear(tipList);
    matches.forEach((match) => {
      const li = document.createElement("li");
      li.classList.add("tip-list__item");
      li.innerHTML = `<button type="button" value="${match}" onclick="tip2Stop('${match}')" class="tip-list-item__link">Исключить ${match}</button>`;
      tipList.appendChild(li);
    });
  }
  if (userInput.length === 0) clear(tipList);
};

const createSumsString = (obj) => {
  let str = `${obj.poster};${obj.vip};${obj.vipPack};${obj.cup};${
    obj.cupPack
  };${obj.vine};${obj.chocoSet};${obj.chest};${
    obj.choco5
  };${obj.candy.toString().replace(".", ",")};${obj.leaflet
    .toString()
    .replace(".", ",")};${obj.green};${obj.gray};${obj.clamp};${obj.stick}`;
  const checked = Array.from(document.querySelectorAll(".checkbox"))
    .filter((el) => el.checked)
    .map((el) => (el = el.value));
  if (checked.includes("male") || checked.includes("female"))
    str += `;${obj.presents}`;
  if (checked.includes("children")) str += `;${obj.children}`;
  if (checked.includes("newspapers")) str += `;${obj.newspapers}`;
  return str;
};

const sum2Print = (arr) => {
  const summs = {};
  const mats = Array.from(materials);
  mats.push(`poster`);
  mats.forEach((mat) => (summs[mat] = 0));
  arr.forEach((shop) => {
    for (material in summs) {
      summs[material] += +shop[material].toString().replace(",", ".");
    }
  });
  for (elem in summs) {
    tTP[elem] === undefined
      ? (tTP[elem] = summs[elem])
      : (tTP[elem] += summs[elem]);
  }
  // console.log(summs);
  const res = `;ИТОГО;${createSumsString(summs)}`;
  return res.split(";").forEach((el, i) => {
    const sum = document.createElement("div");
    sum.classList.add("summary");
    sum.textContent = el;
    table.appendChild(sum);
  });
};

const printTotal = (tTP) => {
  const res = `;ИТОГО ВСЕГО;${createSumsString(tTP)}`;
  return res.split(";").forEach((el, i) => {
    const sum = document.createElement("div");
    sum.classList.add("summary");
    sum.textContent = el;
    table.appendChild(sum);
  });
};

const array2Print = (arr) => {
  return arr.forEach((shop, i) => {
    const num = document.createElement("div");
    num.classList.add("num");
    num.textContent = +i + 1;
    table.appendChild(num);

    const name = document.createElement("div");
    name.classList.add("shop-name");
    name.textContent = shop.name;
    table.appendChild(name);

    const poster = document.createElement("div");
    poster.classList.add("poster");
    poster.classList.add("cell");
    poster.textContent = shop.poster;
    table.appendChild(poster);

    materials.forEach((mat) => {
      const newCell = document.createElement("div");
      newCell.classList.add(mat);
      newCell.classList.add("cell");
      newCell.textContent = shop[mat];
      table.appendChild(newCell);
    });
  });
};

const makeHeader = () => {
  return tableHeader.split(";").forEach((el) => {
    const tableHeaderCell = document.createElement("div");
    tableHeaderCell.classList.add("table-header");
    tableHeaderCell.textContent = el;
    table.appendChild(tableHeaderCell);
  });
};

const tableDraw = () => {
  table.style.display = "grid";
  table.style.gridTemplateColumns = `max-content max-content repeat(${
    materials.length + 1
  }, minmax(60px, auto))`;
  document.querySelector(".hidden__button").style.display = `flex`;
  makeHeader();
  array2Print(shopsMoscowForCalc);
  sum2Print(shopsMoscowForCalc);
  makeHeader();
  array2Print(shopsRegionForCalc);
  sum2Print(shopsRegionForCalc);
  printTotal(tTP);
  table.childNodes.forEach((cell) => cell.classList.add(`cell`));
};

//getting shop name for check
const checkShopName = (name) => {
  const namePart = name.match(/_.+/g);
  shops.forEach((elem, i) => {
    if (elem.includes(namePart)) name = shops[i];
  });
  return name.split('"').join("");
};

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
        shops.push(final);
      }
    });
    localStorage.setItem(
      `lastShopsInfoForStockReportHandling`,
      JSON.stringify(shops)
    );
    outputInfo(updateInfo());
  };
  reader.readAsText(file, "windows-1251");
};

//generation of date tip for actual shop list
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
  localStorage.setItem(
    `fullDateForStockReportHandling`,
    JSON.stringify(whatDayIsItToday())
  );
  return whatDayIsItToday();
};

const getLastInfo = () => {
  const last = JSON.parse(
    localStorage.getItem("fullDateForStockReportHandling")
  );
  return last;
};

const outputInfo = (correctDate) => {
  document.querySelector(
    ".last-info"
  ).textContent = `Последняя загрузка актуальных названий салонов производилась ${correctDate}.`;
};

outputInfo(getLastInfo());

const comma2Dot = (num) => {
  const str = num + "";
  let result;
  if (str.includes(",")) {
    result = str.replace(/,/, ".");
    return +result;
  }
  return num;
};

//handle stock reports data making an object for each shop
const getShopData = (rows, col) => {
  const name = checkShopName(rows[1][col]).replace("  ", " ");
  const region = rows[49][col];
  const status = rows[50][col];
  const consumption = {};
  const leftover = {};
  const forecast = {};
  forecast.poster = rows[34][col];
  let consumptionIndex = 2;
  let leftoverIndex = 18;
  let forecastIndex = 35;
  const arr = Array.from(materials);
  [arr[12], arr[13]] = [arr[13], arr[12]]; //зажимы и палочки меняем местами, чтобы соответствовать порядку сдаваемого отчета
  arr.forEach((material) => {
    consumption[material] = rows[consumptionIndex][col];
    leftover[material] = rows[leftoverIndex][col];
    forecast[material] = rows[forecastIndex][col];
    consumptionIndex += 1;
    leftoverIndex += 1;
    forecastIndex += 1;
  });
  return { name, region, status, consumption, leftover, forecast };
};

//getting an array of presents
document.querySelector("#presents").onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let rows = this.result
      .split(`\n`)
      .map((el) => el.split(";"))
      .filter((el) => !el.includes(""));
    // adding cols in table
    const checkedboxes = Array.from(document.querySelectorAll(".checkbox"))
      .filter((el) => el.checked)
      .map((el) => (el = el.value));
    console.log(checkedboxes);
    if (checkedboxes.includes("male") || checkedboxes.includes("female")) {
      materials.push("presents");
      console.log(materials);
      tableHeader += `;ВЗР`;
    }
    console.log(tableHeader);
    if (checkedboxes.includes("children")) {
      materials.push("children");
      tableHeader += `;ДЕТ`;
    }
    if (checkedboxes.includes("newspapers")) {
      materials.push("newspapers");
      tableHeader += `;Газета`;
    }
    // console.log(presents)
    presents.forEach((obj) => {
      rows.forEach((arr) => {
        const sex = arr[6][0] === "М" ? "male" : "female";
        if (obj.name === arr[3].split("  ").join(" ").split('"').join("")) {
          obj.newspapers += 2;
          sex === "male" ? (obj.male += 1) : (obj.female += 1);
          obj.children += +arr[5];
        }
      });
      // console.log(obj);
    });
  };
  reader.readAsText(file, "windows-1251");
};

//getting an array of objects with stock reports data
document.querySelector("#commonReport").onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let rows = this.result.split("\n").map((el) => el.split(";"));
    rows[1].forEach((row, i) => {
      handleReports.push(getShopData(rows, i));
    });
    shopsReports = handleReports.filter((el) => el.name.includes("_"));
    //sorting according to shops array:
    const sortedShopReports = [];
    shops.forEach((shop) => {
      shopsReports.forEach((report) => {
        if (report.name === shop && !stopList.includes(report.name))
          sortedShopReports.push(report);
      });
    });

    sortedShopReports.forEach((report) => {
      presents.forEach((gift) => {
        if (report.name === gift.name) {
          const obj = Object.assign(report, gift);
        }
      });
    });

    reportsMoscow = sortedShopReports.filter((el) => el.region === "Moscow");
    reportsRegion = sortedShopReports.filter((el) => el.region !== "Moscow");
    reportsMoscow.forEach((report, i) => calcShipment(report, i));
    reportsRegion.forEach((report, i) => calcShipment(report, i));
    //going to add to these loops call of a function fo table draw
    tableDraw();
  };
  reader.readAsText(file, "windows-1251");
};

const choco5Helper = (obj) => {
  let foreChoco5 = comma2Dot(obj.forecast.choco5);
  let consChoco5 = comma2Dot(obj.consumption.choco5);
  if (+foreChoco5 < 10) foreChoco5 *= 250;
  if (+consChoco5 < 10) foreChoco5 *= 250;
  if (foreChoco5 % 250) {
    foreChoco5 = Math.floor(foreChoco5 / 250 < 1 ? 1 : foreChoco5 / 250) * 250;
  }
  if (consChoco5 % 250) {
    consChoco5 = Math.floor(consChoco5 / 250 < 1 ? 1 : consChoco5 / 250) * 250;
  }
  return Math.min(consChoco5, foreChoco5);
};

const candyHelper = (obj) => {
  let divider;
  obj.forecast.candy = Math.ceil(obj.forecast.candy);
  if (obj.forecast.candy > 1) {
    switch (obj.forecast.candy.toString().length) {
      case 2:
        divider = 10;
        break;
      case 3:
        divider = 1000;
        break;
      case 4:
        divider = 1000;
        break;
      default:
        divider = 1;
    }
  } else {
    return obj.forecast.candy.toString().replace(".", ",");
  }
  let candy = obj.forecast.candy / divider;
  const cons = obj.consumption.candy;
  return candy - cons >= 3
    ? candy.toString().replace(".", ",")
    : candy.toString().replace(".", ",");
};

const getLeaflets = (leaflet) => {
  leaflet = +leaflet.toString().replace(",", ".");
  return leaflet === 0 ? 0 : leaflet < 100 ? 100 : leaflet;
};

//calc of material shipment
const calcShipment = (obj) => {
  if (obj.status === "top") {
    const poster = obj.forecast.poster;
    const vip = obj.leftover.vip < 20 ? 20 - obj.leftover.vip : 0;
    const vipPack = obj.leftover.vipPack < 20 ? 20 - obj.leftover.vipPack : 0;
    const cup = obj.forecast.cup;
    const cupPack = obj.forecast.cupPack;
    const vine =
      obj.forecast.vine % 6
        ? Math.ceil(obj.forecast.vine / 6) * 6
        : obj.forecast.vine;
    const chocoSet = obj.forecast.chocoSet;
    const chest = obj.forecast.chest;
    const choco5 =
      obj.forecast.choco5 < 10
        ? (obj.forecast.choco5 *= 250)
        : obj.forecast.choco5 % 250
        ? Math.ceil(obj.forecast.choco5 / 250) * 250
        : obj.forecast.choco5;
    const candy = candyHelper(obj);
    const leaflet = getLeaflets(obj.forecast.leaflet);
    const green = obj.forecast.green;
    const gray = obj.forecast.gray;
    const clamp = obj.forecast.clamp;
    const stick = obj.forecast.stick;
    //getting an object with final data and add it to an appropriate array
    const dataForCalc = {};
    dataForCalc.region = obj.region;
    dataForCalc.poster = poster;
    dataForCalc.name = obj.name;
    dataForCalc.vip = vip;
    dataForCalc.vipPack = vipPack;
    dataForCalc.cup = cup;
    dataForCalc.cupPack = cupPack;
    dataForCalc.vine = vine;
    dataForCalc.chocoSet = chocoSet;
    dataForCalc.chest = chest;
    dataForCalc.choco5 = choco5;
    dataForCalc.candy = candy;
    dataForCalc.leaflet = leaflet;
    dataForCalc.green = green;
    dataForCalc.gray = gray;
    dataForCalc.clamp = clamp;
    dataForCalc.stick = stick;
    dataForCalc.presents = 0;
    if (checked !== undefined) {
      checked.includes("male") ? (dataForCalc.presents += obj.male) : null;
      checked.includes("female") ? (dataForCalc.presents += obj.female) : null;
    }
    dataForCalc.children = obj.children;
    dataForCalc.newspapers = obj.newspapers;
    //
    obj.region === "Moscow"
      ? shopsMoscowForCalc.push(dataForCalc)
      : shopsRegionForCalc.push(dataForCalc);
    // const result = `${obj.name};${poster};${vip};${vipPack};${cup};${cupPack};${vine};${chocoSet};${chest};${choco5};${candy};${leaflet};${green};${gray};${clamp};${stick}`;
    const result = `${obj.name};${createSumsString(dataForCalc)}`;
    return obj.region === "Moscow"
      ? shopsMoscow.push(result)
      : shopsRegion.push(result);
  } else {
    const poster = obj.forecast.poster;
    const vip = obj.leftover.vip > 9 ? 0 : 10 - obj.leftover.vip;
    const vipPack = obj.leftover.vipPack > 9 ? 0 : 10 - obj.leftover.vipPack;
    const cup =
      obj.forecast.cup - obj.consumption.cup < 0
        ? obj.forecast.cup
        : obj.leftover.cup - obj.forecast.cup < 20
        ? obj.forecast.cup
        : 0;
    const cupPack =
      obj.forecast.cupPack - obj.consumption.cucupPackp < 0
        ? obj.forecast.cupPack
        : obj.leftover.cupPack - obj.forecast.cupPack < 20
        ? obj.forecast.cupPack
        : 0;
    const vine =
      obj.consumption.vine - obj.forecast.vine < 0
        ? Math.ceil(obj.consumption.vine / 6) * 6 === 0
          ? 6
          : Math.ceil(obj.consumption.vine / 6) * 6
        : Math.floor(obj.forecast.vine / 6) * 6;
    const chocoSet =
      obj.forecast.chocoSet - obj.consumption.chocoSet > 0
        ? obj.consumption.chocoSet
        : obj.forecast.chocoSet;
    const chest = obj.forecast.chest > 30 ? 30 : obj.forecast.chest;
    const choco5 = choco5Helper(obj);
    const candy = candyHelper(obj);
    const leaflet = getLeaflets(obj.forecast.leaflet);
    const green = obj.leftover.green >= 40 ? 0 : obj.forecast.green;
    const gray = obj.leftover.gray >= 40 ? 0 : obj.forecast.gray;
    const clamp = obj.leftover.clamp >= 80 ? 0 : obj.forecast.clamp;
    const stick = obj.leftover.stick >= 80 ? 0 : obj.forecast.stick;
    //getting an object with final data and add it to an appropriate array
    const dataForCalc = {};
    dataForCalc.region = obj.region;
    dataForCalc.poster = poster;
    dataForCalc.name = obj.name;
    dataForCalc.vip = vip;
    dataForCalc.vipPack = vipPack;
    dataForCalc.cup = cup;
    dataForCalc.cupPack = cupPack;
    dataForCalc.vine = vine;
    dataForCalc.chocoSet = chocoSet;
    dataForCalc.chest = chest;
    dataForCalc.choco5 = choco5;
    dataForCalc.candy = candy;
    dataForCalc.leaflet = leaflet;
    dataForCalc.green = green;
    dataForCalc.gray = gray;
    dataForCalc.clamp = clamp;
    dataForCalc.stick = stick;
    dataForCalc.presents = 0;
    if (checked !== undefined) {
      checked.includes("male") ? (dataForCalc.presents += obj.male) : null;
      checked.includes("female") ? (dataForCalc.presents += obj.female) : null;
    }
    dataForCalc.children = obj.children;
    dataForCalc.newspapers = obj.newspapers;
    obj.region === "Moscow"
      ? shopsMoscowForCalc.push(dataForCalc)
      : shopsRegionForCalc.push(dataForCalc);
    //
    const result = `${obj.name};${createSumsString(dataForCalc)}`;
    return obj.region === "Moscow"
      ? shopsMoscow.push(result)
      : shopsRegion.push(result);
  }
};

const total = (arr) => {
  const summs = {};
  materials.push("poster");
  materials.forEach((mat) => (summs[mat] = 0));
  arr.forEach((shop) => {
    for (material in summs) {
      summs[material] += +shop[material].toString().replace(",", ".");
    }
  });
  for (elem in summs) {
    tT[elem] === undefined
      ? (tT[elem] = summs[elem])
      : (tT[elem] += summs[elem]);
  }
  return `;ИТОГО;${createSumsString(summs)}`;
};

document.getElementById("download").onclick = function () {
  let csv = tableHeader;
  csv += `\n`;
  shopsMoscow.forEach((shop, i) => {
    csv += `${+i + 1};`;
    csv += shop;
    csv += `\n`;
  });
  //SUMMARY MOSCOW
  csv += total(shopsMoscowForCalc);
  csv += `\n`;
  //
  shopsRegion.forEach((shop, i) => {
    csv += `${+i + 1};`;
    csv += shop;
    csv += `\n`;
  });
  //SUMMARY REGION
  csv += total(shopsRegionForCalc);
  csv += `\n`;
  //TOTAL OUTPUT
  csv += `;ИТОГО ВСЕГО;${createSumsString(tT)}`;
  csv += `\n`;
  var hiddenElement = document.createElement("a");
  hiddenElement.href =
    "data:text/csv;charset=utf-8," + encodeURI("\uFEFF" + csv);
  hiddenElement.target = "_blank";
  hiddenElement.download = "Отгрузочная таблица.csv";
  hiddenElement.click();
};

const tablePrint = () => {
  window.print();
};
