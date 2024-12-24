function initCallbacks() {
  const address_type_select = document.getElementById(
    "address-type-select"
  )
  const address_details_input = document.getElementById(
    "address-details-text"
  )
  address_type_select.addEventListener(
    "change",
    function () {
      switch (address_type_select.value) {
        case "clv":
          address_details_input.placeholder = "Unit Number"
          break
        case "uwp":
          address_details_input.placeholder = "Building Name"
          break
        case "abb":
          address_details_input.placeholder = "Address"
        default:
          break
      }
    }
  )

  const contact_type_select = document.getElementById(
    "contact-type-select"
  )
  const contact_details_input = document.getElementById(
    "contact-details-text"
  )
  contact_type_select.addEventListener(
    "change",
    function () {
      switch (contact_type_select.value) {
        case "tgm":
          contact_details_input.placeholder = "@user_id"
          break
        case "wha":
          contact_details_input.placeholder = "Number"
          break
        case "txt":
          contact_details_input.placeholder = "Number"
          break
        case "eml":
          contact_details_input.placeholder = "Email"
          break
        default:
          break
      }
    }
  )
}

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", initCallbacks);
}
else {
  initCallbacks();
}