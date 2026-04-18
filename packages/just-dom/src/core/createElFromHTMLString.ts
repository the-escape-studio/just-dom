export const createElFromHTMLString = (HTMLString: string) => {
  const fragment = document.createDocumentFragment();
  const parser = new DOMParser();
  const doc = parser.parseFromString(HTMLString, "text/html");
  const nodes = Array.from(doc.body.children);

  nodes.forEach((node) => {
    fragment.appendChild(node);
  });

  return fragment;
};
