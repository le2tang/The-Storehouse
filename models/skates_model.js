const skates_db = require("../database/skates_db.js")

const skates_model = {
  async createReservation(query_reservation) {
    var skates
    try {
      skates = await skates_db.getSkatesBySize(reservation.size)
    } catch (err) {
      return err
    }
    if (skates.length() == 0) {
      return `No skates for size ${size}`
    }

    try {
      const reservations = await skates_db.getReservationsByTagNum(skates.tag_num)
    }
    catch (err) {
      return err
    }

    const unavailable_skates = new Set()
    for (const reservation of reservations) {
      // Check overlap, if it occurs then skip all reservations with the same tag number
      if (query_reservation.end_date > reservation.start_date || query_reservation.start_date < reservation.end_date) {
        unavailable_skates.add(reservation.tag_num)
      }
    }

    for (const skate of skates) {
      if (unavailable_skates.has(skate.tag_num)) {
        try {
          await skates_db.createSkateReservation(reservation.user_id, skate.tag_num, reservation.start_date, reservation.end_date)
        } catch (err) {
          return err
        }
      }
    }
  }
}

const size_maps = {
  "usm": [],
  "usw": [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
  "eum": [],
  "euw": [38.5, 39, 39.5, 40, 40.5, 41, 41.5, 42, 42.5]
}

function sizeToUSM(size) {
  category = size.substr(0, 3)
  idx = size_maps[category].findIndex(size.substr(3))
  return size_maps["usm"][idx]
}

async function assignTagNum(size, start_date, end_date) {
  size = sizeToUSM(size)

  const skates = null

  // Get all skates with the correct size
  try {
    skates = await skates_db.getSkatesBySize(size)

    if (skates.length() == 0) {
      return `No skates for size ${size}`
    }

    // Get start and end dates of reservations between the desired dates
  } catch (err) {
    return err
  }

  // Check valid dates
  try {

  } catch (err) {
    return err
  }

  // Greedy assign
  try {

  } catch (err) {
    return err
  }
}
