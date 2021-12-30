function expandItem(node) {
  let sibling = node.nextElementSibling;
  if (sibling.hidden) {
    sibling.hidden = false;
    node.innerText = "Collapse";
  }
  else {
    sibling.hidden = true;
    node.innerText = "Expand";
  }
}