function initCallbacks() {
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 86400000)

  const start_date_input = document.getElementById("skate-start-date")
  const end_date_input = document.getElementById("skate-end-date")

  start_date_input.valueAsDate = today
  end_date_input.valueAsDate = tomorrow

  start_date_input.onchange = (event) => {
    const start_date = start_date_input.valueAsNumber
    const end_date = end_date_input.valueAsNumber

    if (start_date < today.getTime()) {
      start_date_input.valueAsDate = today
    } else if (start_date > end_date) {
      end_date_input.valueAsNumber = start_date
    }
  }

  end_date_input.onchange = (event) => {
    const start_date = start_date_input.valueAsNumber
    const end_date = end_date_input.valueAsNumber

    if (end_date < today.getTime()) {
      start_date_input.valueAsDate = today
      end_date_input.valueAsDate = today
    } else if (end_date < start_date) {
      start_date_input.valueAsNumber = end_date
    }
  }

  const size_type_input = document.getElementById("skate-size-type")
  const size_input = document.getElementById("skate-size")

  function setSkateSizeOptions() {
    const size_type = size_type_input.value

    var min_size, increment
    switch (size_type) {
      case "usm":
        min_size = 7
        increment = 0.5
        break
      case "usw":
        min_size = 5
        increment = 0.5
        break
      case "eum":
        min_size = 34
        increment = 1
        break
      case "euw":
        min_size = 30
        increment = 1
        break
    }

    for (var idx = 0; idx < 10; ++idx) {
      const size_option = size_input.children[idx]
      size_option.value = min_size + increment * idx
      size_option.innerHTML = min_size + increment * idx
    }
  }

  setSkateSizeOptions()
  size_type_input.onchange = setSkateSizeOptions
}

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", initCallbacks);
}
else {
  initCallbacks();
}