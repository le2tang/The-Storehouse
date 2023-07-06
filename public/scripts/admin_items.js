function initCallbacks() {
  var file_input = document.getElementById("admin-item-add-file")
  file_input.addEventListener("change", () => {
    const [file] = file_input.files
    if (file && file.type == "text/csv") {
      const reader = new FileReader()
      reader.addEventListener("load", () => {
        new_items = parse_items(reader.result)
        fetch("/admin/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(new_items)
        })
      })
      reader.readAsText(file)
    }
  })
}

function parse_items(text) {
  const rows = text.split("\n")
  const headers = rows[0].split(",")

  new_items = []
  for (var row = 1; row < rows.length - 1; ++row) {
    fields = rows[row].split(",")

    item = {}
    for (var idx in fields) {
      item[headers[idx]] = fields[idx]
    }
    new_items.push(item)
  }

  return new_items
}

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", initCallbacks)
}
else {
  initCallbacks()
}

