function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parseFraction(fractionString) {
  var parts = fractionString.split("/");
  return {
    display: fractionString,
    numerator: parseFloat(parts[0]),
    denominator: parseFloat(parts[1])
  };
}

function getPercentage(fraction) {
  // Get the percentage equivalent of a fraction
  return (fraction.numerator / fraction.denominator) * 100;
}

function generateMessage(imageLabel, text, correct) {
  let message = `<img src="/Icons/chess/${imageLabel}.svg" width="32"/> ` + text
  if (correct != null) {message += ` The correct answer is ${correct}%`;}
  return message;
}

function answerMessage(answer, correct) {
  // Generate a correction message according to answer accuracy.
  let accuracy = Math.abs(answer - correct);
  let correctAnswer = correct.toFixed(2);

  if (accuracy <= 0.001) {
    return generateMessage("best", "Correct !", null);
  }
  if (accuracy <= 1) {
    return generateMessage("correct", "Good !", correctAnswer);
    return "Good! The correct answer is " + correctAnswer + "%";
  }
  if (accuracy <= 2) {
    return generateMessage("inaccuracy", "Close guess.", correctAnswer);
    return "Close guess. The correct answer is " + correctAnswer + "%";
  }
    return generateMessage("incorrect", "Incorrect.", correctAnswer);
  return "Incorrect. The correct answer is " + correctAnswer + "%";
}
