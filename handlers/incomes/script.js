let mainTitle;
const shippers = [];
const details = [];

const isDate = (i, arr) => {
  return /\d\d\.\d\d\.\d\d\d\d/.test(arr[i][0]);
};

const isMaterial = (i, arr) => {
  return !isDate(i, arr) && isDate(i + 1, arr);
};

const isShipper = (i, arr) => {
  return !isMaterial(i, arr) && !isDate(i, arr);
};

//Анализ рекламной продукции по поступленям
document.querySelector("#file2").onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let rawData = this.result.split("\n").map((el) => el.split(";"));
    rawData.splice(0, 2);
    let material = {
      name: false,
      incomes: [],
      totalSum: 0,
    };
    rawData.forEach((row, i) => {
      if (!isDate(i, rawData)) {
        details.push(material);
        material = {
          name: row[0],
          incomes: [],
          totalSum: 0,
        };
      }
      if (isDate(i, rawData)) {
        if (!row[5].includes("ПРОЧИЕ")) {
          material.incomes.push({
            incTitle: row[1],
            incSum: Number(row[4]),
            incShipper: row[5],
          });
          material.totalSum += Number(row[4]);
        }
      }
    });
    shippers.forEach((ship) => {
      ship.materials.forEach((mat) => {
        details.forEach((detail) => {
          if (mat.name === detail.name) {
            mat.totalSum = detail.totalSum;
          }
        });
      });
    });
    // console.log(shippers);
  };
  reader.readAsText(file, `windows-1251`);
};

//Поступления и отгрузки рекламной продукции
document.querySelector("#file1").onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let rawData = this.result.split("\n").map((el) => el.split(";"));
    mainTitle = rawData[0][0].split(".").join("");
    rawData.splice(0, 3);
    let shipper = { materials: [] };
    for (let i = 0; i < rawData.length - 1; i += 1) {
      if (rawData[i][0] !== "Итого") {
        if (isShipper(i, rawData)) {
          shippers.push(shipper);
          shipper = { materials: [] };
          shipper.name = rawData[i][0].trim();
        }
        if (isMaterial(i, rawData)) {
          shipper.materials.push({
            name: rawData[i][0],
            total: Number(rawData[i][2].split(",").join(".")),
            incomes: [],
          });
        }
        if (isDate(i, rawData)) {
          shipper.materials[shipper.materials.length - 1].incomes.push({
            date: rawData[i][0],
            title: rawData[i][1],
            quantity: Number(rawData[i][2].split(",").join(".")),
          });
        }
      }
    }
  };
  reader.readAsText(file, `windows-1251`);
};

//Instructions
document.querySelector("#file3").onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    //preparing main data
    let rawData = this.result.split("\n").map((el) => el.split(";"));
    rawData.splice(0, 2);
    rawData.pop();
    //preparing new object
    const instShipper = { materials: [] };
    let instruction = {};
    rawData.forEach((row) => {
      const actRow = row.filter((el) => el.trim() != "");
      if (!instShipper.name) {
        if (actRow[5]) instShipper.name = actRow[5].trim();
      }
      if (!actRow[5]) {
        instruction.name = actRow[0];
        instruction.quantity = actRow[1];
        instruction.sum = actRow[2];
        instruction.price = (actRow[2] / actRow[1]).toFixed(2);
        instShipper.materials.push(instruction);
        instruction = {};
      }
    });
    console.log(instShipper);
    console.log(shippers);
    for (i in shippers) {
      if (shippers[i].name === instShipper.name) {
        shippers[i].materials.forEach((mat) => {
          instShipper.materials.forEach((inst) => {
            if (mat.name === inst.name && mat.total === +inst.quantity) {
              mat.totalSum = +inst.sum;
            }
          });
        });
      }
    }
    // console.log(instShipper);
    // console.log(shippers);
  };
  reader.readAsText(file, `windows-1251`);
};

document.querySelector(".result").onclick = function () {
  let csv = `${mainTitle}`;
  csv += `\n`;
  csv += `\n`;
  csv += `Строка;Наименование;Количество;Цена;Сумма`;
  csv += `\n`;
  const result = shippers
    .filter((el) => el.name)
    .filter((el) => !el.name.includes("ПРОЧИЕ"));
  console.log(result);
  let totalSum = 0;
  result.forEach((res) => {
    csv += `Поставщик;${res.name};;;;`;
    csv += `\n`;
    res.materials.forEach((mat) => {
      csv += `Материал;${mat.name};${mat.total};${(mat.totalSum / mat.total).toFixed(2)};${
        mat.totalSum
      }`;
      csv += `\n`;
      totalSum += mat.totalSum;
    });
  });
  csv += `ИТОГО:;;;;${totalSum}`;
  var hiddenElement = document.createElement("a");
  hiddenElement.href =
    "data:text/csv;charset=utf-8," + encodeURI("\uFEFF" + csv);
  hiddenElement.target = "_blank";
  hiddenElement.download = `${mainTitle}.csv`;
  hiddenElement.click();
};
