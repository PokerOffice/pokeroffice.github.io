const urlParams = new URLSearchParams(window.location.search);
const level = parseInt(urlParams.get('level')) || 1;

const disabledLink = document.getElementById('link_level' + level);
disabledLink.classList.add('disabled');
disabledLink.removeAttribute('href');

function generateFraction() {
  // Generate random fractions p/q, with 0 < p < q < C,
  // with C depending on quiz level
  let p, q;
  switch (level) {
    case 2:
      p = getRandomInt(1, 19);
      q = getRandomInt(p + 1, 20);
      break;
    case 3:
      p = getRandomInt(1, 500);
      q = getRandomInt(p + 1, 900);
      p /= 10;
      q /= 10;
      break;
    default:
      p = getRandomInt(1, 9);
      q = getRandomInt(p + 1, 10);
      break;
  }
  return { numerator: p, denominator: q };
}
