export const groupBy = (array, key) => array.reduce((rv, x) => {
  (rv[x[key]] = rv[x[key]] || []).push(x);
  return rv
}, {})


export const sortNewest = (array) => {
  return array.sort((a, b) => {
    if (a.timestamp.isBefore(b.timestamp)) {
      return 1
    } else {
      return -1
    }
  })
}

export const sortOldest = (array) => {
  return array.sort((a, b) => {
    if (a.timestamp.isBefore(b.timestamp)) {
      return -1
    } else {
      return 1
    }
  })
}
