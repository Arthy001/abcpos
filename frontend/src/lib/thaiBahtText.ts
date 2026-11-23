/**
 * Converts a number into Thai Baht text format (e.g. 1500.50 -> หนึ่งพันห้าร้อยบาทห้าสิบสตางค์)
 */
export function thaiBahtText(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return "ศูนย์บาทถ้วน";
  if (num === 0) return "ศูนย์บาทถ้วน";

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const [bahtStr, satangStrRaw] = absNum.toFixed(2).split(".");
  const satangStr = satangStrRaw.slice(0, 2);

  const numbers = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const units = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  function convertSection(sectionStr: string): string {
    let result = "";
    const len = sectionStr.length;

    for (let i = 0; i < len; i++) {
      const digit = parseInt(sectionStr.charAt(i), 10);
      const pos = len - i - 1;

      if (digit === 0) continue;

      if (pos === 0 && digit === 1 && len > 1 && sectionStr.charAt(i - 1) !== "0") {
        result += "เอ็ด";
      } else if (pos === 1 && digit === 2) {
        result += "ยี่สิบ";
      } else if (pos === 1 && digit === 1) {
        result += "สิบ";
      } else {
        result += numbers[digit] + units[pos];
      }
    }
    return result;
  }

  function convertLargeNumber(valStr: string): string {
    if (valStr === "0" || !valStr) return "";
    let res = "";
    let temp = valStr;
    let millionCount = 0;

    while (temp.length > 0) {
      const cutLen = Math.min(6, temp.length);
      const chunk = temp.slice(-cutLen);
      temp = temp.slice(0, -cutLen);

      const chunkText = convertSection(chunk);
      if (chunkText) {
        res = chunkText + (millionCount > 0 ? "ล้าน".repeat(millionCount) : "") + res;
      }
      millionCount++;
    }
    return res;
  }

  let bahtText = convertLargeNumber(bahtStr);
  let satangNum = parseInt(satangStr, 10);
  let satangText = "";

  if (satangNum > 0) {
    satangText = convertSection(satangStr);
  }

  let output = isNegative ? "ลบ" : "";

  if (!bahtText && satangNum > 0) {
    output += `${satangText}สตางค์`;
  } else if (bahtText && satangNum === 0) {
    output += `${bahtText}บาทถ้วน`;
  } else if (bahtText && satangNum > 0) {
    output += `${bahtText}บาท${satangText}สตางค์`;
  } else {
    output = "ศูนย์บาทถ้วน";
  }

  return output;
}
