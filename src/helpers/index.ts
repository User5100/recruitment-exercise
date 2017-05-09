export function convertMonthInTwoDigitForm (monthNumber) {

  if (monthNumber < 10 ) {
    return '0'.concat(monthNumber.toString())
  } else {
    return monthNumber.toString();
  }
}
