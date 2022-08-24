const makeDoubleDigits = (digit) => {
  if (digit >= 10) {
    return digit;
  }
  return `0${digit}`;
};

const isEmpty = (field) => field.length === 0;

const copyToClipboard = async (text) => {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand("copy", true, text);
  }
};

export { makeDoubleDigits, isEmpty, copyToClipboard };
