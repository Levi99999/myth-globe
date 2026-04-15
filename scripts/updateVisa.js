import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
// 👉 手动维护一个“免签国家列表”（这是关键！）
const visaFreeCountries = [
  "泰国",
  "新加坡",
  "马来西亚",
  "阿联酋",
  "卡塔尔",
  "塞尔维亚",
  "波黑",
  "白俄罗斯"
];

// 👉 如果你想加落地签
const visaOnArrivalCountries = [
  "印尼"
];

// 👉 所有国家（你地图里的）
const countries = [
  "中国","日本","韩国","美国","法国","泰国","英国",
  "新加坡","马来西亚","阿联酋","印度","土耳其","越南"
];

const result = {};

countries.forEach(country => {
  let type = "需签证";

  if (visaFreeCountries.includes(country)) {
    type = "免签";
  } else if (visaOnArrivalCountries.includes(country)) {
    type = "落地签";
  }

  result[country] = {
    type,
    stay: "以官方为准",
    note: type === "免签"
      ? "免签入境，具体停留时间以官方为准"
      : "需办理签证或以官方政策为准",
    lastUpdated: new Date().toISOString().slice(0, 10),
    official: "https://cs.mfa.gov.cn/"
  };
});

fs.writeFileSync(
  "./src/visa_auto.json",
  JSON.stringify(result, null, 2),
  "utf-8"
);

console.log("✅ 签证数据生成完成！");