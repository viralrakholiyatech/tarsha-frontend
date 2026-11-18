import date from 'date-and-time';

export const toDateOnly = (val) => {
  if (!val) return "";
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const str = String(val).trim();
  const datePart = str.split(/[T ]/)[0].replace(/\//g, "-");
  if (/^\d{2}-\d{2}-\d{4}$/.test(datePart)) {
    const parts = datePart.split("-");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return datePart;
};

export const GetDate = (_Date, _format) => {
  if (!_Date || !_format) {
    return "-";
  }
  if (_Date instanceof Date) {
    return date.isValid(_Date) ? date.format(_Date, _format) : "-";
  }
  const str = String(_Date).trim();
  const datePart = str.split(/[T ]/)[0].replace(/\//g, "-");

  let srcFormat = "YYYY-MM-DD";
  if (/^\d{2}-\d{2}-\d{4}$/.test(datePart)) {
    srcFormat = "DD-MM-YYYY";
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    srcFormat = "YYYY-MM-DD";
  } else {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return date.format(d, _format);
    }
    return "-";
  }

  const finalDate = date.transform(datePart, srcFormat, _format);
  return date.isValid(finalDate, _format) ? finalDate : "-";
};

export const GetDays = (_Date) => {
  if (!_Date) {
    return 0;
  }
  const str = String(_Date).trim();
  const datePart = str.split(/[T ]/)[0].replace(/\//g, "-");
  const srcFormat = /^\d{2}-\d{2}-\d{4}$/.test(datePart) ? "DD-MM-YYYY" : "YYYY-MM-DD";
  const finalDate = date.transform(datePart, srcFormat, "D");
  return finalDate;
};

export const GetTime = (_Date, _format) => {
  if (!_Date || !_format) {
    return "-";
  }
  if (_Date instanceof Date) {
    return date.isValid(_Date) ? date.format(_Date, _format) : "-";
  }
  const str = String(_Date).trim();
  const parts = str.split(/[T ]/);
  if (parts.length < 2 || !parts[1]) {
    return "-";
  }
  const timePart = parts[1].split(".")[0];
  const finalTime = date.transform(timePart, "HH:mm:ss", _format);
  return date.isValid(finalTime, _format) ? finalTime : "-";
};

export const GetDateAndTime = (_Date, _format) => {
  if (!_Date || !_format) {
    return "-";
  }
  if (_Date instanceof Date) {
    return date.isValid(_Date) ? date.format(_Date, _format) : "-";
  }
  const str = String(_Date).trim();
  const parts = str.split(/[T ]/);
  const datePart = parts[0].replace(/\//g, "-");
  let timePart = parts[1] ? parts[1].split(".")[0] : "00:00:00";
  if (/^\d{2}:\d{2}$/.test(timePart)) {
    timePart = `${timePart}:00`;
  }
  const srcFormat = /^\d{2}-\d{2}-\d{4}$/.test(datePart)
    ? "DD-MM-YYYY HH:mm:ss"
    : "YYYY-MM-DD HH:mm:ss";

  const finalDateAndTime = date.transform(`${datePart} ${timePart}`, srcFormat, _format);
  return date.isValid(finalDateAndTime, _format) ? finalDateAndTime : "-";
};

export const todayDate = () => {
  return date.format(new Date(), "YYYY-MM-DD");
};

export const addDaysFromDays = (fromDate = todayDate(), num = 1) => {
  try {
    const d = new Date(fromDate);
    return date.addDays(d, num);
  } catch (err) {
    console.log(err);
    return "";
  }
};

export const todayDateAndTime = () => {
  return date.format(new Date(), "YYYY-MM-DD HH:mm:ss");
};

export const parseDate = (d = new Date()) => {
  return date.format(d, "YYYY-MM-DD");
};

/* Date format */

/*
YYYY	four-digit year	0999, 2015
Y	four-digit year without zero-padding	2, 44, 88, 2015
MMMM	month name (long)	January, December
MMM	month name (short)	Jan, Dec
MM	month with zero-padding	01, 12
M	month	1, 12
DD	date with zero-padding	02, 31
D	date	2, 31
HH	24-hour with zero-padding	23, 08
H	24-hour	23, 8
hh	12-hour with zero-padding	11, 08
h	12-hour	11, 8
A	meridiem (uppercase)	AM, PM
mm	minute with zero-padding	14, 07
m	minute	14, 7
ss	second with zero-padding	05, 10
s	second	5, 10
SSS	millisecond (high accuracy)	753, 022
SS	millisecond (middle accuracy)	75, 02
S	millisecond (low accuracy)	7, 0
Z	time zone offset value	+0100, -0800
ZZ	time zone offset value with colon	+01:00, -08:00 */

/*YY	two-digit year	90, 00, 08, 19
AA	meridiem (uppercase with ellipsis)	A.M., P.M.
a	meridiem (lowercase)	am, pm
aa	meridiem (lowercase with ellipsis)	a.m., p.m.
dddd	day of week (long)	Friday, Sunday
ddd	day of week (short)	Fri, Sun
dd	day of week (very short)	Fr, Su
SSSSSS	microsecond (high accuracy)	123456, 000001
SSSSS	microsecond (middle accuracy)	12345, 00001
SSSS	microsecond (low accuracy)	1234, 0001 */