const depts = {
  warehouse: ["Акции", "Комус", "Визитки", "Поступления", "Отгрузки"],
  maintenance: ["Обеды"],
  personal: ["УРВ"],
};

const dropDownMenu = document.createElement("ul");

document.querySelectorAll(".header__nav-btn").forEach((btn) => {
  if (dropDownMenu.innerHTML === "") {
    btn.addEventListener("click", () => {
      depts[btn.value].forEach((elem) => {
        const li = document.createElement("li");
        li.innerHTML = `<button type="button" class="drop-btn">${elem}</button>`;
        dropDownMenu.appendChild(li);
      });
    });
  } else {
    dropDownMenu.innerHTML = "";
  }
  document.querySelector('.header')
});
