import React, { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast';
import { useParams, useSearchParams } from 'react-router-dom';
import ApiService from '../../../services/ApiService';
import { GetDate, todayDate } from '../../../services/DateAndTimeService';
import { FileUrl, zaidPdfFooterPic, zaidPdfHeaderPic, zaidPdfHeaderBorder } from '../../../config/file_url';
import { getToken } from '../../../services/useLocalStorage';
import ReactPDF, { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import { PDFViewer } from '@react-pdf/renderer';
import { fetchFileOfOnline, getFileExpenseByFileIdPdf } from '../../../config/config';
import { PdfStyleSheet } from '../../../services/FormCommon';

const styles = StyleSheet.create(PdfStyleSheet);

const GenerateFileExpensePdf = () => {

    const params = useParams();
    const [searchParams] = useSearchParams();

    const [file, setFile] = useState([]);

    const [additionalInfo, setAdditionalInfo] = useState({ file_name: "", total_expense: 0 });

    const header = { Authorization: `Bearer ${getToken()}`, ['Content-Type']: 'application/json' };

    const fetchData = useCallback(async () => {
        try {

            let urlString = `${getFileExpenseByFileIdPdf.url}/${params?.id}`;

            if (searchParams.get("start_date") && searchParams.get("end_date")) {
                urlString = `${urlString}?start_date=${searchParams.get("start_date")}&&end_date=${searchParams.get("end_date")}`;
            }

            const res = await ApiService(null, 0, header, getFileExpenseByFileIdPdf.method, urlString);

            if (!res?.data?.error) {

                setAdditionalInfo({
                    total_expense: res?.data?.expense[0]?.total_expense != null || res?.data?.expense[0]?.total_expense != undefined ? res?.data?.expense[0]?.total_expense : 0,
                    file_name: res?.data?.expense[0]?.file_name
                });

                setFile(res?.data?.data);
            }

        }
        catch (err) {
            console.log(err);
            toast.error("Something went wrong");
        }
    }, [])

    useEffect(() => {
        fetchData();
    }, []);
    return (
        <PrintPdf data={file} info={additionalInfo} />
    )
}

const PrintPdf = ({ data, info }) => {
    return (
        <PDFViewer height={window.innerHeight} width={"100%"}>
            <Document>
                <Page size="A4" style={styles.body}>

                    <Image
                        style={styles.imageHeaderBorder}
                        src={`${FileUrl}/${zaidPdfHeaderBorder}`}
                        fixed
                    />

                    <View style={styles.myPageStyle}>

                        <Image
                            style={styles.imageHeader}
                            height={"100px"}
                            width={"100px"}
                            src={`${FileUrl}/${zaidPdfHeaderPic}`}
                            fixed
                        />

                        <View style={styles.PdfInfoSection}>
                            <Text style={{display:"inline-block"}}>{info?.file_name}</Text>
                            <Text style={{display:"inline-block"}}>Date : {todayDate()}</Text>
                        </View>

                        

                        <View style={styles.table} >
                            <View style={styles.tableRow} fixed>
                                <View style={styles.tableCol}>
                                    <Text style={{fontWeight:"bold",textAlign:"center",fontSize:15}}>No</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={{fontWeight:"bold",textAlign:"center",fontSize:15}}>Date</Text>
                                </View>

                                <View style={styles.tableCol}>
                                    <Text style={{fontWeight:"bold",textAlign:"center",fontSize:15}}>Amount</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={{fontWeight:"bold",textAlign:"center",fontSize:15}}>Description</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={{fontWeight:"bold",textAlign:"center",fontSize:15}}>Rec</Text>
                                </View>
                            </View>


                            {data.map((e, i) => {
                                return <PrintRow key={i} data={e} index={i + 1} isPageBreak={i != 0 && ((i) % 20 == 0)} />
                            })}


                        </View>
                    </View>

                    <View style={styles.imageFooter} fixed>
                        <Image
                            height={"100px"}
                            width={"100px"}
                            src={`${FileUrl}/${zaidPdfFooterPic}`}
                        />

                        <Text render={({ pageNumber, totalPages }) => (
                            `${pageNumber} / ${totalPages}`
                        )} />
                    </View>


                </Page>
            </Document>
        </PDFViewer>
    )
}

const PrintRow = ({ data, isPageBreak, index }) => {
    return (
        <View style={styles.tableRow} break={isPageBreak}>
            <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{index}</Text>
            </View>
            <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{data?.date ? GetDate(data?.date, "DD-MM-YYYY") : ""}</Text>
            </View>
            <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{data?.amount != null ? data?.amount : ""}</Text>
            </View>

            <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{data?.description ? data?.description : ""}</Text>
            </View>

            <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{"--"}</Text>
            </View>
        </View>
    )
}

export default GenerateFileExpensePdf