const VisibleExportToCsvButton = false;

//Desc true means Employee can access only their stuff, false means every resources are open for everyone
const restrict_access_mode = true;

module.exports = {
    paginationRows : 30,
    datatableHeight:"600px",
    preview_date_format : "DD-MMM-YYYY",
    app_hostname : {name : "webapp.zaidexceldesign.com" , isVisible : false},
    toCsv:{
        team_list:VisibleExportToCsvButton,
        cust_list:VisibleExportToCsvButton,
        file_online:VisibleExportToCsvButton,
        file_offline:VisibleExportToCsvButton,
        file_approved:VisibleExportToCsvButton,
        file_buc : VisibleExportToCsvButton,
        file_reject:VisibleExportToCsvButton,
        deposit_list:VisibleExportToCsvButton,
        file_expense:VisibleExportToCsvButton,
        office_expense:VisibleExportToCsvButton,
        Todo:VisibleExportToCsvButton,
    },
    restrictTo:{
        dashboardChart:restrict_access_mode,
        filesOf:{
            onlineFiles:restrict_access_mode,
            offlineFiles:restrict_access_mode,
            bucFiles:restrict_access_mode,
            approvedFiles:restrict_access_mode,
            rejectFiles:restrict_access_mode,
            project:restrict_access_mode
        },
        send_message_to_client:restrict_access_mode,
        plotvalidation:restrict_access_mode,
        enagarPortal:restrict_access_mode
    }
}