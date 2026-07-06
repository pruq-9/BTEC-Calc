const gradeValues = {
  D: 100,
  M: 80,
  P: 60,
};

const goalLabels = ["أ", "ب", "ج", "د", "ه"];
const commonSubjectSettings = [
  { key: "arabic", max: 100, weight: 10 },
  { key: "english", max: 100, weight: 10 },
  { key: "islamic", max: 60, weight: 6 },
  { key: "jordan-history", max: 40, weight: 4 },
];
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
const averageScoreLabel = document.querySelector("#average-score-label");
const totalScoreElement = document.querySelector("#total-score");
const totalScoreLabel = document.querySelector("#total-score-label");
const resetGradesButton = document.querySelector("#reset-grades");
const gradeInputs = document.querySelectorAll('input[name="subject-count"]');
const scaleFieldset = document.querySelector("#tenth-grade-scale");
const scaleInputs = document.querySelectorAll('input[name="score-scale"]');
const secondaryOptions = document.querySelector("#secondary-options");
const includeCommonSubjectsInput = document.querySelector("#include-common-subjects");
const commonSubjectsPanel = document.querySelector("#common-subjects");
const commonInputs = document.querySelectorAll("[data-common-subject]");
const savedGoalValues = {};

function getSelectedGrade() {
  const checkedInput = document.querySelector('input[name="subject-count"]:checked');
  return checkedInput ? checkedInput.value : "10";
}

function renderSubjectRows() {
  saveVisibleGoalValues();
  subjectsList.innerHTML = "";

  getVisibleSubjectGroups().forEach((group) => {
    if (isCombinedSecondary()) {
      const groupTitle = document.createElement("h2");
      groupTitle.className = "subject-group-title";
      groupTitle.textContent = group.title;
      subjectsList.append(groupTitle);
    }

    group.subjects.forEach((subject, index) => {
      const row = subjectTemplate.content.firstElementChild.cloneNode(true);
      const nameInput = row.querySelector('input[name="subject-name"]');
      const hoursSelect = row.querySelector('select[name="subject-hours"]');
      const goalsCount =
        group.grade === 11 && index === group.subjects.length - 1 ? 5 : group.grade === 12 && index === 1 ? 4 : 3;

      nameInput.value = subject.name;
      nameInput.readOnly = true;
      hoursSelect.value = subject.hours;
      hoursSelect.disabled = true;
      row.dataset.subjectNumber = isCombinedSecondary() ? index + 1 : subjectsList.querySelectorAll(".subject-row").length + 1;
      row.dataset.goalKey = `${group.grade}-${index}`;
      row.classList.add("fixed-subject");
      row.style.setProperty("--goal-count", goalsCount);

      showFixedSubjectText(row, subject);
      createGoalSelectors(row, goalsCount);
      restoreGoalValues(row);
      subjectsList.append(row);
    });
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

function saveVisibleGoalValues() {
  subjectsList.querySelectorAll(".subject-row").forEach((row) => {
    savedGoalValues[row.dataset.goalKey] = [...row.querySelectorAll('select[name="learning-goal-grade"]')].map(
      (select) => select.value,
    );
  });
}

function restoreGoalValues(row) {
  const values = savedGoalValues[row.dataset.goalKey];

  if (!values) {
    return;
  }

  row.querySelectorAll('select[name="learning-goal-grade"]').forEach((select, index) => {
    select.value = values[index] || "";
  });
}

function isCombinedSecondary() {
  return getSelectedGrade() === "secondary-combined";
}

function includesCommonSubjects() {
  return isCombinedSecondary() && Boolean(includeCommonSubjectsInput && includeCommonSubjectsInput.checked);
}

function getVisibleSubjectGroups() {
  if (isCombinedSecondary()) {
    return [
      { grade: 11, title: "مواد أول ثانوي", subjects: businessSubjectsByGrade[11] },
      { grade: 12, title: "مواد ثاني ثانوي", subjects: businessSubjectsByGrade[12] },
    ];
  }

  const selectedGrade = getSelectedGrade();
  return [{ grade: selectedGrade, subjects: businessSubjectsByGrade[selectedGrade] }];
}

function getScoreScale() {
  if (getSelectedGrade() === "10") {
    return Number(document.querySelector('input[name="score-scale"]:checked')?.value || 70);
  }

  if (isCombinedSecondary()) {
    return includesCommonSubjects() ? 100 : 70;
  }

  return 35;
}

function getVocationalScale() {
  return isCombinedSecondary() ? 70 : getScoreScale();
}

function getCommonSubjectsScore() {
  if (!includesCommonSubjects()) {
    return { score: 0, isComplete: true };
  }

  let score = 0;
  let isComplete = true;

  commonSubjectSettings.forEach((subject) => {
    const input = document.querySelector(`[data-common-subject="${subject.key}"]`);

    if (!input) {
      isComplete = false;
      return;
    }

    clampCommonInput(input);
    const value = Number(input.value);
    const hasValidValue = input.value !== "" && value >= 0 && value <= subject.max;

    input.classList.toggle("invalid-input", !hasValidValue);
    isComplete = isComplete && hasValidValue;
    score += hasValidValue ? (value / subject.max) * subject.weight : 0;
  });

  return { score, isComplete };
}

function updateScaleControls() {
  const selectedGrade = getSelectedGrade();
  const scoreScale = getScoreScale();
  const commonSubjectsIncluded = includesCommonSubjects();

  document.body.dataset.selectedGrade = String(selectedGrade);
  document.body.dataset.combinedSecondary = String(isCombinedSecondary());
  if (scaleFieldset) {
    scaleFieldset.hidden = selectedGrade !== "10";
  }
  if (secondaryOptions) {
    secondaryOptions.hidden = !isCombinedSecondary();
  }
  if (commonSubjectsPanel) {
    commonSubjectsPanel.hidden = !commonSubjectsIncluded;
  }
  if (!commonSubjectsIncluded && commonInputs.length) {
    commonInputs.forEach((input) => input.classList.remove("invalid-input"));
  }
  averageScoreLabel.textContent = `المعدل من ${scoreScale}`;
  totalScoreLabel.textContent = `المجموع من ${scoreScale}`;
}

function updateResults() {
  saveVisibleGoalValues();
  updateScaleControls();

  const rows = [...subjectsList.querySelectorAll(".subject-row")];
  const totalHours = rows.reduce((sum, row) => {
    return sum + Number(row.querySelector('select[name="subject-hours"]').value);
  }, 0);
  const scoreScale = getScoreScale();
  const vocationalScale = getVocationalScale();

  let weightedPercent = 0;

  rows.forEach((row) => {
    const hours = Number(row.querySelector('select[name="subject-hours"]').value);
    const goals = [...row.querySelectorAll('select[name="learning-goal-grade"]')];
    const selectedGoals = goals.filter((goal) => goal.value);
    const gradeSum = selectedGoals.reduce((sum, goal) => sum + gradeValues[goal.value], 0);
    const isSubjectComplete = selectedGoals.length === goals.length;
    const subjectPercent = goals.length ? gradeSum / goals.length : 0;
    const subjectPoints = totalHours && isSubjectComplete ? ((subjectPercent * vocationalScale) / 100) * (hours / totalHours) : 0;
    const subjectWeightedPercent = totalHours && isSubjectComplete ? subjectPercent * (hours / totalHours) : 0;

    weightedPercent += subjectWeightedPercent;
    row.classList.toggle("incomplete-subject", !isSubjectComplete);
    row.querySelector(".subject-points").value = isSubjectComplete ? subjectPoints.toFixed(2) : "--";
  });

  const commonSubjects = getCommonSubjectsScore();
  const finalScore = (weightedPercent * vocationalScale) / 100 + commonSubjects.score;
  const isFormComplete =
    rows.every((row) => !row.classList.contains("incomplete-subject")) && commonSubjects.isComplete;

  totalHoursElement.textContent = totalHours;
  averageScoreElement.textContent = isFormComplete ? finalScore.toFixed(2) : "--";
  totalScoreElement.textContent = isFormComplete ? `${finalScore.toFixed(2)} / ${scoreScale}` : "غير مكتمل";
}

if (resetGradesButton) {
  resetGradesButton.addEventListener("click", () => {
    subjectsList.querySelectorAll(".subject-row").forEach((row) => {
      delete savedGoalValues[row.dataset.goalKey];
    });
    subjectsList.querySelectorAll('select[name="learning-goal-grade"]').forEach((select) => {
      select.value = "";
    });
    commonInputs.forEach((input) => {
      if (!commonSubjectsPanel || !commonSubjectsPanel.hidden) {
        input.value = "";
      }
    });

    updateResults();
  });
}

gradeInputs.forEach((input) => {
  input.addEventListener("change", renderSubjectRows);
});

scaleInputs.forEach((input) => {
  input.addEventListener("change", updateResults);
});

if (includeCommonSubjectsInput) {
  includeCommonSubjectsInput.addEventListener("change", updateResults);
}
if (commonInputs.length) {
  commonInputs.forEach((input) => {
    input.addEventListener("input", () => {
      clampCommonInput(input);
      updateResults();
    });
  });
}

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

function clampCommonInput(input) {
  if (input.value === "") {
    return;
  }

  const max = Number(input.max);
  const min = Number(input.min || 0);
  const value = Number(input.value);

  if (Number.isNaN(value)) {
    input.value = "";
  } else if (value > max) {
    input.value = max;
  } else if (value < min) {
    input.value = min;
  }
}

renderSubjectRows();
