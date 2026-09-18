const quickCards = document.querySelectorAll(".quick-card");
const taskCheckboxes = document.querySelectorAll(".task-list input");

quickCards.forEach((card) => {
  card.addEventListener("click", () => {
    quickCards.forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
  });
});

taskCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    checkbox.closest("li").classList.toggle("done", checkbox.checked);
  });
});
