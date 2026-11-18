import ReactPDF, { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import { PDFViewer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    body: {
        paddingTop: 35,
        paddingBottom: 65,
        paddingHorizontal: 35,
    },
    header: {
        fontSize: 12,
        marginBottom: 20,
        textAlign: 'center',
        color: 'grey',
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 12,
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'grey',
    },
    table: {
        display: "table",
        width: "100%",

        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        display: "table-row",
        flexDirection: "row",
        borderStyle: "solid",
        borderLeftWidth: 1,
        width: "100%",
        clear: "both",
    },
    tableCol: {
        width: "25%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        float: "left",
        display: "table-column",
    },
    tableCell: {
        margin: "auto",
        marginTop: 5,
        fontSize: 10
    },
    imageHeader: {

        marginBottom: 25,
        left: 0,
        right: 0,
        // marginBottom: 20,
        textAlign: 'center',

        // marginVertical: 2,
        // marginHorizontal: 2,
    },
    imageFooter: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',

    },
    UserSection: {
        float: 'left'
    }
});


const GeneratePdf = (props) => {


    const headerData = props.headerData

    return (
        <PDFViewer height={window.innerHeight} width={"100%"}>
            <Document>
                <Page size="A4" style={styles.body}>
                    <Image
                        style={styles.imageHeader}
                        height={"100px"}
                        width={"100px"}
                        src="https://dev.zaidexceldesign.com/public/img/zaid_logo_header.jpeg"
                        fixed
                    />
                </Page>



                <View style={styles.table}> 
                     <View style={styles.tableRow} fixed> 
                     
                        {headerData.map((h,i)=>(
                            <View style={styles.tableCol}> 
                                 <Text style={styles.tableCell}>{h}</Text> 
                            </View> 
                        ))}
                     
                     </View>
                </View>


                



                <View style={styles.imageFooter} fixed>
                    <Image
                        height={"100px"}
                        width={"100px"}
                        src="https://dev.zaidexceldesign.com/public/img/zaid_logo_footer.jpeg"

                    />

                    <Text render={({ pageNumber, totalPages }) => (
                        `${pageNumber} / ${totalPages}`
                    )} />
                </View>

            </Document>
        </PDFViewer>
    )
}

export default GeneratePdf