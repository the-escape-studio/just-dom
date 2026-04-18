export const createRoot = (root: string | HTMLElement, rootEl: HTMLElement) => {
  const container =
    typeof root === "string" ? document.getElementById(root) : root;
  if (!container) {
    throw new Error(
      typeof root === "string"
        ? `Elemento con ID "${root}" non trovato`
        : "Elemento non valido"
    );
  }
  container.appendChild(rootEl);
};
