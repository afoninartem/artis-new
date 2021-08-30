// firebase config
firebase.initializeApp({
  apiKey: "AIzaSyAEn0m8DZQHBSBMndRlxRtELv8K0vgpOGs",
  authDomain: "artis-helper.firebaseapp.com",
  projectId: "artis-helper",
  storageBucket: "artis-helper.appspot.com",
  messagingSenderId: "556205687381",
  appId: "1:556205687381:web:37f7b7490b8064a266cadc",
});

const db = firebase.firestore();

let primaryArray = [];
let objectsArr = [];
let fileWasUploaded = false;
let towels = false;
const tableHeaderWithoutTowels = [
  `№`,
  `Маш.`,
  `Салон`,
  `Кат. 80`,
  `Кат. 20`,
  `Блок.`,
  `Кружки`,
  `Упак.`,
  `Папки`,
  `Шамп.`,
  `Другое`,
  `Кол-во мест`,
  `Заявка`,
];

const tableHeaderWithTowels = [
  `№`,
  `Маш.`,
  `Салон`,
  `Кат. 80`,
  `Кат. 20`,
  `Блок.`,
  `Кружки`,
  `Упак.`,
  `Папки`,
  `Полот.`,
  `Шамп.`,
  `Другое`,
  `Кол-во мест`,
  `Заявка`,
];

let colors = [
  `#FA8072`,
  `#00FF00`,
  `#006400`,
  `#FF1493`,
  `#008080`,
  `#FF4500`,
  `#FF8C00`,
  `#FFFF00`,
  `#00BFFF`,
  `#800080`,
  `#0000FF`,
  `#8B4513`,
  `#808080`,
  `#00FFFF`,
  `#FF6347`,
  `#F0E68C`,
  `#DA70D6`,
  `#9370DB`,
  `#778899`,
  `#2F4F4F`,
  `#4682B4`,
  `#1E90FF`,
  `#000080`,
];

let darkColors = [
  `#000080`,
  `#800080`,
  `#0000FF`,
  `#2F4F4F`,
  `#8B4513`,
  `#006400`,
  `#F4500`,
];

const colorNN = `rgba(0, 128, 0, 0.4)`;
const colorSPB = `rgba(245, 161, 15, 0.4)`;

//test for colors
// colors.forEach(color => {
//   const plate = document.createElement(`div`);
//   plate.innerHTML = `<div>${color}</div><div>${color}</div>`
//   plate.style.background = color;
//   plate.classList.add(`test-color-class`);
//   plate.firstChild.classList.add(`test-color-title`);
//   plate.lastChild.classList.add(`test-color-text`);
//   if (darkColors.includes(color)) plate.style.color = `silver`;
//   document.querySelector(`.color-test`).appendChild(plate);
// });
//end of test

//download demo files
const download1C7Demo = () => {
  let result = "";
  let res;
  db.doc("shipment/1C7")
    .get()
    .then((doc) => {
      res = doc.data().csv;
      const res1 = res.split(`\n`).map((el) => el.split(`;`));
      //  console.log(res1)
      res1.forEach((arr) => {
        result += arr.join(";");
        result += "\n";
      });
      // console.log(result)
      var hiddenElement = document.createElement("a");
      hiddenElement.href =
        "data:text/csv;charset=utf-8," + encodeURI("\uFEFF" + result);
      hiddenElement.target = "_blank";
      hiddenElement.download = `Пример данных из 1С.csv`;
      hiddenElement.click();
    });
};

//popup help
const popup = document.querySelector(`.popup`);
popup.addEventListener('click', (event) => {
  if (event.target.classList.value === 'popup') toggleManual();
})

const toggleManual = () => {
  const popup = document.querySelector(`.popup`);
  let visibility = window.getComputedStyle(popup);
  visibility.display === `none`
    ? (popup.style.display = `grid`)
    : (popup.style.display = `none`);
};

const getWarningText = (mat, shop) => {
  let warnOrders = `<div class="warn-orders"></div>`;
  shop.orders.forEach((order) => {
    warnOrders += `<div class="warn-orders__item">${order.orderNum}</div>`;
  });
  const warn = document.querySelector(`.warn-text`);
  const warnRow = document.createElement(`div`);
  warnRow.classList.add(`warn-row`);
  warnRow.innerHTML = `<div><span class="warn-mat">${mat[0]} - ${mat[1]} - некорректное количество:</span> ${warnOrders}</div>`;
  warn.appendChild(warnRow);
  showWarning();
};

const showWarning = () => {
  document.querySelector(`.warning-popup`).style.display = `grid`;
};

const closeWarning = () => {
  document.querySelector(`.warning-popup`).style.display = `none`;
};

const isWarningMaterial = (mat, shop) => {
  if (mat[0].includes(`50х50мм`)) {
    if (mat[1] % 30) getWarningText(mat, shop);
  }
  if (mat[0].includes(`ДК `)) {
    //пробел специально, чтобы под условие не попадала строка "СКИДКА"
    if (+mat[1] !== 50) getWarningText(mat, shop);
  }
  if (mat[0] === `Шампанское`) {
    if (mat[1] % 6) getWarningText(mat, shop);
  }
  if (mat[0] === `Карамель`) {
    if (mat[1] > 5) getWarningText(mat, shop);
  }
  if (mat[0] === `Шоколадный набор`) {
    if (mat[1] > 40) getWarningText(mat, shop);
  }
  if (mat[0] === `Шоколад с логотипом 5 гр.`) {
    if (mat[1] % 250) getWarningText(mat, shop);
  }
};

const createTableParents = () => {
  const printArea = document.querySelector(`.print-area`);
  const page = document.createElement(`div`);
  page.classList.add(`page`);
  printArea.appendChild(page);
  const tableInfo = document.createElement(`div`);
  tableInfo.classList.add(`table-info`);
  page.appendChild(tableInfo);
  const table = document.createElement(`div`);
  table.classList.add(`table`);
  towels
    ? table.classList.add(`some-towels`)
    : table.classList.add(`no-towels`);
  page.appendChild(table);
};

const insertTableHeader = () => {
  let tables = document.querySelectorAll(`.table`);
  let table = tables[tables.length - 1];
  let reverseTableHeader;
  if (towels) {
    reverseTableHeader = Array.from(tableHeaderWithTowels);
  } else {
    reverseTableHeader = Array.from(tableHeaderWithoutTowels);
  }
  // let reverseTableHeader = Array.from(tableHeader);
  reverseTableHeader.reverse();
  reverseTableHeader.forEach((el) => {
    const cell = document.createElement(`div`);
    cell.classList.add("cell");
    cell.classList.add("table-header");
    cell.textContent = el;
    table.insertBefore(cell, table.firstChild);
  });
};

let ordersNum = 0;
let tableRowsNum = 0;
//quantity of orders and rows
const countRowsAndOrders = (arr) => {
  ordersNum = 0;
  tableRowsNum = 0;
  arr.forEach((obj) => {
    tableRowsNum += obj.shops.length;
    obj.shops.forEach((shop) => {
      ordersNum += shop.orders.length;
    });
  });
};
//

let shipmentTitle;

//add reclamations
const addReclamations = (arr, recRegion) => {
  arr.unshift({
    car: recRegion === `nn` ? `НН` : recRegion === `spb` ? `СПБ` : ``,
    shops: [
      {
        name:
          recRegion === `nn`
            ? `РЕКЛАМАЦИИ НН`
            : recRegion === `spb`
            ? `РЕКЛАМАЦИИ СПБ`
            : `РЕКЛАМАЦИИ СПБ И НН`,
        materials: [],
        orders: [],
        otherMats: [],
        samples: [],
      },
    ],
    shipment: recRegion,
    reclamationString: true,
  });
  // console.log(arr);
};

const novgorod = () => {
  shipmentTitle = `Нижний Новгород`;
  document.querySelector(`.print-area`).innerHTML = "";
  createTableParents();
  const nn = objectsArr.filter((obj) => obj.shipment === `nn`);
  addReclamations(nn, `nn`);
  countRowsAndOrders(nn);
  mainTable(nn);
};

const piter = () => {
  shipmentTitle = `Санкт-Петербург`;
  document.querySelector(`.print-area`).innerHTML = "";
  createTableParents();
  const spb = objectsArr.filter((obj) => obj.shipment === `spb`);
  addReclamations(spb, `spb`);
  countRowsAndOrders(spb);
  mainTable(spb);
};

const novgorodAndPiter = () => {
  shipmentTitle = `СПБ + НН`;
  document.querySelector(`.print-area`).innerHTML = "";
  createTableParents();
  const nn = objectsArr.filter((obj) => obj.shipment === `nn`);
  const spb = objectsArr.filter((obj) => obj.shipment === `spb`);
  addReclamations(spb, `spb`);
  addReclamations(nn, `nn`);
  countRowsAndOrders(spb.concat(nn));
  mainTable(spb.concat(nn));
};

const mainShipment = () => {
  shipmentTitle = `МСК + РЕГ, без НН и СПБ`;
  document.querySelector(`.print-area`).innerHTML = "";
  createTableParents();
  const shipment = objectsArr.filter((obj) => !obj.shipment);
  countRowsAndOrders(shipment);
  mainTable(shipment);
};

const mainTable = (currentArr) => {
  if (fileWasUploaded) {
    document.querySelector(`.table-block`).style.display = `flex`;
    //include towel or not
    currentArr.forEach((car) => {
      car.shops.forEach((shop) => {
        if (shop.towel) {
          // towels = true;
          // tableHeader.splice(10, 0, `Полот.`);
          document.querySelector(`.table`).classList.remove(`no-towels`);
          document.querySelector(`.table`).classList.add(`some-towels`);
        }
      });
    });

    let fullHeight = 68; //height of .table-info in px

    //add input color
    const addColorInput = (event) => {
      const target = event.target;
      const targetCar = target.firstChild.textContent;
      const allCars = document.querySelectorAll(`.car`);
      const colorArea = [];
      allCars.forEach((car) =>
        car.firstChild.textContent === targetCar ? colorArea.push(car) : null
      );
      const inputColor = document.createElement(`input`);
      inputColor.type = `color`;
      inputColor.classList.add(`input-color`);
      inputColor.value = target.dataset.backColor;
      inputColor.addEventListener(`input`, (event) => {
        const currentColor = event.target.value;
        colorArea.forEach((item) => {
          item.style.backgroundColor = currentColor;
        });
      });
      inputColor.click();
    };

    //info constructor
    const setInfo = () => {
      const date = new Date();
      const month =
        date.getMonth() + 1 > 9
          ? +date.getMonth() + 1
          : "0" + (date.getMonth() + 1);
      const today = `${
        date.getDate() > 9 ? date.getDate() : "0" + date.getDate()
      }.${month}.${date.getFullYear()}`;
      const tomorrow = `${
        date.getDate() + 1 > 9 ? date.getDate() + 1 : "0" + (date.getDate() + 1)
      }.${month}.${date.getFullYear()}`;
      const time = `${
        date.getHours() > 9 ? date.getHours() : "0" + date.getHours()
      }:${date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()}`;
      const tableInfos = document.querySelectorAll(`.table-info`);
      const tableInfo = tableInfos[tableInfos.length - 1];
      tableInfo.innerHTML = `<div><p>Дата отгрузки: ${tomorrow}</p> <p>Дата сборки: ${today}</p> <p>Начало работы: ${time}</p></div><div>${shipmentTitle}</div><div><p>Заявок: ${ordersNum}</p> <p>Строк: ${tableRowsNum}</p></div>`;
      return `<div><p>Дата отгрузки: ${tomorrow}</p> <p>Дата сборки: ${today}</p> <p>Начало работы: ${time}</p></div><div>${shipmentTitle}</div><div><p>Заявок: ${ordersNum}</p> <p>Строк: ${tableRowsNum}</p></div>`;
    };
    //
    table = document.querySelector(`.table`);
    let number = 0;
    currentArr.forEach((obj) => {
      obj.shops.forEach((shop) => {
        //table row number
        number += 1;
        const num = document.createElement(`div`);
        num.classList.add(`cell`);
        num.classList.add(`num`);
        num.textContent = number;
        table.appendChild(num);
        //car
        const car = document.createElement(`div`);
        car.classList.add(`cell`);
        car.classList.add(`car`);
        car.dataset.backColor = obj.carBackground;
        car.style.background = obj.carBackground;
        car.style.fontWeight = `bold`;
        car.addEventListener(`click`, addColorInput);
        car.style.color = obj.textColor;
        if (obj.noCarColor) car.style.color = obj.noCarColor;
        car.innerHTML = `<div>${obj.car}</div>`;
        table.appendChild(car);
        //shop name
        const name = document.createElement(`div`);
        name.classList.add(`cell`);
        name.classList.add(`name`);
        name.style.fontWeight = `bold`;
        name.style.background =
          obj.shipment === `nn`
            ? colorNN
            : obj.shipment === `spb`
            ? colorSPB
            : `transparent`;
        name.textContent = shop.name;
        table.appendChild(name);
        //materials
        //80
        const thick = document.createElement(`div`);
        thick.classList.add(`cell`);
        thick.classList.add(`thick`);
        thick.classList.add(`warehouse`);
        if (shop.thickCatalog) thick.innerHTML = shop.thickCatalog;
        table.appendChild(thick);
        //20
        const thin = document.createElement(`div`);
        thin.classList.add(`cell`);
        thin.classList.add(`thin`);
        thin.classList.add(`warehouse`);
        if (shop.thinCatalog) thin.innerHTML = shop.thinCatalog;
        table.appendChild(thin);
        //notebook
        const note = document.createElement(`div`);
        note.classList.add(`cell`);
        note.classList.add(`note`);
        note.classList.add(`warehouse`);
        if (shop.notebook) note.innerHTML = shop.notebook;
        table.appendChild(note);
        //cups
        const cup = document.createElement(`div`);
        cup.classList.add(`cell`);
        cup.classList.add(`cup`);
        cup.classList.add(`warehouse`);
        if (shop.cup) cup.innerHTML = shop.cup;
        table.appendChild(cup);
        //pack
        const pack = document.createElement(`div`);
        pack.classList.add(`cell`);
        pack.classList.add(`pack`);
        pack.classList.add(`warehouse`);
        if (shop.pack) pack.innerHTML = shop.pack;
        table.appendChild(pack);
        //folder
        const folder = document.createElement(`div`);
        folder.classList.add(`cell`);
        folder.classList.add(`folder`);
        folder.classList.add(`warehouse`);
        if (shop.folder) folder.innerHTML = shop.folder;
        table.appendChild(folder);
        //towel
        if (towels) {
          const towel = document.createElement(`div`);
          towel.classList.add(`cell`);
          towel.classList.add(`towel`);
          towel.classList.add(`warehouse`);
          shop.towel ? (towel.innerHTML = shop.towel) : null;
          table.appendChild(towel);
        }
        //vine
        const vine = document.createElement(`div`);
        vine.classList.add(`cell`);
        vine.classList.add(`vine`);
        vine.classList.add(`warehouse`);
        if (shop.vine) vine.innerHTML = shop.vine;
        table.appendChild(vine);
        //other
        const other = document.createElement(`div`);
        other.classList.add(`cell`);
        other.classList.add(`other`);
        shop.otherMats.forEach((mat) => {
          if (
            mat[0].includes(`бои`) || //Обои и Фотообои
            mat[0].includes(`Комус`) ||
            mat[0].includes(`сетка`) ||
            mat[0].includes(`Бумага`) ||
            mat[0].includes(`Декор`) ||
            mat[0].includes(`браз`) ||
            mat[0].includes(`доска`) ||
            mat[0].includes(`Коврик`)
          ) {
            other.innerHTML += `<div class="underline"><span>${mat[0]} - ${mat[1]}</span></div`;
          } else {
            other.innerHTML += `<div>${mat[0]} - ${mat[1]}</div`;
          }
        });
        shop.samples.length > 0
          ? (other.innerHTML += `<div class="sample">ОБРАЗЦЫ!</div>`)
          : null;
        table.appendChild(other);
        //number of boxes
        const boxes = document.createElement(`div`);
        boxes.classList.add(`cell`);
        boxes.classList.add(`boxes`);
        boxes.textContent = ``;
        table.appendChild(boxes);
        //orders
        const orders = document.createElement(`div`);
        orders.classList.add(`cell`);
        orders.classList.add(`orders`);
        shop.orders.forEach((order) => {
          order.orderComm.join().includes(`213`)
            ? (orders.innerHTML += ` <div class="room-is-done">${order.orderNum}</div>`)
            : (orders.innerHTML += ` <div>${order.orderNum}</div>`);
          order.orderComm.forEach((comm) => {
            if (comm.includes("АФОНИН")) {
              comm = comm.split(";").join("");
              other.innerHTML += `<div style="color: red">${comm}</div>`;
            }
          });
        });
        table.appendChild(orders);
        if (obj.reclamationString) {
          const stringLength = towels ? -14 : -13;
          const reclString = Array.from(table.children).slice(stringLength);
          reclString.forEach((el) => {
            el.style.background =
              obj.shipment === `nn`
                ? colorNN
                : obj.shipment === `spb`
                ? colorSPB
                : `transparent`;
          });
        }
        //counting height
        const ordersList = document.querySelectorAll(`.orders`);
        const lastOrders = ordersList[ordersList.length - 1];
        const elemHeight = lastOrders.offsetHeight;
        let possibleHeight = fullHeight + elemHeight;
        //another calculation of height
        const totalPages = document.querySelectorAll(`.page`);
        if (possibleHeight >= 1000) {
          const page = document.createElement(`div`);
          page.classList.add(`page`);
          // page.appendChild(tableInfoTemplate);
          const info = document.createElement(`div`);
          info.classList.add(`table-info`);
          setInfo();
          page.insertBefore(info, page.firstChild);
          table = document.createElement(`div`);
          table.classList.add(`table`);
          towels
            ? table.classList.add(`some-towels`)
            : table.classList.add(`no-towels`);
          insertTableHeader();
          page.appendChild(table);
          document.querySelector(`.print-area`).appendChild(page);
          fullHeight = 68;
          fullHeight += elemHeight;
        } else {
          fullHeight += elemHeight;
        }
        //
      });
    });
    //check last page
    const pages = document.querySelectorAll(`.page`);
    const lastPage = pages[pages.length - 1];
    lastPage.firstChild.innerHTML === ""
      ? (lastPage.firstChild.innerHTML = setInfo())
      : null;
    lastPage.lastChild.innerHTML === ""
      ? (lastPage.style.display = `none`)
      : addInfoAndHeader(lastPage);
  } else alert(`Выбери файл!`);
};

const addInfoAndHeader = (page) => {
  page.firstChild.innerHTML = document.querySelector(`.table-info`).innerHTML;
  insertTableHeader();
};

//short naming
const cutName = (mat) => {
  let matName = mat[0];
  let result;
  if (matName.includes(`с логотипом`))
    matName = matName.split(`с логотипом`).join("").split("  ").join(" ").trim();
  if (matName.includes(`Календарь`)) {
    matName = matName.split(`Календарь`).join("").split("  ").join(" ").trim();
    const first = matName[0]
    let other = matName.split("");
    other.shift();
    other = other.join("");
    matName = `${first.toUpperCase()}${other.toLowerCase()}`;
  }
  switch (matName) {
    case `%Укомплектованный заказ Комус для ФС`:
      result = `Комус`;
      break;
    case `Ценник круглый ДАННЫЙ ОБРАЗЕЦ ПРОДАЕТСЯ СО СКИДКОЙ`:
      result = `Ценник круглый ОБРАЗЕЦ`;
      break;
    case `Насос ручной двухходовой для шариков`:
      result = `Насос для шариков`;
      break;
    case `Набор декора для ФС`:
      result = `Декор`;
      break;
    case `Упаковка бумаги А4 для принтера (1 упак = 500 листов)`:
      result = `Бумага А4`;
      break;
    case `Чековая лента из термобумаги ProMega 57 мм`:
      result = `Чек. лента 57мм`;
      break;
    case `Пакет ПВД А3 (40*50) универсальный`:
      result = `Пакет ПВД А3 (40*50)`;
      break;
    case `Пакет ПВД А4 (30*40) универсальный`:
      result = `Пакет ПВД А4 (30*40)`;
      break;
    case `Салфетка для стекла Традиционная - Smart, 40х50 см`:
      result = `Белый Кот`;
      break;
    case `Перчатки нейлоновые черные размер М`:
      result = `Перчатки`;
      break;
    case `Маска текстильная многоразовая черная`:
      result = `Маска`;
      break;
    case `Пакет фирменный (картонный)`:
      result = `Пакет картонный`;
      break;
    default:
      result = matName;
      break;
  }
  return [result, mat[1]];
};

//no car style
const noCar = (obj) => {
  obj.noCarColor = `red`;
  return `Не указана`;
};

const forTheGlory = () => {
  const img = document.querySelector(".img-block");
  img.style.display = "block";
  const hideKumamon = (element) => {
    element.style.display = "none";
  };
  setTimeout(() => {
    hideKumamon(img), 300;
  });
};

//upload file
document.getElementById("file").onchange = function () {
  forTheGlory();
  objectsArr = [];
  fileWasUploaded = true;
  const carIndexes = [];
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    // write document to firestore
    // db.doc("shipment/1C7").set({
    //   name: "1C7",
    //   csv: this.result,
    // });
    let primary = this.result.split("\n");
    primaryArray = Array.from(primary);
    primary.forEach((el, i) => {
      if (
        el.includes(`Hyundai`) ||
        el.includes(`Mercedes`) ||
        el.includes(`Isuzu`) ||
        el.includes(`Наемная машина`) ||
        el.split(";")[0] === " " ||
        el.includes(`Газель`) ||
        el.includes(`СмирновИП`)
      )
        carIndexes.push(i);
    });
    const cars = [];
    for (let i = 0; i < carIndexes.length; i += 1) {
      const temp = primary.slice(carIndexes[i], carIndexes[i + 1]);
      cars.push(temp);
    }
    cars[cars.length - 1].pop();
    cars.forEach((arr) => {
      const obj = {};
      obj.car = arr[0].match(/\d+/g)
        ? arr[0].match(/\d+/g)[0]
        : arr[0].length === 3
        ? noCar(obj)
        : arr[0].includes(`СмирновИП`)
        ? arr[0].includes(`Нижний`)
          ? `Н.Н.`
          : arr[0].split(";")[0]
        : `Н.М.`;
      obj.textColor = `black`;
      obj.shops = [];
      let shopIndexes = [];
      arr.forEach((str, i) => {
        if (str.includes(`_`)) shopIndexes.push(i);
      });
      const shops = [];
      for (let i = 0; i < shopIndexes.length; i += 1) {
        const temp = arr.slice(shopIndexes[i], shopIndexes[i + 1]);
        shops.push(temp);
      }

      const isReclamation = (str) => {
        return str.includes(`Рекламация`);
      };

      const isMaterial = (str) => {
        return /.+;\d+/g.test(str);
      };

      const isComment = (str) => {
        return !isReclamation(str) && !isMaterial(str);
      };
      shops.forEach((shop) => {
        const sub = {};
        sub.name = shop[0].split(`;`).join("").split(`_`)[1];
        shop.shift();
        const orders = [];
        const materials = [];
        shop.forEach((str, i) => {
          str = str.split('"').join("");
          if (isReclamation(str))
            orders.push({ orderNum: str.split(" ")[1], orderComm: [] });
          if (isComment(str)) orders[orders.length - 1].orderComm.push(str);
          if (isMaterial(str)) materials.push(str.split(";"));
        });
        sub.orders = orders;
        sub.materials = materials;
        obj.shops.push(sub);
      });
      obj.shops.forEach((shop) => {
        if (
          shop.name.includes(`ижний`) ||
          shop.name.includes(`Чебоксары`) ||
          shop.name.includes(`(г. Владимир)`) ||
          shop.name.includes(`Порт Уют`) ||
          shop.name.includes(`НН`)
        ) {
          obj.shipment = `nn`;
        } else if (
          shop.name.includes(`Санкт`) ||
          shop.name.includes(`Колпино`) ||
          shop.name.includes(`Спб`)
        ) {
          obj.shipment = `spb`;
        }
        if (shop.name.includes(`Шатура`) && shop.name.includes(`Бибирево`))
          shop.name = `ТЦ Шатура (Пришвина)`;
      });
      obj.shops.forEach((shop) => {
        shop.otherMats = [];
        shop.samples = [];
        shop.materials.forEach((mat) => {
          isWarningMaterial(mat, shop);
          if (mat[0].includes(`Образец фас`) || mat[0].includes(`50х50`) || mat[0].includes(`бортик`)) {
            shop.samples.push(mat);
          } else if (mat[0].includes(`80 полос`)) {
            mat[0].includes(`(48 часов)`)
              ? (shop.thickCatalog = `<p>${mat[1]}</p><p>МСК</p>`)
              : (shop.thickCatalog = `<p>${mat[1]}</p><p>РЕГ</p>`);
          } else if (mat[0].includes(`20 полос`)) {
            mat[0].includes(`(48 часов)`)
              ? (shop.thinCatalog = `<p>${mat[1]}</p><p>МСК</p>`)
              : (shop.thinCatalog = `<p>${mat[1]}</p><p>РЕГ</p>`);
          } else if (mat[0].includes(`Блокнот`)) {
            shop.notebook = `<p>${mat[1]}</p>`;
          } else if (mat[0].includes(`Кружка с логотипом`)) {
            shop.cup = `<p>${mat[1]}</p>`;
          } else if (mat[0].includes(`Упаковка для кружки (мал.)`)) {
            shop.pack = `<p>${mat[1]}</p>`;
          } else if (mat[0].includes(`Папка картонная`)) {
            shop.folder = `<p>${mat[1]}</p>`;
          } else if (mat[0].includes(`Шампанское`)) {
            shop.vine = `<p>${mat[1]}</p>`;
          } else if (mat[0].includes(`Полотенце с логотипом в тубусе`)) {
            towels = true;
            shop.towel = `<p>${mat[1]}</p>`;
          } else shop.otherMats.push(cutName(mat));
        });
      });
      objectsArr.push(obj);
    });
    objectsArr.forEach((obj) => {
      if (obj.shops.length > 1) {
        let randomColorIndex = Math.floor(Math.random() * colors.length);
        obj.carBackground = colors[randomColorIndex];
        if (darkColors.includes(obj.carBackground)) obj.textColor = `silver`;
        colors.splice(randomColorIndex, 1);
      } else obj.carBackground = "white";
    });
    objectsArr.sort((a, b) => b.shops.length - a.shops.length);
  };
  reader.readAsText(file, "windows-1251");
};
