let fileName;
const komus = [];

document.querySelector(".download-1").addEventListener("click", () => {
  let csv = `Артикул;Наименование;Единица измерения;Цена`;
  csv += `\n`;
  komus.forEach((obj) => {
    csv += `${obj.articul};${obj.name};${obj.unit}; ${obj.price}`;
    csv += `\n`;
  });
  var hiddenElement = document.createElement("a");
  hiddenElement.href =
    "data:text/csv;charset=utf-8," + encodeURI("\uFEFF" + csv);
  hiddenElement.target = "_blank";
  hiddenElement.download = `${fileName} справочник.csv`;
  hiddenElement.click();
});

document.querySelector(".download-2").addEventListener("click", () => {
  let csv = `НДС;КОД ВЫГРУЗКИ;КОЛИЧЕСТВО;ЦЕНА С НДС;СУММА С НДС`;
  csv += `\n`;
  komus.forEach((obj) => {
    csv += `${obj.nds};${obj.code};${obj.quantity}; ${obj.price}; ${obj.sum}`;
    csv += `\n`;
  });
  var hiddenElement = document.createElement("a");
  hiddenElement.href =
    "data:text/csv;charset=utf-8," + encodeURI("\uFEFF" + csv);
  hiddenElement.target = "_blank";
  hiddenElement.download = `${fileName} поступление.csv`;
  hiddenElement.click();
});

const getFileName = (arr) => {
  const result = arr[0]
    .split("Грузополучатель")
    .join("")
    .split('"')
    .join("")
    .split("ООО")
    .join("");
  return result;
};

const getIndexes = (arr) => {
  const ind = {};
  const title = arr.filter((el) => el[0].includes("Артикул"));
  console.log(title)
  title.flat().forEach((el, i) => {
    console.log(el)
    if (el.includes("Артикул")) ind.articul = i;
    if (el.includes("Наименование товара")) ind.name = i;
    if (el.includes("Ед. изм.")) ind.unit = i;
    if (el.includes("Количество")) ind.quantity = i;
    if (el.includes("Цена с НДС РУБ")) ind.price = i;
    if (el.includes("% НДС")) ind.nds = i;
    if (el.includes("Сумма с НДС РУБ")) ind.sum = i;
  });
  console.log(ind)
  return ind;
};

document.querySelector(`#file`).onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let rawKomus = this.result.split(`\n`).map((el) => el.split(`;`));
    // console.log(rawKomus)
    const index = getIndexes(rawKomus);
    rawKomus.forEach((el) => {
      if (el[0].includes("Грузополучатель")) {
        fileName = getFileName(el);
      }
      if (!el[0].includes("Артикул")) {
        if (el[0].length >= 3 && el[0].length <= 8) {
          let sum = el[index.sum].split(",").join(".");
          let arr = sum.split("");
          let realSum = "";
          arr.forEach((s) => {
            const t = s.replace(/\s+/g, "").trim();
            realSum += t;
          });
          komus.push({
            nds: el[index.nds],
            articul: el[index.articul],
            code: `${el[index.articul]}.0ЕР`,
            quantity: el[index.quantity].split(",").join(""),
            sum: realSum,
            price: el[index.price],
            name: el[index.name],
            unit: el[index.unit],
          });
        }
      }
    });
  };
  reader.readAsText(file, `windows-1251`);
};
