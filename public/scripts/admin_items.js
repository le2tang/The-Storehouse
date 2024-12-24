function initCallbacks() {
  const search_bar = document.getElementById("admin-item-search")
  search_bar.addEventListener("input", () => {
    const search_pattern = search_bar.value.toLowerCase()

    const items_list = document.getElementById("admin-item-list")
    const items = [...items_list.getElementsByClassName("item-card")]

    items.forEach((item) => {
      const itemname = item.getElementsByClassName("item-card-itemname")[0].innerHTML.trim().toLowerCase()
      if (itemname.startsWith(search_pattern)) {
        item.style.display = ""
      }
      else {
        item.style.display = "none"
      }
    })
  })

  var file_input = document.getElementById("admin-item-add-file")
  file_input.addEventListener("change", () => {
    const [file] = file_input.files
    if (file && file.type == "text/csv") {
      const reader = new FileReader()
      reader.addEventListener("load", async () => {
        new_items = parse_items(reader.result)
        await fetch(
          "/admin/items",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(new_items)
          }
        ).then(
          (response) => {
            if (response.ok) {
              alert("File successfully uploaded")
            } else {
              alert("Failed to upload file")
            }
          }
        ).catch((response) => {
          alert("Something went wrong uploading the file")
        })
      })
      reader.readAsText(file)
    }
  })
}

function parse_items(text) {
  const rows = text.split("\n")
  const headers = [
    "quantity",
    "itemname",
    "description",
    "tags"
  ]

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

