export const assignIds = function(): void {
  const cells = Array.from(document.querySelectorAll('.cell'));
  cells.forEach((cell, i) => cell.setAttribute("id", i.toString()));
}
