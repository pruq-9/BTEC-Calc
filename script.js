const gradeValues = {
  D: 100,
  M: 80,
  P: 60,
};

const goalLabels = ["أ", "ب", "ج", "د"];
const firstSecondarySubjects = [
  { name: "أنظمة تكنولوجيا المعلومات", hours: 120 },
  { name: "تطوير المواقع الالكترونية", hours: 60 },
  { name: "تطوير تطبيقات الهاتف المحمول", hours: 60 },
  { name: "تطوير العاب الحاسوب", hours: 60 },
  { name: "الدعم الفني وادارة تكنولوجيا المعلومات", hours: 60 },
];
const secondSecondarySubjects = [
  { name: "الامن السيبراني وادارة الحوادث", hours: 120 },
  { name: "مقدمة في الذكاء الاصطناعي", hours: 90 },
  { name: "البرمجة", hours: 90 },
  { name: "ادارة مشاريع تكنولوجيا المعلومات", hours: 60 },
];
const subjectsList = document.querySelector("#subjects-list");
const subjectTemplate = document.querySelector("#subject-template");
const totalHoursElement = document.querySelector("#total-hours");
const averageScoreElement = document.querySelector("#average-score");
const totalScoreElement = document.querySelector("#total-score");
const countInputs = document.querySelectorAll('input[name="subject-count"]');
const themeToggle = document.querySelector("#theme-toggle");

function createSubjectRows(count) {
  subjectsList.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const row = subjectTemplate.content.firstElementChild.cloneNode(true);
    const nameInput = row.querySelector('input[name="subject-name"]');
    const hoursSelect = row.querySelector('select[name="subject-hours"]');
    const goalsCount = count === 4 && index === count - 1 ? 4 : 3;
    const fixedSubject =
      count === 5 ? firstSecondarySubjects[index] : secondSecondarySubjects[index];

    nameInput.placeholder = `المادة ${index + 1}`;
    nameInput.value = fixedSubject?.name || "";
    nameInput.readOnly = Boolean(fixedSubject);
    hoursSelect.value = fixedSubject?.hours || 60;
    hoursSelect.disabled = Boolean(fixedSubject);
    row.dataset.subjectNumber = index + 1;
    row.classList.toggle("fixed-subject", Boolean(fixedSubject));
    if (fixedSubject) {
      showFixedSubjectText(row, fixedSubject);
    }
    row.style.setProperty("--goal-count", goalsCount);
    row.classList.toggle("extra-goals-subject", goalsCount === 4);
    createGoalSelectors(row, goalsCount);
    subjectsList.append(row);
  }

  updateResults();
}

function showFixedSubjectText(row, subject) {
  const nameField = row.querySelector(".subject-name");
  const hoursField = row.querySelector('select[name="subject-hours"]').parentElement;
  const nameDisplay = document.createElement("p");
  const hoursDisplay = document.createElement("p");

  nameDisplay.className = "fixed-value fixed-subject-name";
  nameDisplay.textContent = subject.name;
  hoursDisplay.className = "fixed-value";
  hoursDisplay.textContent = `${subject.hours} ساعة`;

  nameField.append(nameDisplay);
  hoursField.append(hoursDisplay);
}

function createGoalSelectors(row, goalsCount) {
  const goalsContainer = row.querySelector("[data-learning-goals]");
  goalsContainer.innerHTML = "";

  for (let index = 0; index < goalsCount; index += 1) {
    const field = document.createElement("div");
    const label = document.createElement("label");
    const select = document.createElement("select");

    field.className = "goal-field";
    label.textContent = `هدف ${goalLabels[index]}`;
    select.name = "learning-goal-grade";
    select.innerHTML = `
      <option value="">اختر العلامة</option>
      <option value="D">D - امتياز</option>
      <option value="M">M - جيد</option>
      <option value="P">P - نجاح</option>
    `;

    field.append(label, select);
    goalsContainer.append(field);
  }
}

function getSelectedSubjectCount() {
  return Number(document.querySelector('input[name="subject-count"]:checked').value);
}

function updateResults() {
  const rows = [...subjectsList.querySelectorAll(".subject-row")];
  const totalHours = rows.reduce((sum, row) => {
    return sum + Number(row.querySelector('select[name="subject-hours"]').value);
  }, 0);

  let weightedPercent = 0;

  rows.forEach((row) => {
    const hours = Number(row.querySelector('select[name="subject-hours"]').value);
    const goals = [...row.querySelectorAll('select[name="learning-goal-grade"]')];
    const selectedGoals = goals.filter((goal) => goal.value);
    const gradeSum = selectedGoals.reduce((sum, goal) => sum + gradeValues[goal.value], 0);
    const isSubjectComplete = selectedGoals.length === goals.length;
    const subjectPercent = goals.length ? gradeSum / goals.length : 0;
    const subjectPoints = totalHours && isSubjectComplete ? ((subjectPercent * 35) / 100) * (hours / totalHours) : 0;
    const subjectWeightedPercent = totalHours && isSubjectComplete ? subjectPercent * (hours / totalHours) : 0;

    weightedPercent += subjectWeightedPercent;
    row.classList.toggle("incomplete-subject", !isSubjectComplete);
    row.querySelector(".subject-points").value = isSubjectComplete ? subjectPoints.toFixed(2) : "--";
  });

  const averageOutOf35 = (weightedPercent * 35) / 100;
  const isFormComplete = rows.every((row) => !row.classList.contains("incomplete-subject"));

  totalHoursElement.textContent = totalHours;
  averageScoreElement.textContent = isFormComplete ? averageOutOf35.toFixed(2) : "--";
  totalScoreElement.textContent = isFormComplete ? `${averageOutOf35.toFixed(2)} / 35` : "غير مكتمل";
}

countInputs.forEach((input) => {
  input.addEventListener("change", () => createSubjectRows(getSelectedSubjectCount()));
});

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

subjectsList.addEventListener("input", updateResults);
subjectsList.addEventListener("change", updateResults);
subjectsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-fill-grade]");

  if (!button) {
    return;
  }

  const row = button.closest(".subject-row");
  const grade = button.dataset.fillGrade;

  row.querySelectorAll('select[name="learning-goal-grade"]').forEach((select) => {
    select.value = grade;
  });

  updateResults();
});

function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem("grades-theme", theme);
}

setTheme(localStorage.getItem("grades-theme") || "light");
createSubjectRows(getSelectedSubjectCount());
