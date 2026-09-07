const input = document.querySelector(".card-number");
const mask = document.querySelector(".card-number-mask");

const cardNumberDigits = 16

function formatCardNumber(value, delimiter) {
    delimiter = delimiter || ''
  const digitsOnly = value.replace(/\D/g, '');
  const groups = digitsOnly.match(/.{1,4}/g);
  return delimiter + groups ? delimiter + groups.join(' ') : '';
}

input.addEventListener("input", () => {
    input.value = formatCardNumber(input.value);
});