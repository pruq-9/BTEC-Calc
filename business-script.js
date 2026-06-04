const gradeValues = {
  D: 100,
  M: 80,
  P: 60,
};

const goalLabels = ["أ", "ب", "ج", "د", "ه"];
const tenthGradeBusinessSubjects = [
  { name: "الغرض من الشركة", hours: 30 },
  { name: "مؤسسات التجارية", hours: 30 },
  { name: "التنبؤ بالأداء المالي للشركة", hours: 30 },
  { name: "خطة التسويق", hours: 30 },
  { name: "انشاء شركة صغيرة", hours: 60 },
  { name: "العمل ضمن فريق", hours: 30 },
  { name: "إدارة الشؤون المالية الشخصية", hours: 30 },
  { name: "تقنيات العرض و الترويج", hours: 30 },
  { name: "الأشخاص في الشركات", hours: 30 },
  { name: "الأعمال عبر الإنترنت", hours: 60 },
  { name: "اخلاقيات العمل", hours: 30 },
  { name: "إدارة شركة صغيرة", hours: 30 },
];
const firstSecondaryBusinessSubjects = [
  { name: "استكشاف الأعمال", hours: 90 },
  { name: "البحث والتخطيط لحملة تسويقية", hours: 90 },
  { name: "تمويل الأعمال", hours: 90 },
  { name: "إدارة إحدى الفعاليات", hours: 90 },
];
const secondSecondaryBusinessSubjects = [
  { name: "مبادئ الإدارة", hours: 60 },
  { name: "اتخاذ قرارات الأعمال", hours: 120 },
  { name: "الموارد البشرية", hours: 60 },
  { name: "دراسة خدمة العملاء", hours: 60 },
  { name: "اخلاقيات الأعمال", hours: 60 },
];
const businessSubjectsByGrade = {
  10: tenthGradeBusinessSubjects,
  11: firstSecondaryBusinessSubjects,
  12: secondSecondaryBusinessSubjects,
};

const subjectsList = document.querySelector("#subjects-list");
const subjectTemplate = document.querySelector("#subject-template");
const totalHoursElement = document.querySelector("#total-hours");
const averageScoreElement = document.querySelector("#average-score");
const totalScoreElement = document.querySelector("#total-score");
const resetGradesButton = document.querySelector("#reset-grades");
const gradeInputs = document.querySelectorAll('input[name="subject-count"]');

function createSubjectRows(grade) {
  subjectsList.innerHTML = "";
  const subjects = businessSubjectsByGrade[grade];

  subjects.forEach((subject, index) => {
    const row = subjectTemplate.content.firstElementChild.cloneNode(true);
    const nameInput = row.querySelector('input[name="subject-name"]');
    const hoursSelect = row.querySelector('select[name="subject-hours"]');

    nameInput.value = subject.name;
    nameInput.readOnly = true;
    hoursSelect.value = subject.hours;
    hoursSelect.disabled = true;
    row.dataset.subjectNumber = index + 1;
    row.classList.add("fixed-subject");
    const goalsCount =
      grade === 11 && index === subjects.length - 1 ? 5 : grade === 12 && index === 1 ? 4 : 3;
    row.style.setProperty("--goal-count", goalsCount);

    showFixedSubjectText(row, subject);
    createGoalSelectors(row, goalsCount);
    subjectsList.append(row);
  });

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

  goalLabels.slice(0, goalsCount).forEach((goalLabel) => {
    const field = document.createElement("div");
    const label = document.createElement("label");
    const select = document.createElement("select");

    field.className = "goal-field";
    label.textContent = `هدف ${goalLabel}`;
    select.name = "learning-goal-grade";
    select.innerHTML = `
      <option value="">اختر العلامة</option>
      <option value="D">D - امتياز</option>
      <option value="M">M - جيد</option>
      <option value="P">P - نجاح</option>
    `;

    field.append(label, select);
    goalsContainer.append(field);
  });
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

resetGradesButton.addEventListener("click", () => {
  subjectsList.querySelectorAll('select[name="learning-goal-grade"]').forEach((select) => {
    select.value = "";
  });

  updateResults();
});

gradeInputs.forEach((input) => {
  input.addEventListener("change", () => createSubjectRows(getSelectedGrade()));
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

document.body.dataset.theme = localStorage.getItem("grades-theme") || "dark";

function getSelectedGrade() {
  return Number(document.querySelector('input[name="subject-count"]:checked').value);
}

createSubjectRows(getSelectedGrade());
