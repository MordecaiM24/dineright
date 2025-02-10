export default function toFormalCase(str) {
  if (str.includes("-")) {
    str = str.split("-").join(" ");
  }

  if (str.includes("_")) {
    str = str.split("_").join(" ");
  }

  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
