// Supported in IE 6-11
// const obj = {};

function isEmpty(object) {
  for (const property in object) {
    return false;
  }
  return true;
}

// console.log(isEmpty(obj)); // 👉️ true

module.exports = isEmpty;
