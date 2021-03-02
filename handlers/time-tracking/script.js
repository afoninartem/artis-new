const timesheets = {};
const senesys = {};
const departments = [];
const csvTitle = [
  `№`,
  `ФИО`,
  `Отдел`,
  `Должность`,
  `Норма дней`,
  `Норма часов`,
  `всего отработано дней`,
  `всего отработано часов`,
  `из них удаленно в часах`,
  `из них отпуск оплачиваемый/ больничный`,
  `не рабочий`,
  `день	за свой счет`,
  `Командировка`,
  `Переработка`,
  `Простой`,
  `Компенсация`,
  `Дата увольнения`,
  `Примечание`,
];

// states of uploads
let timesheetsAreLoaded = false;
let senesysIsLoaded = false;

// counter for details
let numberOfTimesheets = 0;

//create details list
const showDepartments = () => {
  document.querySelector(".timesheets-ul").innerHTML = "";
  const set = [...new Set(departments)];
  set.forEach((el) => {
    const li = document.createElement("li");
    li.textContent = el;
    document.querySelector(".timesheets-ul").appendChild(li);
  });
};

//create errors list
const showErrors = () => {
  document.querySelector(".errors-ul").innerHTML = "";
};

const showDetails = () => {
  document.querySelector("details").style.display = "block";
};

const getDepartment = (str) => {
  const tmp = str
    .split("_")
    .join("")
    .split("Подразделение")
    .join("")
    .split(":")
    .join("")
    .trim();
  const first = tmp[0];
  if (first === undefined) {
    return "Не заполнено!";
  }
  let other = tmp.split("");
  other.shift();
  other = other.join("");
  return `${first.toUpperCase()}${other.toLowerCase()}`;
};

const isName = (str) => {
  let result = true;
  if (str.includes("(") || str.includes(")")) {
    const arr = str.split(" ");
    arr.forEach((el) => {
      el = el.trim();
    });
    str = arr.filter((el) => !el.includes("(")).join(" ");
    str = str
      .split(" ")
      .filter((el) => el.length > 0)
      .join(" ");
  }
  if (str.trim()) {
    const arr = str.split(" ");
    const re = /^[А-Я][а-я]+/;
    // if (arr.length === 2 || arr.length === 3 || arr.length === 4) {
    if (arr.length >= 2 && arr.length <= 4) {
      arr.forEach((el) => {
        if (!re.test(el)) result = false;
      });
    } else {
      result = false;
    }
  } else {
    result = false;
  }
  return result;
};

const standartTime = (str) => {
  const time = str.split(",").join(":").split(".").join(":").split(":");
  if (time.length > 1) {
    if (+time[1] === 5) {
      time[1] = "30";
    } else {
      alert("некий табель содержит странное значение нормы часов");
    }
  } else {
    time.push("00");
  }
  return time.join(":");
};

const getOverJob = (normaTime, factTime) => {
  let norma = normaTime.split(":")[0] * 60;
  if (normaTime.split(":")[1]) norma += +normaTime.split(":")[1];
  let fact = factTime.split(":")[0] * 60;
  if (factTime.split(":")[1]) fact += +factTime.split(":")[1];
  const diff = fact - norma;
  const d = diff < 0 ? diff * -1 : diff;
  const hour = Math.floor(d / 60);
  const min = d % 60;
  const h = hour > 9 ? hour : "0" + hour;
  const m = min > 9 ? min : "0" + min;
  const result = diff > 0 ? `${h}:${m}` : ` -${h}:${m}`;
  return result;
};

document.querySelector(".result-btn").addEventListener("click", () => {
  if (senesysIsLoaded) {
    document.querySelector(".prev-block").style.display = "flex";
    const table = document.createElement("div");
    table.classList.add("preview-table");
    table.style.display = "grid";
    table.style.gridTemplateColumns = `repeat(${csvTitle.length}, max-content)`;
    csvTitle.forEach((elem) => {
      const element = document.createElement("div");
      element.classList.add("preview-table__title");
      element.classList.add("preview-table__cell");
      elem.split(" ").forEach((word) => {
        element.innerHTML += `<p>${word}</p>`;
        element.innerHTML += `\n`;
      });
      table.appendChild(element);
    });
    let num = 1;
    let errors = 0;
    for (emp in timesheets) {
      // timesheets[emp].name = correctName(timesheets[emp].name)
      if (senesys[timesheets[emp].name]) {
        // console.log(timesheets[emp]);
        timesheets[emp].time = senesys[timesheets[emp].name].time;
        let overjob = getOverJob(
          timesheets[emp].normHours,
          timesheets[emp].time
        );
        timesheets[emp].overjob = overjob;
      } else {
        errors += 1;
        document.querySelector(".timesheets-errors").style.display = "block";
        document.querySelector(
          ".errors-ul"
        ).innerHTML += `<li>${emp}, ${timesheets[emp].department} - нет в Senesys</li>`;
      }
      let str = `${num};${timesheets[emp].name};${timesheets[emp].department};${
        timesheets[emp].position ? timesheets[emp].position : "undefined"
      };${timesheets[emp].normDays};${timesheets[emp].normHours};;${
        timesheets[emp].time
      };;;;;;${timesheets[emp].overjob};;;;`;
      str.split(";").forEach((data) => {
        const cell = document.createElement("div");
        cell.classList.add("preview-table__cell");
        data === "undefined"
          ? ((cell.textContent = "нет данных"), cell.classList.add("red-cell"))
          : (cell.textContent = data);
        table.appendChild(cell);
      });
      num += 1;
    }
    document.querySelector(".err-quan").textContent = errors;
    document.querySelector(".download__preview").appendChild(table);
  }
});

document.querySelector(".download-btn").addEventListener("click", () => {
  if (senesysIsLoaded) {
    let csv = "";
    csvTitle.forEach((el, i) => {
      csv += el;
      if (i + 1 !== csvTitle.length) {
        csv += ";";
      }
    });
    csv += "\n";
    let num = 1;
    for (emp in timesheets) {
      if (senesys[timesheets[emp].name]) {
        timesheets[emp].time = senesys[timesheets[emp].name].time;
        let overjob = getOverJob(
          timesheets[emp].normHours,
          timesheets[emp].time
        );
        timesheets[emp].overjob = overjob;
      } else {
      }
      csv += `${num};${timesheets[emp].name};${timesheets[emp].department};${
        timesheets[emp].position ? timesheets[emp].position : "Нет данных"
      };${timesheets[emp].normDays};${timesheets[emp].normHours};;${
        timesheets[emp].time ? timesheets[emp].time : "нет данных"
      };;;;;;${
        timesheets[emp].overjob ? timesheets[emp].overjob : "нет данных"
      };;;;;`;
      csv += "\n";
      num += 1;
    }
    var hiddenElement = document.createElement("a");
    hiddenElement.href =
      "data:text/csv;charset=utf-8," + encodeURI("\uFEFF" + csv);
    hiddenElement.target = "_blank";
    hiddenElement.download = `Конец месяца.csv`;
    hiddenElement.click();
  }
});

const getIndexesOfTimesheet = (rawData, it = false) => {
  //indexes of cols
  let indexOfName = null;
  let indexOfPosition = null;
  let indexOfNormaDays = null;
  let indexOfNormaHours = null;
  //indexes of rows
  let indexOfNormaRow;
  let indexOfNameRow;
  //looking indexes of rows
  Array.from(rawData).forEach((row, i) => {
    if (row.includes("№ п/п") || row.includes("№   п/п")) {
      indexOfNameRow = i;
      if (row.includes("Должность")) indexOfPosition = i;
    }
    if (
      row.includes(
        ...[
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
          "12",
          "13",
          "14",
          "16",
        ]
      ) &&
      row[0] === ""
    )
      indexOfNormaRow = i;
  });

  if (it === true) {
    // IT days and hours
    Array.from(rawData[indexOfNormaRow]).forEach((el, i) => {
      if (el === "отработано за месяц, дней") indexOfNormaDays = i;
      if (el === "Итого отра-ботано за  месяц часов") indexOfNormaHours = i;
    });
    // IT name and position
    Array.from(rawData[indexOfNameRow]).forEach((el, i) => {
      if (el.includes("Фамилия" || el.includes("ФИО") || el.includes("Ф.И.О.")))
        indexOfName = i;
      if (el.toLowerCase() === "должность") indexOfPosition = i;
    });
  } else {
    // days and hours
    Array.from(rawData[indexOfNormaRow]).forEach((el, i) => {
      if (el === "дней") indexOfNormaDays = i;
      if (el === "часов") indexOfNormaHours = i;
    });
    // name and position
    Array.from(rawData[indexOfNameRow]).forEach((el, i) => {
      if (el.includes("Фамилия" || el.includes("ФИО") || el.includes("Ф.И.О.")))
        indexOfName = i;
      if (el.toLowerCase() === "должность") indexOfPosition = i;
    });
  }
  return {
    nameindex: indexOfName,
    positionIndex: indexOfPosition,
    normaDaysIndex: indexOfNormaDays,
    normaHoursIndex: indexOfNormaHours,
  };
};

const fileHandle = (file) => {
  numberOfTimesheets += 1;
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let rawTimesheets = this.result.split(`\n`).map((el) => el.split(`;`));
    if (rawTimesheets[0][0] === "ИТ") {
      const indexes = getIndexesOfTimesheet(rawTimesheets, true);
      departments.push("ИТ");
      for (elem in rawTimesheets) {
        const el = rawTimesheets[elem];
        if (el[1] !== undefined) {
          if (isName(el[1])) {
            timesheets[el[1]] = {
              name: el[indexes.nameindex],
              position: el[indexes.positionIndex],
              normDays: el[indexes.normaDaysIndex],
              normHours: Number.isInteger(+el[indexes.normaHoursIndex])
                ? el[indexes.normaHoursIndex]
                : standartTime(el[indexes.normaHoursIndex]),
              department: "ИТ",
            };
          }
        }
      }
    } else {
      const indexes = getIndexesOfTimesheet(rawTimesheets);
      departments.push(getDepartment(rawTimesheets[1][0]));
      for (elem in rawTimesheets) {
        const el = rawTimesheets[elem];
        if (el[1] !== undefined) {
          if (isName(el[1])) {
            timesheets[el[1]] = {
              name: el[indexes.nameindex],
              position: el[indexes.positionIndex],
              normDays: el[indexes.normaDaysIndex],
              normHours: Number.isInteger(+el[indexes.normaHoursIndex])
                ? el[indexes.normaHoursIndex]
                : standartTime(el[indexes.normaHoursIndex]),
              department: getDepartment(rawTimesheets[1][0]),
            };
          }
        }
      }
    }
  };
  reader.readAsText(file, `windows-1251`);
  document.querySelector(".ts-quan").textContent = numberOfTimesheets;
  timesheetsAreLoaded = true;
};

document.querySelector("#timesheet").onchange = function () {
  showDetails();
  for (file in this.files) {
    fileHandle(this.files[file]);
  }
};

document.querySelector(".senesys-btn").addEventListener("click", () => {
  if (timesheetsAreLoaded) {
    document.querySelector("#senesysLabel").click();
  } else {
    alert("Сначала загрузите табели");
  }
});

document.querySelector("#senesys").onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let rawSenesys = this.result.split(`\n`).map((el) => el.split(`;`));
    rawSenesys.pop();
    const filteredSenesys = rawSenesys.filter((el) => {
      return el[0] === "ПИН:" || el[5] === "Итого:";
    });
    for (let i = 0; i < filteredSenesys.length - 1; i += 2) {
      const name = filteredSenesys[i][4].split("  ").join(" ");
      const time = filteredSenesys[i + 1][7];
      senesys[name] = {
        name: name,
        time: time,
      };
    }
    //getting full name from senesys data
    for (emp in timesheets) {
      if (!senesys[timesheets[emp].name]) {
        const incorrectName = timesheets[emp].name.split(" ");
        for (f in senesys) {
          const fullName = f.toString().split("  ").join(" ").trim();
          if (fullName.includes(incorrectName[0])) {
            if (fullName.includes(incorrectName[1])) {
              timesheets[emp].name = fullName;
            }
          }
        }
      }
    }
    let empsQuantity = 0;
    for (s in senesys) {
      empsQuantity += 1;
      const li = document.createElement("li");
      li.textContent = `${senesys[s].name} - ${senesys[s].time}`;
      document.querySelector(".senesys-ul").appendChild(li);
    }
    document.querySelector(".senesys-quan").textContent = empsQuantity;
  };
  reader.readAsText(file, `windows-1251`);
  senesysIsLoaded = true;
  document.querySelector(".senesys-is-loaded").style.display = "block";
};

// help
const popup = document.querySelector(`.popup`);
popup.addEventListener('click', (event) => {
  if (event.target.classList.value === 'popup') toggleManual();
})

const toggleManual = (event) => {
  let visibility = window.getComputedStyle(popup);
  visibility.display === `none`
    ? (popup.style.display = `grid`)
    : (popup.style.display = `none`);
};


