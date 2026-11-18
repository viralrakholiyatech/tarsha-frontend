import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useParams, useSearchParams } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import {
  getDepositExpenseByTeamId,
  getDepositExpenseByTeamIdForPdf,
} from "../../../config/config";
import { GetDate, todayDate } from "../../../services/DateAndTimeService";
import { getToken } from "../../../services/useLocalStorage";
import jsPDF from "jspdf";
import "jspdf-autotable";

const TeamExportReportPdf = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [expenses, setExpenses] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState({
    team: "",
    total_deposit: 0,
    total_expense: 0,
    total_balance: 0,
  });

  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const isNotNullOrNotUndefined = (value = "") => {
    try {
      return !(
        typeof value === "undefined" ||
        value === null ||
        value.length === 0
      );
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const fetchFileExpenseByFileId = useCallback(async () => {
    try {
      let urlString = `${getDepositExpenseByTeamIdForPdf.url}/${params?.id}`;

      if (searchParams.get("start_date") && searchParams.get("end_date")) {
        urlString = `${urlString}?start_date=${searchParams.get(
          "start_date"
        )}&&end_date=${searchParams.get("end_date")}`;
      }

      const res = await ApiService(
        null,
        0,
        header,
        getDepositExpenseByTeamIdForPdf.method,
        urlString
      );

      if (!res?.data?.error) {
        setAdditionalInfo({
          team: isNotNullOrNotUndefined(res?.data?.team_data[0]?.team_fullname)
            ? res?.data?.team_data[0]?.team_fullname
            : "",
          total_deposit: isNotNullOrNotUndefined(res?.data?.total_deposit)
            ? res?.data?.total_deposit
            : 0,
          total_expense: isNotNullOrNotUndefined(res?.data?.total_expense)
            ? res?.data?.total_expense
            : 0,
          total_balance: isNotNullOrNotUndefined(res?.data?.total_balance)
            ? res?.data?.total_balance
            : 0,
        });

        setExpenses(res?.data?.data);
        clg
      }
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something went wrong"
      );
    }
  }, []);

  useEffect(() => {
    fetchFileExpenseByFileId();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(16);
    doc.text("Team Report", 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Date: ${todayDate()}`, 10, y);
    y += 15;

    const tableData = expenses.map((item, index) => ({
      No: index + 1,
      Date: item?.date ? GetDate(item?.date, "DD-MM-YYYY") : "",
      Deposit: item?.expense_type === 1 ? item?.amount : "",
      Expense:
        item?.expense_type === 2 || item?.expense_type === 3
          ? item?.amount
          : "",
      "File name": item?.file_name || "",
      Desc: item?.description || "",
      Rec: "--",
    }));
  
    doc.autoTable({
      head: [["No.", "Date", "Deposit", "Expense", "File name", "Desc", "Rec"]],
      body: tableData,
      startY: y,
    });
    console.log("tableData=====>",tableData)

    doc.save("team_report.pdf");
  };

  return (
    <div>
      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  );
};

export default TeamExportReportPdf;
