firebase.initializeApp({
  apiKey: "AIzaSyAEn0m8DZQHBSBMndRlxRtELv8K0vgpOGs",
  authDomain: "artis-helper.firebaseapp.com",
  projectId: "artis-helper",
  storageBucket: "artis-helper.appspot.com",
  messagingSenderId: "556205687381",
  appId: "1:556205687381:web:37f7b7490b8064a266cadc",
});

const db = firebase.firestore();

const generalObject = {};
// const timesheets = {};
const senesys = {};
const departments = [];
const csvTitle = [
  `№`,
  `ФИО`,
  `Должность`,
  `Отдел`,
  `итого часов`,
  `итого дней`,
  `отработано дней в ОФИСЕ`,
  `нерабочий день`,
  `работа на дому`,
  `отпуск`,
  `больничный`,
  `за свой счет`,
  `прогулы`,
  `простой`,
  `командировка`,
  `учеба`,
  `норма дней`,
  `норма часов`,
  `переработка по табелю`,
  `часы УРВ (без обедов)`,
  `переработка по УРВ`,
  `расхождение табель - УРВ`,
  `компенсация`,
  `дата увольнения`,
];

//parse googlesheet general timesheet
(function () {
  const app =
    "https://script.google.com/macros/s/AKfycbzB6EsAPfoBswAA2YPt1SDUFtcRRfdmTgD6Yh-g8o2lxrSkgBk6qgAmHZa8kpUnisM1/exec";
  const output = "";
  const xhr = new XMLHttpRequest();
  console.log(xhr)
  xhr.open("GET", app);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status == 200) {
      try {
        const obj = JSON.parse(xhr.responseText);
        let departmentsCounter = 1;
        for (o in obj) {
          numDept = `_${departmentsCounter}_${o}`;
          departmentsCounter += 1;
          generalObject[numDept] = obj[o];
        }
      } catch (e) {
        alert("Не удалось загрузить данные из общего табеля");
      }
    }
  };
  xhr.send();
})();

// states of uploads
let timesheetsAreLoaded = false;
let senesysIsLoaded = false;

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

const getTimeDiff = (normaTime, factTime, delta = false) => {
  let norma = normaTime.toString().split(":")[0] * 60;
  if (normaTime.toString().split(":")[1])
    norma += +normaTime.toString().split(":")[1];
  let fact = factTime.toString().split(":")[0] * 60;
  if (factTime.toString().split(":")[1])
    fact += +factTime.toString().split(":")[1];
  const diff = fact - norma;
  const d = diff < 0 ? diff * -1 : diff;
  const hour = Math.floor(d / 60);
  const min = d % 60;
  const h = hour > 9 ? hour : "0" + hour;
  const m = min > 9 ? min : "0" + min;
  let result;
  if (!delta) {
    result = diff > 0 ? `${h}:${m}` : ` -${h}:${m}`;
  } else {
    result = `${h}:${m}`;
  }
  return result;
};

const setToFirestore = () => {
  db.doc("timetrack/data").set({ datajson: JSON.stringify(generalObject) });
  //going to share JSON with google sheet
};

document.querySelector(".result-btn").addEventListener("click", () => {
  if (senesysIsLoaded) {
    setToFirestore();
    document.querySelector(".prev-block").style.display = "block";
    const table = document.createElement("table");
    table.classList.add("preview-table");
    // table.style.display = "grid";
    // table.style.gridTemplateColumns = `repeat(${csvTitle.length}, max-content)`;
    const tableBody = document.createElement("tbody");
    const tableHeaderRow = document.createElement("tr");
    csvTitle.forEach((elem) => {
      const element = document.createElement("td");
      element.classList.add("preview-table__title");
      element.classList.add("preview-table__cell");
      elem.split(" ").forEach((word) => {
        element.innerHTML += `<p>${word}</p>`;
        element.innerHTML += `\n`;
      });
      tableHeaderRow.appendChild(element);
    });
    tableBody.appendChild(tableHeaderRow);

    for (let d in generalObject) {
      const dept = generalObject[d];
      const deptRow = document.createElement("tr");
      deptRow.classList.add("preview-table__dept-row");
      // deptRow.textContent = d.split('_')[d.length - 1];
      const deptRowText = d.split("_");
      // deptRow.textContent = deptRowText.reverse()[0];
      const deptData = document.createElement("td");
      deptData.classList.add("preview-table__cell");
      deptData.textContent = deptRowText.reverse()[0];
      deptRow.appendChild(deptData);
      tableBody.appendChild(deptRow);
      dept.forEach((emp) => {
        const tableRow = document.createElement("tr");
        for (prop in emp) {
          const td = document.createElement("td");
          td.classList.add("preview-table__cell");
          td.textContent = emp[prop];
          tableRow.appendChild(td);
        }
        const compensation = document.createElement("td");
        compensation.classList.add("preview-table__cell");
        tableRow.appendChild(compensation);
        tableBody.appendChild(tableRow);
        const fireDate = document.createElement("td");
        fireDate.classList.add("preview-table__cell");
        tableRow.appendChild(fireDate);
        tableBody.appendChild(tableRow);
      });
    }
    table.appendChild(tableBody);
    document.querySelector(".download__preview").appendChild(table);
  }
});

document.querySelector(".download-btn").addEventListener("click", () => {
  if (senesysIsLoaded) {
    let csv = "";
    //title
    csvTitle.forEach((el, i) => {
      csv += el;
      if (i + 1 !== csvTitle.length) {
        csv += ";";
      }
    });
    csv += "\n";
    //table
    for (dept in generalObject) {
      const pureDept = dept.split("_");
      csv += `${pureDept[pureDept.length - 1]}\n`;
      generalObject[dept].forEach((emp) => {
        for (prop in emp) {
          csv += emp[prop];
          csv += `;`;
        }
        csv += `\n`;
      });
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
  let indexOfNormaDays = null;
  let indexOfNormaHours = null;
  let indexOfTotalHoursTS = null;
  let indexOfTotalDaysTS = null;
  let indexOfNonWorkingDaysTS = null;
  let indexOfHomeWorkDaysTS = null;
  let indexOfVacationDaysTS = null;
  let indexOfIllnessDaysTS = null;
  let indexOfOwnExpenseDaysTS = null;
  let indexOfOverjobTS = null;
  //indexes of rows
  let indexOfTitleRow;
  //looking indexes of rows
  Array.from(rawData).forEach((row, i) => {
    if (row.includes("№ п/п") || row.includes("№   п/п")) {
      indexOfTitleRow = i;
    }
  });

  if (it === true) {
    // IT days and hours
    Array.from(rawData[indexOfTitleRow + 1]).forEach((el, i) => {
      if (el === "отработано за месяц, дней") indexOfNormaDays = i;
      if (el === "Итого отра-ботано за  месяц часов") indexOfNormaHours = i;
    });
    // IT name and position
    Array.from(rawData[indexOfTitleRow]).forEach((el, i) => {
      if (el.includes("Фамилия" || el.includes("ФИО") || el.includes("Ф.И.О.")))
        indexOfName = i;
    });
  } else {
    //norma days and hours
    Array.from(rawData[indexOfTitleRow + 1]).forEach((el, i) => {
      if (el === "дней") indexOfNormaDays = i;
      if (el === "часов") indexOfNormaHours = i;
    });
    // name, totals
    Array.from(rawData[indexOfTitleRow]).forEach((el, i) => {
      if (el.includes("Фамилия" || el.includes("ФИО") || el.includes("Ф.И.О.")))
        indexOfName = i;
      if (el === "Итого отработано за месяц часов") indexOfTotalHoursTS = i;
      if (el === "отработано за месяц дней") indexOfTotalDaysTS = i;
      if (el === "нерабочие за месяц дней") indexOfNonWorkingDaysTS = i;
      if (el === "работа на дому за месяц дней") indexOfHomeWorkDaysTS = i;
      if (el === "отпуск") indexOfVacationDaysTS = i;
      if (el === "б/лист") indexOfIllnessDaysTS = i;
      if (el === "за свой счет") indexOfOwnExpenseDaysTS = i;
      if (el === "переработка за месяц часов") indexOfOverjobTS = i;
    });
  }
  return {
    nameIndex: indexOfName,
    normaDaysIndex: indexOfNormaDays,
    normaHoursIndex: indexOfNormaHours,
    totalHoursIndex: indexOfTotalHoursTS,
    totalDaysIndex: indexOfTotalDaysTS,
    nonWorkingDaysIndex: indexOfNonWorkingDaysTS,
    homeWorkIndex: indexOfHomeWorkDaysTS,
    vacationDaysIndex: indexOfVacationDaysTS,
    illnessDaysIndex: indexOfIllnessDaysTS,
    ownExpenseDaysIndex: indexOfOwnExpenseDaysTS,
    overjobIndex: indexOfOverjobTS,
  };
};

const fileHandle = (file) => {
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let rawTimesheets = this.result.split(`\n`).map((el) => el.split(`;`));
    if (rawTimesheets[0][0] === "ИТ") {
      const indexes = getIndexesOfTimesheet(rawTimesheets, true);
      console.log(indexes);
      for (elem in rawTimesheets) {
        const el = rawTimesheets[elem];
        if (el[1] !== undefined) {
          if (isName(el[1])) {
            generalObject[`_18_${rawTimesheets[0][0]}`].forEach((emp) => {
              //Алёна != Елена !!!! >:E
              if (el[1].includes("Растегаева")) {
                el[1] = "Растегаева Елена";
              }
              if (el[1] === emp._01_name) {
                emp._04_totalHoursTS = el[indexes.normaHoursIndex];
                emp._05_totalDaysTS = el[indexes.normaDaysIndex];
                emp._16_normaDaysTS = el[35];
                emp._18_overjobHoursTS = el[36];
              }
            });
          }
        }
      }
    } else {
      const indexes = getIndexesOfTimesheet(rawTimesheets);
      console.log(indexes);
      for (elem in rawTimesheets) {
        const el = rawTimesheets[elem];
        if (el[1] !== undefined) {
          if (isName(el[1])) {
            for (d in generalObject) {
              if (
                d.split("_").reverse()[0] === getDepartment(rawTimesheets[1][0])
              ) {
                generalObject[d].forEach((emp) => {
                  if (checkName(el[1], emp._01_name)) {
                    emp._16_normaDaysTS = el[indexes.normaDaysIndex];
                    emp._17_normaHoursTS = el[indexes.normaHoursIndex];
                    emp._04_totalHoursTS = el[indexes.totalHoursIndex];
                    emp._05_totalDaysTS = el[indexes.totalDaysIndex];
                    emp._07_nonWorkingDaysTS = el[indexes.nonWorkingDaysIndex];
                    emp._08_workFromHomeDaysTS = el[indexes.homeWorkIndex];
                    emp._09_vacationDaysTS = el[indexes.vacationDaysIndex];
                    emp._10_illnessDaysTS = el[indexes.illnessDaysIndex];
                    emp._11_ownExpenseDaysTS = el[indexes.ownExpenseDaysIndex];
                    emp._18_overjobHoursTS = el[indexes.overjobIndex];
                  }
                });
              }
            }
          }
        }
      }
    }
  };
  reader.readAsText(file, `windows-1251`);
  document.querySelector(".ts-quan").textContent = departments.length;
  timesheetsAreLoaded = true;
};

const checkName = (incName, trueName) => {
  if (incName.includes("(") || incName.includes(")")) {
    const arr = incName.split(" ");
    arr.forEach((el) => {
      el = el.trim();
    });
    incName = arr.filter((el) => !el.includes("(")).join(" ");
    incName = incName
      .split(" ")
      .filter((el) => el.length > 0)
      .join(" ");
  }
  return incName === trueName;
};

document.querySelector("#timesheet").onchange = function () {
  showDetails();
  for (file in this.files) {
    if (!departments.includes(this.files[file].name) && this.files[file].name) {
      departments.push(this.files[file].name);
    }
    fileHandle(this.files[file]);
  }
};

document.querySelector(".senesys-btn").addEventListener("click", () => {
  // if (timesheetsAreLoaded) {
  document.querySelector("#senesysLabel").click();
  // } else {
  //   alert("Сначала загрузите табели");
  // }
});

const isDate = (str) => {
  return /\d\d\.\d\d\.\d\d\d\d/.test(str);
};

document.querySelector("#senesys").onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let rawSenesys = this.result.split(`\n`).map((el) => el.split(`;`));
    rawSenesys.pop();
    let name, time, days, hardWorkingTime; //hardWorkingTime = full time except dinner breaks
    rawSenesys.forEach((row) => {
      if (row[0] === "ПИН:") {
        name = row[4];
        days = 0;
      }
      if (isDate(row[0]) && row[4].length > 1) days += 1;
      if (row[5] === "Итого:") {
        time = row[7];
        hardWorkingTime = getTimeDiff(days, time);
        // console.log(hardWorkingTime)
        senesys[name] = {
          name: name,
          time: time,
          days: days,
          hardWorkingTime: hardWorkingTime,
        };
      }
    });

    //add senesys data to generalObject
    //check full names
    for (d in generalObject) {
      const dept = generalObject[d];
      dept.forEach((emp) => {
        if (!senesys[emp._01_name]) {
          const incorrectName = emp._01_name.split(" ");
          for (f in senesys) {
            const fullName = f.toString().split("  ").join(" ").trim();
            if (
              fullName.includes(incorrectName[0]) &&
              fullName.includes(incorrectName[1])
            ) {
              emp._01_name = fullName;
            }
          }
        }
      });
    }

    //check emps without senesys marks
    let errors = 0;
    for (d in generalObject) {
      const dept = generalObject[d];
      dept.forEach((emp) => {
        if (!senesys[emp._01_name]) {
          errors += 1;
          document.querySelector(".timesheets-errors").style.display = "block";
          document.querySelector(".err-quan").textContent = errors;
          document.querySelector(
            ".errors-ul"
          ).innerHTML += `<li>${emp._01_name} - ${emp._03_department}</li>`;
        }
      });
    }

    //add senesys data in generalObject
    for (d in generalObject) {
      const dept = generalObject[d];
      dept.forEach((emp) => {
        if (senesys[emp._01_name]) {
          emp._19_hardWorkingHoursSenesys =
            senesys[emp._01_name].hardWorkingTime;
          emp._20_overJobHoursSenesys = getTimeDiff(
            emp._17_normaHoursTS,
            senesys[emp._01_name].hardWorkingTime
          );
          emp._21_dataDifference = getTimeDiff(
            emp._04_totalHoursTS,
            senesys[emp._01_name].hardWorkingTime,
            true
          );
        }
      });
    }

    //set senesys data in details block
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
popup.addEventListener("click", (event) => {
  if (event.target.classList.value === "popup") toggleManual();
});

const toggleManual = (event) => {
  let visibility = window.getComputedStyle(popup);
  visibility.display === `none`
    ? (popup.style.display = `grid`)
    : (popup.style.display = `none`);
};
