let artisDB = {};
let artisDBIsLoaded = false;
let fileIsLoaded = false;
let dinnersData;

const getIndexes = (arr) => {
  const indexes = {};
  arr.forEach((str) => {
    if (str === `Вход`) indexes.firstMark = arr.indexOf(str);
    if (str === `Выход`) indexes.secondMark = arr.indexOf(str);
    if (str === `ФИО`) indexes.name = arr.indexOf(str);
    if (str === `Компания`) indexes.company = arr.indexOf(str);
  });
  return indexes;
};

const structurateData = (obj) => {
  obj.imps = [];
  obj.marksList.forEach((mark) => {
    const imp = {
      name: mark[0].split("  ").join(" "),
      marks: [mark[1], mark[2]],
    };
    if (obj.imps.some((el) => el.name === imp.name)) {
      obj.imps.forEach((el) => {
        if (el.name === imp.name) el.marks.push(imp.marks);
      });
    } else {
      obj.imps.push(imp);
    }
  });
  obj.imps.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
};

const getDepts = (arr, obj) => {
  arr.forEach((el) => {
    if (obj.hasOwnProperty(el.name)) {
      el.dept = obj[el.name];
    } else {
      el.dept = "Уволенные и неопределённые";
    }
  });
};

const getTotalMarks = (obj) => {
  obj.gwd.total = 0;
  obj.gwd.imps.forEach((imp) => {
    imp.total = imp.marks.length;
    obj.gwd.total += imp.total;
  });

  obj.emulcom.total = 0;
  obj.emulcom.imps.forEach((imp) => {
    imp.total = imp.marks.length;
    obj.emulcom.total += imp.total;
  });

  obj.artis.total = 0;
  for (dept in obj.artis.departments) {
    const deptObj = obj.artis.departments[dept];
    deptObj.total = 0;
    deptObj.imps.forEach((imp) => {
      imp.total = imp.marks.length;
      deptObj.total += imp.total;
    });
    obj.artis.total += deptObj.total;
  }
};

const groupArtis = (obj) => {
  getDepts(obj.imps, artisDB);
  obj.departments = {};
  obj.imps.forEach((imp) => {
    if (obj.departments.hasOwnProperty(imp.dept)) {
      obj.departments[imp.dept].imps.push(imp);
    } else {
      obj.departments[imp.dept] = {
        name: imp.dept,
        imps: [imp],
      };
    }
  });
};

const createObject = (arr) => {
  const company = {
    artis: {
      name: "Артис",
      marksList: [],
    },
    gwd: {
      name: "Гуд Вуд",
      marksList: [],
    },
    emulcom: {
      name: "Эмульком",
      marksList: [],
    },
  };
  const index = getIndexes(arr[1]);
  arr.forEach((sub) => {
    sub[index.company] === `Арс Холдинг`
      ? company.artis.marksList.push([
          sub[index.name],
          sub[index.firstMark],
          sub[index.secondMark] ? sub[index.secondMark] : null,
        ])
      : sub[index.company] === `Артис-XXI век`
      ? company.artis.marksList.push([
          sub[index.name],
          sub[index.firstMark],
          sub[index.secondMark] ? sub[index.secondMark] : null,
        ])
      : sub[index.company] === `Гуд Вуд`
      ? company.gwd.marksList.push([
          sub[index.name],
          sub[index.firstMark],
          sub[index.secondMark] ? sub[index.secondMark] : null,
        ])
      : sub[index.company] === `Эмульсии`
      ? company.emulcom.marksList.push([
          sub[index.name],
          sub[index.firstMark],
          sub[index.secondMark] ? sub[index.secondMark] : null,
        ])
      : null;
  });
  for (firm in company) {
    structurateData(company[firm]);
    company[firm].imps.forEach((imp) => {
      imp.marks = imp.marks.flat().filter((el) => el !== null);
    });
  }
  dinnersData = company;
  groupArtis(dinnersData.artis);
  getTotalMarks(dinnersData);
};

//load dinners list
document.querySelector(`#dinnersList`).onchange = function () {
  if (artisDBIsLoaded) {
    let file = this.files[0];
    let reader = new FileReader();
    fileIsLoaded = true;
    reader.onload = function (progressEvent) {
      let rawDinners = this.result.split(`\n`).map((el) => el.split(`;`));
      createObject(rawDinners);
    };
    fileIsLoaded = true;
    reader.readAsText(file, `windows-1251`);
  } else {
    alert(`Загрузите данные из 1С`);
  }
};

//load database file
document.getElementById("dataBase").onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let primary = this.result.split(`\n`).map((el) => el.split(`;`));
    Array.from(primary).forEach((el) => {
      el[0] != ``
        ? (artisDB[
            el[0]
              .split(` `)
              .filter((el) => el != ``)
              .join(` `)
              .split("  ")
              .join(" ")
          ] = el[2])
        : null;
    });
    artisDBIsLoaded = true;
  };
  reader.readAsText(file, "windows-1251");
  // console.log(artisDB)
};

//Emulcom
const getEmul = () => {
  if (fileIsLoaded) {
    document.querySelector(".manual").style.display = `none`;
    outputData(dinnersData.emulcom);
  } else alert(`Загрузите данные из 1C и из Senesys`);
};

//GoodWood
const getGWD = () => {
  if (fileIsLoaded) {
    document.querySelector(".manual").style.display = `none`;
    outputData(dinnersData.gwd);
  } else alert(`Загрузите данные из 1C и из Senesys`);
};

//Artis
const getArtis = () => {
  if (fileIsLoaded) {
    document.querySelector(".manual").style.display = `none`;
    outputData(dinnersData.artis);
  } else alert(`Загрузите данные из 1C и из Senesys`);
};

const outputData = (obj) => {
  const output = document.querySelector(`.output`);
  output.innerHTML = ``;
  const companyTitle = document.createElement(`h1`);
  companyTitle.classList.add(`company-title`);
  companyTitle.innerHTML = `<div class="company-title__name">${obj.name}</div><div class="company-title__total">${obj.total}</div><button type="button" class="hbtn hb-border-bottom-br3 dnld">Скачать</button><button class="hbtn hb-border-bottom-br3 print-btn">Распечатать</button>`;
  output.appendChild(companyTitle);
  if (obj.name === "Артис") {
    document.querySelector(".dnld").classList.add("artis-dnld");
    document.querySelector(".print-btn").classList.add("artis-print");
    const groupList = document.createElement(`ul`);
    output.appendChild(groupList);
    groupList.classList.add(`artis-group-list`);
    for (d in obj.departments) {
      const dept = obj.departments[d];
      const li = document.createElement("li");
      groupList.appendChild(li);
      const details = document.createElement(`details`);
      li.appendChild(details);
      const summary = document.createElement(`summary`);
      summary.innerHTML = `<div>${dept.name}</div><div class="to-right-border">${dept.total}</div>`;
      details.appendChild(summary);
      const hiddenList = document.createElement(`ul`);
      details.appendChild(hiddenList);
      dept.imps.forEach((imp) => {
        const impLi = document.createElement(`li`);
        hiddenList.appendChild(impLi);
        const impDetails = document.createElement(`details`);
        impLi.appendChild(impDetails);
        const impSummary = document.createElement(`summary`);
        impDetails.appendChild(impSummary);
        const impHiddenList = document.createElement(`ul`);
        impHiddenList.classList.add(`mark-list`);
        impDetails.appendChild(impHiddenList);
        impSummary.innerHTML = `<div>${imp.name}</div><div class="to-right-border">${imp.total}</div>`;
        imp.marks.forEach((mark) => {
          impHiddenList.innerHTML += `<li class="mark-list__li"><div class="item-date">${mark}</div></li>`;
        });
      });
    }
    //download artis
    document
      .querySelector(`.artis-dnld`)
      .addEventListener(`click`, function () {
        let csv = `Компания;${obj.name};${obj.total}`;
        csv += `\n`;
        const depts = obj.departments;
        console.log(depts);
        for (d in obj.departments) {
          const dept = obj.departments[d];
          csv += `Подразделение;${dept.name};${dept.total}`;
          csv += `\n`;
          dept.imps.forEach((imp) => {
            csv += `Сотрудник;${imp.name};${imp.total}`;
            csv += `\n`;
          });
        }
        var hiddenElement = document.createElement("a");
        hiddenElement.href =
          "data:text/csv;charset=utf-8," + encodeURI("\uFEFF" + csv);
        hiddenElement.target = "_blank";
        hiddenElement.download = `${obj.name}.csv`;
        hiddenElement.click();
      });
      //print artis
      const addPageRow = (name, meals, title) => {
        const pageRow = document.createElement(`div`);
        pageRow.classList.add(`page__row`);
        const rowName = document.createElement(`div`);
        rowName.classList.add(`cell`);
        rowName.textContent = name;
        const rowMeals = document.createElement(`div`);
        rowMeals.classList.add(`cell`);
        rowMeals.textContent = meals;
        if (title) {
          rowName.classList.add(`title`);
          rowMeals.classList.add(`title`);
        }
        pageRow.appendChild(rowName);
        pageRow.appendChild(rowMeals);
        return pageRow;
      }
      document.querySelector(`.artis-print`).addEventListener(`click`, function () {
        const printBlock = document.querySelector(`.print`);
        let page = document.createElement(`div`);
        page.classList.add(`page`);
        printBlock.appendChild(page);
        let pageRows = 0;
        for (d in obj.departments) {
          const dept = obj.departments[d];
          const elem = addPageRow(dept.name, dept.total, true);
          page.appendChild(elem);
          pageRows += 1;
          if (pageRows === 45) {
            const newPage = document.createElement(`div`);
            newPage.classList.add(`page`);
            printBlock.appendChild(newPage);
            pageRows = 0;
            page = printBlock.lastChild;
          }
          dept.imps.forEach(imp => {
            const elem =  addPageRow(imp.name, imp.total, false);
            page.appendChild(elem);
            pageRows += 1;
            if (pageRows === 45) {
              const newPage = document.createElement(`div`);
              newPage.classList.add(`page`);
              printBlock.appendChild(newPage);
              pageRows = 0;
              page = printBlock.lastChild;
            }
          })
        }
        print();
      });
  } else {
    const employeeList = document.createElement(`ul`);
    employeeList.classList.add(`employee-list`);
    output.appendChild(employeeList);
    obj.imps.forEach((imp) => {
      const eaterLi = document.createElement(`li`);
      employeeList.appendChild(eaterLi);
      eaterLi.classList.add(`employee-list__li`);
      const individualList = document.createElement(`details`);
      individualList.classList.add(`indi-list`);
      eaterLi.appendChild(individualList);
      const eaterTitle = document.createElement(`summary`);
      eaterTitle.innerHTML = `<div class="eater">${imp.name}</div><div class="total to-right-border">${imp.total}</div>`;
      individualList.appendChild(eaterTitle);
      const markList = document.createElement(`ul`);
      markList.classList.add(`mark-list`);
      imp.marks.forEach((item) => {
        const li = document.createElement(`li`);
        li.classList.add(`mark-list__li`);
        li.innerHTML = `<div class="item-date">${item}</div>`;
        markList.appendChild(li);
      });
      individualList.appendChild(markList);
    });
        //download else
        document
        .querySelector(`.dnld`)
        .addEventListener(`click`, function () {
          let csv = `Компания;${obj.name};${obj.total}`;
          csv += `\n`;
          obj.imps.forEach((imp) => {
            csv += `Сотрудник;${imp.name};${imp.total}`;
            csv += `\n`;
          });
          var hiddenElement = document.createElement("a");
          hiddenElement.href =
            "data:text/csv;charset=utf-8," + encodeURI("\uFEFF" + csv);
          hiddenElement.target = "_blank";
          hiddenElement.download = `${obj.name}.csv`;
          hiddenElement.click();
        });
  }
};

//popup help
const toggleManual = () => {
  const popup = document.querySelector(`.popup`);
  let visibility = window.getComputedStyle(popup);
  visibility.display === `none`
    ? (popup.style.display = `grid`)
    : (popup.style.display = `none`);
};