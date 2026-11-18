const { API_URL: URL } = require("./backend");

module.exports = {
  userlogin: {
    method: "POST",
    url: `${URL}/login`,
  },
  dashboardInfo: {
    method: "GET",
    url: `${URL}/getDashboardInfo`,
  },
  dashboardInfoForTeam: {
    method: "GET",
    url: `${URL}/getDashboardInfo-team`,
  },
  getNotification: {
    method: "GET",
    url: `${URL}/getNotification`,
  },
  fetchsourcebyclient: {
    method: "GET",
    url: `${URL}/fetchsourcebyclient`,
  },
  getNotification_employee: {
    method: "GET",
    url: `${URL}/notification-employee`,
  },
  getNotification_admin: {
    method: "GET",
    url: `${URL}/notification`,
  },
  SendToSeenNotification: {
    method: "POST",
    url: `${URL}/notification-seen`,
  },
  insertEmployee: {
    method: "POST",
    url: `${URL}/employee/add/users`,
  },
  fetchEmployee: {
    method: "POST",
    url: `${URL}/employee/getEmployee`,
  },
  fetchActiveEmployee: {
    method: "GET",
    url: `${URL}/employee/getActiveEmployee`,
  },
  fetchHod: {
    method: "GET",
    url: `${URL}/fetchHod`,
  },
  deleteEmployee: {
    method: "POST",
    url: `${URL}/employee/delete`,
  },
  fetchEmployeeById: {
    method: "GET",
    url: `${URL}/employee`,
  },
  updateEmployeeById: {
    method: "POST",
    url: `${URL}/employee/update/users`,
  },
  fetchCust: {
    method: "POST",
    url: `${URL}/customer/getCustomers`,
  },
  deleteCust: {
    method: "POST",
    url: `${URL}/customer/delete`,
  },
  insertCust: {
    method: "POST",
    url: `${URL}/customer/add/users`,
  },
  insertClient: {
    method: "POST",
    url: `${URL}/customer/addClient`,
  },
  updateCust: {
    method: "POST",
    url: `${URL}/customer/update/users`,
  },
  updateClient: {
    method: "POST",
    url: `${URL}/customer/update`,
  },
  fetchCustById: {
    method: "GET",
    url: `${URL}/customer`,
  },
  insertFile: {
    method: "POST",
    url: `${URL}/file/add`,
  },
  fetchFile: {
    method: "POST",
    url: `${URL}/file/getFile`,
  },
  fetchFileOfOnline: {
    method: "GET",
    url: `${URL}/file/getFileOfOnline`,
  },
  fetchFileOfOnlineForTeam: {
    method: "GET",
    url: `${URL}/file/getFileOfOnline-team`,
  },
  fetchFileOfOffline: {
    method: "GET",
    url: `${URL}/file/getFileOfOffline`,
  },
  fetchFileOfOfflineForTeam: {
    method: "GET",
    url: `${URL}/file/getFileOfOffline-team`,
  },
  fetchFileOfBUC: {
    method: "GET",
    url: `${URL}/file/getFileOfBUC`,
  },
  fetchFileOfBUCForTeam: {
    method: "GET",
    url: `${URL}/file/getFileOfBUC-team`,
  },
  fetchFileOfApproved: {
    method: "GET",
    url: `${URL}/file/getFileOfApproved`,
  },
  fetchFileOfApprovedForTeam: {
    method: "GET",
    url: `${URL}/file/getFileOfApproved-team`,
  },
  fetchFileOfReject: {
    method: "GET",
    url: `${URL}/file/getFileOfReject`,
  },
  fetchFileOfRejectForTeam: {
    method: "GET",
    url: `${URL}/file/getFileOfReject-team`,
  },
  deleteFile: {
    method: "POST",
    url: `${URL}/file/delete`,
  },
  fetchFileById: {
    method: "GET",
    url: `${URL}/file`,
  },
  updateFileById: {
    method: "POST",
    url: `${URL}/file/update`,
  },
  constantMst_Type: {
    method: "POST",
    url: `${URL}/constant/getMst_Type`,
  },
  constantStatus_File: {
    method: "POST",
    url: `${URL}/constant/getStatus_File`,
  },
  insertDeposit: {
    method: "POST",
    url: `${URL}/expenses/add-deposit`,
  },
  getDeposit: {
    method: "GET",
    url: `${URL}/expenses/get-deposit`,
  },
  getDepositById: {
    method: "GET",
    url: `${URL}/expenses/get-deposit-byid`,
  },
  deleteDepositById: {
    method: "DELETE",
    url: `${URL}/expenses/delete-deposit-byid`,
  },
  updateDepositById: {
    method: "POST",
    url: `${URL}/expenses/update-deposit-byid`,
  },
  fetchFileExpenses: {
    method: "POST",
    url: `${URL}/file_expenses/getExpenses`,
  },
  deleteFileExpense: {
    method: "POST",
    url: `${URL}/file_expenses/delete`,
  },
  fetchFileExpenseById: {
    method: "GET",
    url: `${URL}/expenses/get-file-expense-byid`,
  },
  updateFileExpenseById: {
    method: "POST",
    url: `${URL}/expenses/update-file-expense/file_expenses`,
    foldername: "file_expenses",
  },
  updateFileExpenseByIdForAdmin: {
    method: "POST",
    url: `${URL}/expenses/update-file-expense-admin/file_expenses`,
    foldername: "file_expenses",
  },
  insertFileExpense: {
    method: "POST",
    url: `${URL}/expenses/add-file-expense/file_expenses`,
    foldername: "file_expenses",
  },
  fetchOfficeExpenses: {
    method: "POST",
    url: `${URL}/office_expenses/getExpenses`,
  },
  deleteOfficeExpense: {
    method: "DELETE",
    url: `${URL}/expenses/delete-office-expense-byid`,
  },
  deleteOfficeExpenseForAdmin: {
    method: "DELETE",
    url: `${URL}/expenses/delete-office-expense-byid-admin`,
  },
  deleteFileExpense: {
    method: "DELETE",
    url: `${URL}/expenses/delete-file-expense-byid`,
  },
  deleteFileExpenseForAdmin: {
    method: "DELETE",
    url: `${URL}/expenses/delete-file-expense-byid-admin`,
  },
  fetchOfficeExpenseById: {
    method: "GET",
    url: `${URL}/expenses/get-office-expense-byid`,
  },
  updateOfficeExpenseById: {
    method: "POST",
    url: `${URL}/expenses/update-office-expense/office_expenses`,
    foldername: "office_expenses",
  },
  updateOfficeExpenseByIdForAdmin: {
    method: "POST",
    url: `${URL}/expenses/update-office-expense-admin/office_expenses`,
    foldername: "office_expenses",
  },
  insertOfficeExpense: {
    method: "POST",
    url: `${URL}/expenses/add-office-expense/office_expenses`,
    foldername: "office_expenses",
  },
  checkOfficeExpense: {
    method: "POST",
    url: `${URL}/expenses/verify-office-expense-byid`,
  },
  checkFileExpense: {
    method: "POST",
    url: `${URL}/expenses/verify-file-expense-byid`,
  },
  fetchMstDocument: {
    method: "POST",
    url: `${URL}/document_master`,
  },
  fetchFileDetails: {
    method: "GET",
    url: `${URL}/file_details`,
  },
  changeFileDetails: {
    method: "POST",
    url: `${URL}/file_details`,
  },
  changeFileDocumentJson: {
    method: "POST",
    url: `${URL}/file/documentjson`,
  },
  getFileDocumentJson: {
    method: "GET",
    url: `${URL}/file/documentjson`,
  },
  messageToClient: {
    method: "POST",
    url: `${URL}/file/messagetoclient`,
  },
  getMessageToClient: {
    method: "GET",
    url: `${URL}/filedata/messagetoclient`,
  },
  lisoner: {
    method: "GET",
    url: `${URL}/filedata/lisoner/get`,
  },
  planner: {
    method: "GET",
    url: `${URL}/filedata/planner/get`,
  },
  stagelist: {
    method: "GET",
    url: `${URL}/stagelist`,
  },
  stageListByProcess: {
    method: "GET",
    url: `${URL}/stagelistByProcess`,
  },
  insert_enagar: {
    method: "POST",
    url: `${URL}/enagar`,
  },
  get_enagar: {
    method: "GET",
    url: `${URL}/getEnagarportal`,
  },
  insert_ownerPortal: {
    method: "POST",
    url: `${URL}/ownerPortal`,
  },
  getOwnerPortal: {
    method: "GET",
    url: `${URL}/getOwnerPortal`,
  },
  getTypesOfPlotValidation: {
    method: "GET",
    url: `${URL}/getTypesOfPlotValidation`,
  },
  file_plot_validation: {
    method: "POST",
    url: `${URL}/file_plot_validation/plot_validation`,
  },
  get_file_plot_validation: {
    method: "GET",
    url: `${URL}/file_plot_validation`,
  },
  reject_file_plot: {
    method: "POST",
    url: `${URL}/reject_file_plot`,
  },
  reject_enagar: {
    method: "POST",
    url: `${URL}/reject_enagar_portal`,
  },
  test_documents: {
    method: "POST",
    url: `${URL}/file_plot_validation_test/plot_validation`,
  },
  get_document_upload: {
    method: "GET",
    url: `${URL}/get_document_upload`,
  },
  document_upload: {
    method: "POST",
    url: `${URL}/document_upload/document_upload`,
  },
  remove_document_upload: {
    method: "DELETE",
    url: `${URL}/remove_document_upload`,
  },
  getDepartments: {
    method: "GET",
    url: `${URL}/departments`,
  },
  getRoles: {
    method: "GET",
    url: `${URL}/roles`,
  },
  getPosts: {
    method: "GET",
    url: `${URL}/posts`,
  },
  getAssistantJuniorEngineer: {
    method: "GET",
    url: `${URL}/filequery/assistantJuniorEngineer`,
  },
  sendAssistantJuniorEngineer: {
    method: "POST",
    url: `${URL}/filequery/assistantJuniorEngineer/assistant_junior_engineer`,
  },
  getDeputyEngineer: {
    method: "GET",
    url: `${URL}/filequery/deputyEngineer`,
  },
  sendDeputyEngineer: {
    method: "POST",
    url: `${URL}/filequery/deputyEngineer/deputy_engineer`,
  },
  getZonalOfficer: {
    method: "GET",
    url: `${URL}/filequery/zonalOfficer`,
  },
  sendZonalOfficer: {
    method: "POST",
    url: `${URL}/filequery/zonalOfficer/zonal_officer`,
  },
  getDeputyCommissioner: {
    method: "GET",
    url: `${URL}/filequery/deputyCommissioner`,
  },
  sendDeputyCommissioner: {
    method: "POST",
    url: `${URL}/filequery/deputyCommissioner/deputy_commissioner`,
  },
  getCommissioner: {
    method: "GET",
    url: `${URL}/filequery/commissioner`,
  },
  sendCommissioner: {
    method: "POST",
    url: `${URL}/filequery/commissioner/commissioner`,
  },
  rejectQueryFile: {
    method: "POST",
    url: `${URL}/filequery/rejectfilequery`,
  },
  fetchRoadScrunity: {
    method: "GET",
    url: `${URL}/roadscrunity`,
  },
  saveRoadScrunity: {
    method: "POST",
    url: `${URL}/roadscrunity/road_scrunity`,
  },
  getAllFilesByTeamId: {
    method: "GET",
    url: `${URL}/all-files-by-team-id`,
  },
  getOfficeExpenseForAdmin: {
    method: "GET",
    url: `${URL}/expenses/get-office-expense-admin`,
  },
  getFileExpenseForAdmin: {
    method: "GET",
    url: `${URL}/expenses/get-file-expense-admin`,
  },
  getFileExpenseOfAdminbyid: {
    method: "GET",
    url: `${URL}/expenses/get-file-expense-adminbyid`,
  },

  getOfficeExpenseForTeam: {
    method: "GET",
    url: `${URL}/expenses/get-office-expense-team`,
  },
  getFileExpenseForTeam: {
    method: "GET",
    url: `${URL}/expenses/get-file-expense-team`,
  },
  getTodos: {
    method: "GET",
    url: `${URL}/todo/get-todo`,
  },
  insertTodo: {
    method: "POST",
    url: `${URL}/todo/add-todo`,
  },
  updateTodo: {
    method: "POST",
    url: `${URL}/todo/update-todo`,
  },
  markAsDoneTodo: {
    method: "POST",
    url: `${URL}/todo/mark-todo-as-done`,
  },
  deleteTodo: {
    method: "DELETE",
    url: `${URL}/todo/remove-todo`,
  },
  deleteadmincomment: {
    method: "DELETE",
    url: `${URL}/todo/remove-admin-comment`,
  },
  deleteHodcomment: {
    method: "DELETE",
    url: `${URL}/todo/remove-hod-comment`,
  },
  getTodosByTeam: {
    method: "GET",
    url: `${URL}/todo/get-todo-of-team`,
  },
  getTodosByTeamId: {
    method: "GET",
    url: `${URL}/todo/get-todo-by-team-id`,
  },
  getTodosById: {
    method: "GET",
    url: `${URL}/get-todo-by-id`,
  },
  getTodosByFileId: {
    method: "GET",
    url: `${URL}/todo/get-todo-by-fileid`,
  },
  checkTodo: {
    method: "POST",
    url: `${URL}/todo/check-todo`,
  },
  checkhodTodo: {
    method: "POST",
    url: `${URL}/todo/hod-check-todo`,
  },
  getFileExpenseByFileId: {
    method: "GET",
    url: `${URL}/expenses/get-file-expense-bymstfileid`,
  },
  getFileExpenseByFileIdPdf: {
    method: "GET",
    url: `${URL}/expenses/get-file-expense-bymstfileid-pdf`,
  },
  getDepositExpenseByTeamId: {
    method: "GET",
    url: `${URL}/expenses/get-deposit-expense-by-teamid`,
  },
  getDepositExpenseByTeamIdForPdf: {
    method: "GET",
    url: `${URL}/expenses/get-deposit-expense-by-teamid-pdf`,
  },
  searchapi: {
    method: "POST",
    url: `${URL}/search`,
  },
  generatePdfOfTeamExpense: {
    method: "POST",
    url: `${URL}/generatepdf-teamexpense`,
  },
  AddLeave: {
    method: "POST",
    url: `${URL}/add-leave`,
  },
  getLeaveByTeamIdForTeam: {
    method: "GET",
    url: `${URL}/get-leave-list-byteam-id-forteam`,
  },
  getLeaveByTeam: {
    method: "GET",
    url: `${URL}/get-leave-list-byteam-id`,
  },
  getLeaveById: {
    method: "GET",
    url: `${URL}/get-leave`,
  },
  editLeave: {
    method: "POST",
    url: `${URL}/edit-leave`,
  },
  deleteLeaveById: {
    method: "GET",
    url: `${URL}/delete-leave`,
  },
  actionForLeave: {
    method: "POST",
    url: `${URL}/action_for_leave`,
  },
  saveWorkFee: {
    method: "POST",
    url: `${URL}/save-work-fee`,
  },
  getWorkFee: {
    method: "GET",
    url: `${URL}/get-work-fee`,
  },
  skipWorkFee: {
    method: "GET",
    url: `${URL}/skip-work-fee`,
  },
  getAllImportantFees: {
    method: "GET",
    url: `${URL}/get-all_important_fees`,
  },
  deleteAllImportantFees: {
    method: "GET",
    url: `${URL}/delete-all_important_fees`,
  },
  saveAllImportantFees: {
    method: "POST",
    url: `${URL}/save-all_important_fees/all_important_fees`,
  },
  skipFileDetails: {
    method: "POST",
    url: `${URL}/skip-file_details`,
  },
  skipEnagarPortal: {
    method: "GET",
    url: `${URL}/skip-enagar_portal`,
  },
  skipOwnerPortal: {
    method: "GET",
    url: `${URL}/skip-owner_portal`,
  },
  skipAssistantJuniorEngineer: {
    method: "GET",
    url: `${URL}/skip-assistant_junior_engineer`,
  },
  skipDeputyEngineer: {
    method: "GET",
    url: `${URL}/skip-deputy_engineer`,
  },
  skipZonalOfficer: {
    method: "GET",
    url: `${URL}/skip-zonal_officer`,
  },
  skipDeputyCommissioner: {
    method: "GET",
    url: `${URL}/skip-deputy_commissioner`,
  },
  skipCommissioner: {
    method: "GET",
    url: `${URL}/skip-commissioner`,
  },
  get_approvedPlan: {
    method: "GET",
    url: `${URL}/get-approved_plan`,
  },
  save_approvedPlan: {
    method: "POST",
    url: `${URL}/save-approved_plan/approved_plan`,
  },
  skip_approvedPlan: {
    method: "GET",
    url: `${URL}/skip-approved_plan`,
  },
  delete_approvedPlan: {
    method: "GET",
    url: `${URL}/delete-approved_plan_byid`,
  },
  skip_allImportantFees: {
    method: "GET",
    url: `${URL}/skip-all_important_fees`,
  },
  get_aminities: {
    method: "GET",
    url: `${URL}/get-aminities_fees`,
  },
  save_aminities: {
    method: "POST",
    url: `${URL}/save-aminities_fees/aminities`,
  },
  skip_aminities: {
    method: "GET",
    url: `${URL}/skip-aminities_fees`,
  },
  skip_sendMessageToClient: {
    method: "GET",
    url: `${URL}/skip-send_message_to_client`,
  },
  get_filePlotValidation: {
    method: "GET",
    url: `${URL}/get-plot_validation`,
  },
  save_filePlotValidation: {
    method: "POST",
    url: `${URL}/save-plot_validation/plot_validation`,
  },
  save_and_next_filePlotValidation: {
    method: "POST",
    url: `${URL}/save_and_next-plot_validation/plot_validation`,
  },
  reject_filePlotValidation: {
    method: "POST",
    url: `${URL}/reject-plot_validation`,
  },
  skip_filePlotValidation: {
    method: "POST",
    url: `${URL}/skip-plot_validation`,
  },
  save_enagarPortal: {
    method: "POST",
    url: `${URL}/save-enagarportal`,
  },
  save_and_next_enagarPortal: {
    method: "POST",
    url: `${URL}/save_and_next-enagarportal`,
  },
  skip_enagarPortal: {
    method: "GET",
    url: `${URL}/skip-enagarportal`,
  },
  get_documentUpload: {
    method: "GET",
    url: `${URL}/get-document_upload`,
  },
  save_documentUpload: {
    method: "POST",
    url: `${URL}/save-document_upload/document_upload/`,
  },
  skip_documentUpload: {
    method: "GET",
    url: `${URL}/skip-document_upload`,
  },
  remove_documentUpload: {
    method: "GET",
    url: `${URL}/remove-document_upload`,
  },
  save_fileApprovedReject: {
    method: "POST",
    url: `${URL}/save-file_approved_reject`,
  },
  getMstFileCode: {
    method: "GET",
    url: `${URL}/get-file-codes`,
  },
  getOnlineProjectForSuperUser: {
    method: "GET",
    url: `${URL}/get-project-online-superuser`,
  },
  getOfflineProjectForSuperUser: {
    method: "GET",
    url: `${URL}/get-project-offline-superuser`,
  },
  getBUCProjectForSuperUser: {
    method: "GET",
    url: `${URL}/get-project-buc-superuser`,
  },
  getApprovedProjectForSuperUser: {
    method: "GET",
    url: `${URL}/get-project-approved-superuser`,
  },
  getRejectProjectForSuperUser: {
    method: "GET",
    url: `${URL}/get-project-reject-superuser`,
  },
  getOnlineProjectForTeam: {
    method: "GET",
    url: `${URL}/get-project-online-team`,
  },
  getOfflineProjectForTeam: {
    method: "GET",
    url: `${URL}/get-project-offline-team`,
  },
  getBUCProjectForTeam: {
    method: "GET",
    url: `${URL}/get-project-buc-team`,
  },
  getApprovedProjectForTeam: {
    method: "GET",
    url: `${URL}/get-project-approved-team`,
  },
  getRejectProjectForTeam: {
    method: "GET",
    url: `${URL}/get-project-reject-team`,
  },
  getProjectsForSuperUser: {
    method: "GET",
    url: `${URL}/get-project-superuser`,
  },
  getProjectsForTeam: {
    method: "GET",
    url: `${URL}/get-project-team`,
  },
  getSiteCondition: {
    method: "GET",
    url: `${URL}/get-site_condition`,
  },
  saveSiteCondition: {
    method: "POST",
    url: `${URL}/save-site_condition/site_condition`,
  },
  deleteSiteCondition: {
    method: "POST",
    url: `${URL}/delete-site_condition-image`,
  },
  skipSiteCondition: {
    method: "GET",
    url: `${URL}/skip-site_condition`,
  },
  getProjectDirection: {
    method: "GET",
    url: `${URL}/get-project-direction`,
  },
  getTentativePdf: {
    method: "GET",
    url: `${URL}/get-tentative-pdf`,
  },
  saveTentativePdf: {
    method: "POST",
    url: `${URL}/save-tentative-pdf/tentative_pdf`,
  },
  deleteTentativePdf: {
    method: "POST",
    url: `${URL}/delete-tentative-pdf`,
  },
  getApprovedPlanPdf: {
    method: "GET",
    url: `${URL}/get-approved_plan-pdf`,
  },
  saveApprovedPlanPdf: {
    method: "POST",
    url: `${URL}/save-approved_plan-pdf/approved_plan_pdf`,
  },
  deleteApprovedPlanPdf: {
    method: "POST",
    url: `${URL}/delete-approved_plan-pdf`,
  },
  getBuildingBangalow: {
    method: "GET",
    url: `${URL}/get-building_bungalow`,
  },
  saveBuildingBangalow: {
    method: "POST",
    url: `${URL}/save-building_bungalow`,
  },
  deleteBuildingBangalow: {
    method: "POST",
    url: `${URL}/delete-building_bungalow`,
  },
  getProjectTypes: {
    method: "GET",
    url: `${URL}/get-project_types`,
  },
  getInaugurationMessage: {
    method: "GET",
    url: `${URL}/get-inauguration_message`,
  },
  saveInaugurationMessage: {
    method: "POST",
    url: `${URL}/save-inauguration_message/inauguration_message`,
  },
  deleteInaugurationMessage: {
    method: "POST",
    url: `${URL}/delete-inauguration_message`,
  },
  addsites: {
    method: "POST",
    url: `${URL}/save-site-inspection/siteinspection`,
    foldername: "siteinspection",
  },
  updatesites: {
    method: "POST",
    url: `${URL}/update-site-inspection/siteinspection`,
    foldername: "siteinspection",
  },
  getsitesbyid: {
    method: "GET",
    url: `${URL}/get-site-inspection`,
  },
  getsites: {
    method: "GET",
    url: `${URL}/get-site-inspection`,
  },
  getchecklist: {
    method: "GET",
    url: `${URL}/get-site-checklist`,
  },
  getfileDatabyId: {
    method: "GET",
    url: `${URL}/get-dropdown-file`,
  },
  getempsitebyId: {
    method: "GET",
    url: `${URL}/get-site-emplist`,
  },
  deletesites: {
    method: "POST",
    // url: `${URL}/delete-site-inspection`,
    url: `${URL}/delete-site-inspection`,
  },

  getProjectTypes: {
    method: "GET",
    url: `${URL}/get-project-types`,
  },

  addproject: {
    method: "POST",
    url: `${URL}/addProject/projectsummery`,
    foldername: "projectsummery",
  },

  projectbyid: {
    method: "GET",
    url: `${URL}/get-project`,
  },

  updateProject: {
    method: "POST",
    url: `${URL}/update-project/projectsummery`,
    foldername: "projectsummery",
  },

  addlocation: {
    method: "POST",
    url: `${URL}/add-location/projectlocation`,
    foldername: "projectlocation",
  },
  locationbyid: {
    method: "GET",
    url: `${URL}/get-location`,
  },

  updatelocation: {
    method: "POST",
    url: `${URL}/update-location/projectlocation`,
    foldername: "projectlocation",
  },
  getlocation: {
    method: "GET",
    url: `${URL}/get-all-location`,
  },

  projectdetailsbyid: {
    method: "GET",
    url: `${URL}/get-project-details`,
  },

  addprojectdetails: {
    method: "POST",
    url: `${URL}/add-Project-detail`,
  },

  projectcheckboxbyid: {
    method: "GET",
    url: `${URL}/get-project-checkbox`,
  },

  updateprojectdetail: {
    method: "POST",
    url: `${URL}/update-project-details`,
    // foldername:"projectlocation"
  },

  getprojectdetials: {
    method: "GET",
    url: `${URL}/get-project-qty`,
  },
  addallplans: {
    method: "POST",
    url: `${URL}/add-all-plans/allplans`,
    foldername: "allplans",
  },

  getallplansbyid: {
    method: "GET",
    url: `${URL}/get-all`,
  },
  getallplans: {
    method: "GET",
    url: `${URL}/get-all-plans`,
  },

  updateallplans: {
    method: "POST",
    url: `${URL}/update-all-plans/allplans`,
    foldername: "allplans",
  },

  addProjectPlan: {
    method: "POST",
    url: `${URL}/add-project-plan/projectplan`,
    foldername: "projectplan",
  },

  updateProjectplan: {
    method: "POST",
    url: `${URL}/update-project-plan/projectplan`,
    foldername: "projectplan",
  },
  totalclientbyid: {
    method: "GET",
    url: `${URL}/get-client-data`,
  },
  getDepartment: {
    method: "GET",
    url: `${URL}/get-department`,
  },

  getHOD: {
    method: "GET",
    url: `${URL}/todo/get-HOD`,
  },

  getDpartmentempoloyee: {
    method: "GET",
    url: `${URL}/todo/get-department-employee`,
  },
  getTodosByDepartmentTeam: {
    method: "GET",
    url: `${URL}/todo/get-department-team`,
  },

  addVillage: {
    method: "POST",
    url: `${URL}/village/add`,
  },
  getVillage: {
    method: "GET",
    url: `${URL}/getvillage`,
  },
  villagebyid: {
    method: "GET",
    url: `${URL}/villagebyid`,
  },
  updateVillage: {
    method: "POST",
    url: `${URL}/village/update`,
  },
  deleteVillage: {
    method: "POST",
    url: `${URL}/delete-village`,
  },
  addTpscheme: {
    method: "POST",
    url: `${URL}/tpscheme/add`,
  },
  gettpscheme: {
    method: "GET",
    url: `${URL}/gettpscheme`,
  },
  tpschemebyid: {
    method: "GET",
    url: `${URL}/tpschemebyid`,
  },
  updatetpscheme: {
    method: "POST",
    url: `${URL}/tpscheme/update`,
  },
  deletetpscheme: {
    method: "POST",
    url: `${URL}/delete-tpscheme`,
  },
  getProjectDetails: {
    method: "GET",
    url: `${URL}/fetchprojectdetails`,
  },
  fetchInteriorCatgory: {
    method: "GET",
    url: `${URL}/fetchInteriorCatgory`,
  },
  fetcharchitectureCategory: {
    method: "GET",
    url: `${URL}/fetcharchitectureCategory`,
  },
  addNewFile: {
    method: "POST",
    url: `${URL}/newfile/add`,
  },
  updateNewFile: {
    method: "POST",
    url: `${URL}/newfile/update`,
  },
  updateInteriorNewFile: {
    method: "POST",
    url: `${URL}/interiornewfile/update`,
  },
  getCaseId: {
    method: "GET",
    url: `${URL}/getallnewfile`,
  },
  fetchAllfile: {
    method: "GET",
    url: `${URL}/fetchallfile`,
  },
  fetchDCfile: {
    method: "GET",
    url: `${URL}/fetchdcfile`,
  },
  fetchPVfile: {
    method: "GET",
    url: `${URL}/fetchpvfile`,
  },
  fetchFireNocfile: {
    method: "GET",
    url: `${URL}/fetchfirenocfile`,
  },
  fetchENagarPortalfile: {
    method: "GET",
    url: `${URL}/fetchenagarportalfile`,
  },
  fetchBpermissionfile: {
    method: "GET",
    url: `${URL}/fetchbpermissionfile`,
  },
  fetchEmpAllfile: {
    method: "GET",
    url: `${URL}/fetchempAllfile`,
  },

  empProjectApproval: {
    method: "GET",
    url: `${URL}/empProjectApproval`,
  },
  empProjectArchitecture: {
    method: "GET",
    url: `${URL}/empProjectArchitecture`,
  },
  empProjectInterior: {
    method: "GET",
    url: `${URL}/empProjectInterior`,
  },
  fetchempdcfile: {
    method: "GET",
    url: `${URL}/fetchempdcfile`,
  },
  fetchempPVfile: {
    method: "GET",
    url: `${URL}/fetchemppvfile`,
  },
  fetchempFireNocfile: {
    method: "GET",
    url: `${URL}/fetchempfirenocfile`,
  },
  fetchempENagarPortalfile: {
    method: "GET",
    url: `${URL}/fetchempenagarportalfile`,
  },
  fetchempBpermissionfile: {
    method: "GET",
    url: `${URL}/fetchempbpermissionfile`,
  },
  fetchAllattendance: {
    method: "GET",
    url: `${URL}/fetchAllattendance`,
  },
  fetchmonthattendancedata: {
    method: "GET",
    url: `${URL}/fetchmonthattendancedata`,
  },
  fetchAttendancebyTeam: {
    method: "GET",
    url: `${URL}/fetchAttendancebyTeam`,
  },
  fetchAllLeave: {
    method: "GET",
    url: `${URL}/fetchAllLeave`,
  },

  getTacticalDates: {
    method: "GET",
    url: `${URL}/getTacticalDates`,
  },

  getStrategicDates: {
    method: "GET",
    url: `${URL}/getStrategicDates`,
  },
  deleteDocument: {
    method: "DELETE",
    url: `${URL}/remove-document_clearance`,
  },
  deleteapproval: {
    method: "DELETE",
    url: `${URL}/remove-approval_document`,
  },
  deleteAllDocument: {
    method: "DELETE",
    url: `${URL}/remove-all_file_document`,
  },
  getAlldocument: {
    method: "GET",
    url: `${URL}/fetchAlldocument`,
  },
  addoredit: {
    method: "POST",
    url: `${URL}/save-document_clearance`,
  },
  documentclearancebyId: {
    method: "GET",
    url: `${URL}/documentclearance`,
  },

  updateDocument: {
    method: "POST",
    url: `${URL}/update-document-clearance/documentclearance`,
    foldername: "documentclearance",
  },

  deletefiles: {
    method: "DELETE",
    url: `${URL}/remove-files`,
  },

  deleteCollection: {
    method: "DELETE",
    url: `${URL}/remove-collection`,
  },
  filedetailsbyId: {
    method: "GET",
    url: `${URL}/fetchfilebyId`,
  },
  documentcbyID: {
    method: "GET",
    url: `${URL}/documentClearancebyid`,
  },
  getNewFilesById: {
    method: "GET",
    url: `${URL}/getnewfilebyid`,
  },

  getInteriorFilesbyId: {
    method: "GET",
    url: `${URL}/getInteriorFilesbyId`,
  },

  getPvFile: {
    method: "GET",
    url: `${URL}/fetchpvfile`,
  },

  addupdatePv: {
    method: "POST",
    url: `${URL}/add_update-pv/PlotValidation`,
    foldername: "PlotValidation",
  },

  pvbyID: {
    method: "GET",
    url: `${URL}/pvbyid`,
  },
  deletecertficatefiles: {
    method: "DELETE",
    url: `${URL}/remove-pvcertificate_files`,
  },
  deletedocumentfiles: {
    method: "DELETE",
    url: `${URL}/remove-document_files`,
  },
  deleteFireNoc: {
    method: "DELETE",
    url: `${URL}/remove-firenoc-receipt`,
  },
  fireNocbyID: {
    method: "GET",
    url: `${URL}/firenocbyid`,
  },
  addupdatefirenoc: {
    method: "POST",
    url: `${URL}/add_update-fireNoc/FireNoc`,
    foldername: "FireNoc",
  },

  addupdateenagarinput: {
    method: "POST",
    url: `${URL}/add_update-enagarinput/EnagarInput`,
    foldername: "EnagarInput",
  },

  EnagarinputbyID: {
    method: "GET",
    url: `${URL}/enagarinputbyid`,
  },

  deleteInputDrawing: {
    method: "DELETE",
    url: `${URL}/remove-input-drawing`,
  },

  addupdateenagaroutput: {
    method: "POST",
    url: `${URL}/add_update-enagaroutput/Enagaroutput`,
    foldername: "Enagaroutput",
  },

  EnagaroutputbyID: {
    method: "GET",
    url: `${URL}/enagaroutputbyid`,
  },

  deletesmcDrawing: {
    method: "DELETE",
    url: `${URL}/remove-smc-drawing`,
  },
  deletepermissionletter: {
    method: "DELETE",
    url: `${URL}/remove-permission-letter`,
  },
  deleteEngarDetails: {
    method: "DELETE",
    url: `${URL}/remove-enagar-details`,
  },
  deleteEngarDrawing: {
    method: "DELETE",
    url: `${URL}/remove-enagar-drawing`,
  },

  inwardDetailsbyID: {
    method: "GET",
    url: `${URL}/inwarddetailsbyid`,
  },
  addupdateInwardDetails: {
    method: "POST",
    url: `${URL}/add_update-inwarddetails/InwardDetails`,
    foldername: "InwardDetails",
  },
  getInwardDetails: {
    method: "GET",
    url: `${URL}/fetchinwarddetails`,
  },
  deleteScrunity: {
    method: "DELETE",
    url: `${URL}/remove-scrunity`,
  },

  deleteRoadDeposit: {
    method: "DELETE",
    url: `${URL}/remove-road-deposit`,
  },

  addupdateOutward: {
    method: "POST",
    url: `${URL}/add_update-outward/OutwardDetails`,
    foldername: "OutwardDetails",
  },

  OutwardbyID: {
    method: "GET",
    url: `${URL}/outwardbyid`,
  },
  deletecertBuildingletter: {
    method: "DELETE",
    url: `${URL}/remove-buildingletter`,
  },
  deleteapprovalplan: {
    method: "DELETE",
    url: `${URL}/remove-approval_plan`,
  },
  addupdateApproval: {
    method: "POST",
    url: `${URL}/add_update-approval/ApprovalProcess`,
    foldername: "ApprovalProcess",
  },

  fetchApprovalbyID: {
    method: "GET",
    url: `${URL}/fetchapprovalbyId`,
  },
  deleteapprovalletter: {
    method: "DELETE",
    url: `${URL}/remove-approval_letter`,
  },
  addupdateAllfees: {
    method: "POST",
    url: `${URL}/add_update-allfees/Allfees`,
    foldername: "Allfees",
  },
  fetchallfeesbyID: {
    method: "GET",
    url: `${URL}/fetchAllfeesbyid`,
  },
  deleteFileUpload: {
    method: "DELETE",
    url: `${URL}/remove-file_upload`,
  },

  deleteAllfees: {
    method: "DELETE",
    url: `${URL}/remove-allfees`,
  },
  fetchworkfeesbyID: {
    method: "GET",
    url: `${URL}/fetchworkfeesbyid`,
  },
  deleteworkfees: {
    method: "DELETE",
    url: `${URL}/remove-workfees`,
  },
  deleteworkFileUpload: {
    method: "DELETE",
    url: `${URL}/remove-workfile_upload`,
  },

  addupdateworkfees: {
    method: "POST",
    url: `${URL}/add_update-workfees/Workfees`,
    foldername: "Workfees",
  },
  deletefsicFileUpload: {
    method: "DELETE",
    url: `${URL}/remove-fsicfile_upload`,
  },
  deleteIcFileUpload: {
    method: "DELETE",
    url: `${URL}/remove-IcFile_upload`,
  },
  deleteFsIData: {
    method: "DELETE",
    url: `${URL}/remove-fsiData`,
  },
  deleteIcdata: {
    method: "DELETE",
    url: `${URL}/remove-icdata`,
  },

  fetchfsicfeesbyID: {
    method: "GET",
    url: `${URL}/fetchfsicfeesbyid`,
  },
  fetchicfeesbyid: {
    method: "GET",
    url: `${URL}/fetchIcfeesbyid`,
  },
  addupdatefsicfees: {
    method: "POST",
    url: `${URL}/add_update-fsicfees/FsIcfees`,
    foldername: "FsIcfees",
  },
  deleteFile: {
    method: "DELETE",
    url: `${URL}/delete-file`,
  },
  getDaysbyId: {
    method: "GET",
    url: `${URL}/getdays`,
  },
  getInteriorDaysbyId: {
    method: "GET",
    url: `${URL}/getinteriordays`,
  },
  fetchempDCfile: {
    method: "GET",
    url: `${URL}/fetchempdcfile`,
  },

  fetchemppvfile: {
    method: "GET",
    url: `${URL}/fetchemppvfile`,
  },
  fetchfirenocfile: {
    method: "GET",
    url: `${URL}/fetchfirenocfile`,
  },
  fetchempenagarportalfile: {
    method: "GET",
    url: `${URL}/fetchempenagarportalfile`,
  },
  fetchempbpermissionfile: {
    method: "GET",
    url: `${URL}/fetchempbpermissionfile`,
  },

  fetchalloperationalmeeting: {
    method: "GET",
    url: `${URL}/fetchoperationalmeeting`,
  },

  fetchEmpoperationalmeeting: {
    method: "GET",
    url: `${URL}/fetchempopMeeting`,
  },

  fetchTeamOpMeeting: {
    method: "GET",
    url: `${URL}/fetchTeamOpMeeting`,
  },
  fetchHodoperationalmeeting: {
    method: "GET",
    url: `${URL}/fetchhodopMeeting`,
  },

  fetchemptacticalmeeting: {
    method: "GET",
    url: `${URL}/fetchemptacticalmeeting`,
  },
  fetchhodtacticalmeeting: {
    method: "GET",
    url: `${URL}/fetchhodtacticalmeeting`,
  },
  gererateoperatingMeeting: {
    method: "POST",
    url: `${URL}/gererateoperatingMeeting`,
  },
  fetchTaskpercent: {
    method: "GET",
    url: `${URL}/fetchTaskpercent`,
  },
  fetchTaskpercentbyteamId: {
    method: "GET",
    url: `${URL}/fetchTaskpercentbyteamId`,
  },
  getdepartmentshowbyuserid: {
    method: "GET",
    url: `${URL}/getdepartmentshowbyuserid`,
  },

  fetchopfillbyid: {
    method: "GET",
    url: `${URL}/fetchopfillbyid`,
  },
  fetchtacticalmeetingbyid: {
    method: "GET",
    url: `${URL}/fetchtacticalmeetingbyid`,
  },
  addoperationalmetting: {
    method: "POST",
    url: `${URL}/meeting/add`,
  },
  fetchAlldepartment: {
    method: "GET",
    url: `${URL}/fetchAlldepartment`,
  },

  fetchParticipantsbyid: {
    method: "GET",
    url: `${URL}/fetchParticipantsbyid`,
  },

  fetchTacticalParticipantsbyid: {
    method: "GET",
    url: `${URL}/fetchTacticalParticipantsbyid`,
  },

  getTacticalparticipantsbyuserid: {
    method: "GET",
    url: `${URL}/getTacticalparticipantsbyuserid`,
  },

  getStrategicparticipantsbyuserid: {
    method: "GET",
    url: `${URL}/getStrategicparticipantsbyuserid`,
  },
  updatePerformance: {
    method: "POST",
    url: `${URL}/performance/update`,
  },

  updateTacticalPerformance: {
    method: "POST",
    url: `${URL}/tactical-performance/update`,
  },
  updateClarityFocus: {
    method: "POST",
    url: `${URL}/clarityFocus/update`,
  },

  fetchPerformancebyid: {
    method: "GET",
    url: `${URL}/fetchPerformancebyid`,
  },

  getClarityFocusbyId: {
    method: "GET",
    url: `${URL}/getClarityFocusbyId`,
  },

  getTacticaloutecomebyid: {
    method: "GET",
    url: `${URL}/getTacticaloutecomebyid`,
  },

  fetchallStage: {
    method: "GET",
    url: `${URL}/fetchallStage`,
  },
  fetchallproject: {
    method: "GET",
    url: `${URL}/fetchallproject`,
  },
  addMeetingTask: {
    method: "POST",
    url: `${URL}/meetingtask/add`,
  },
  getSubFunctionLimits: {
    method: "GET",
    url: `${URL}/meetingtask/subfunction-limits`,
  },
  updateMeetingTask: {
    method: "POST",
    url: `${URL}/meetingtask/update`,
  },
  updateMeetingTaskStatus: {
    method: "POST",
    url: `${URL}/updateStatusmeeting`,
  },
  fetchtaskById: {
    method: "GET",
    url: `${URL}/fetchtaskById`,
  },

  gererateTacticalMeeting: {
    method: "POST",
    url: `${URL}/gererateTacticalMeeting`,
  },
  fetchallTacticalmeeting: {
    method: "GET",
    url: `${URL}/fetchtacticalmeeting`,
  },

  fetchtaskforteamid: {
    method: "GET",
    url: `${URL}/fetchtaskforteamid`,
  },

  fetchPerformancebyUserId: {
    method: "GET",
    url: `${URL}/fetchPerformancebyUserId`,
  },

  fetchperformanceTaskbyid: {
    method: "GET",
    url: `${URL}/fetchperformanceTaskbyid`,
  },

  fetchperformanceTaskpercentagebyid: {
    method: "GET",
    url: `${URL}/getperformanceTaskpercentagebyid`,
  },
  getTacticalperformacepercentagebyuserid: {
    method: "GET",
    url: `${URL}/getTacticalperformacepercentagebyuserid`,
  },
  getstrategicperformacepercentagebyuserid: {
    method: "GET",
    url: `${URL}/getstrategicperformacepercentagebyuserid`,
  },
  fetchAllAttendanced: {
    method: "GET",
    url: `${URL}/fetchAllAttendanced`,
  },

  userinformationbyId: {
    method: "GET",
    url: `${URL}/userInformtion`,
  },
  addTacticalmetting: {
    method: "POST",
    url: `${URL}/meeting/addtactical`,
  },
  fetchtaskforAdmin: {
    method: "GET",
    url: `${URL}/fetchtaskforAdmin`,
  },

  fetchdashboardtaskforAdmin: {
    method: "GET",
    url: `${URL}/fetchdashboardtaskforAdmin`,
  },
  fetchtaskforTask: {
    method: "GET",
    url: `${URL}/fetchtaskforteam`,
  },

  fetchTeamTaskbyId: {
    method: "GET",
    url: `${URL}/fetchTeamTaskbyId`,
  },

  AttendanceforTeamid: {
    method: "GET",
    url: `${URL}/AttendanceforTeamid`,
  },

  fetchtaskforteamforreport: {
    method: "GET",
    url: `${URL}/fetchtaskforteamforreport`,
  },
  fetchtaskforHod: {
    method: "GET",
    url: `${URL}/getTaskForHod`,
  },
  fetchcounterDataById: {
    method: "GET",
    url: `${URL}/fetchcounterDataById`,
  },
  getapplicationName: {
    method: "GET",
    url: `${URL}/getapplicationName`,
  },
  getoperationViewbyid: {
    method: "GET",
    url: `${URL}/getoperationViewbyid`,
  },
  deleteTaskForAdmin: {
    method: "POST",
    url: `${URL}/delete-task`,
  },

  verifiedtask: {
    method: "POST",
    url: `${URL}/verifiedTask`,
  },

  updateTaskcheck: {
    method: "POST",
    url: `${URL}/update-taskcheckox`,
  },
  ApprovedLeave: {
    method: "POST",
    url: `${URL}/ApprovedLeave`,
  },
  LeaveApprovedbyid: {
    method: "GET",
    url: `${URL}/getLeaveApprovedbyid`,
  },

  fetchdocumentbyid: {
    method: "GET",
    url: `${URL}/fetchdocumentbyid`,
  },

  getTaskPercentage: {
    method: "GET",
    url: `${URL}/getTaskPercentage`,
  },

  gettotaldepartment: {
    method: "GET",
    url: `${URL}/gettotaldepartment`,
  },

  addupdateDocument: {
    method: "POST",
    url: `${URL}/add_update-document/document`,
    foldername: "document",
  },

  deleteAdharcard: {
    method: "DELETE",
    url: `${URL}/remove-adharcard`,
  },
  deleteGraduation: {
    method: "DELETE",
    url: `${URL}/remove-graduation`,
  },
  deleteOfferletter: {
    method: "DELETE",
    url: `${URL}/remove-offerletter`,
  },
  deletebondAgreement: {
    method: "DELETE",
    url: `${URL}/remove-bondagreement`,
  },
  deleteSignature: {
    method: "DELETE",
    url: `${URL}/remove-signature`,
  },

  fetchAllemp: {
    method: "GET",
    url: `${URL}/fetchAllemp`,
  },

  getAllArchitecture: {
    method: "GET",
    url: `${URL}/getAllArchitecture`,
  },

  getAlltentative: {
    method: "GET",
    url: `${URL}/getAlltentative`,
  },
  getAllInterior: {
    method: "GET",
    url: `${URL}/getAllInterior`,
  },
  addDetails: {
    method: "POST",
    url: `${URL}/addoreditinterior`,
  },
  fetchbasicdetailsbyid: {
    method: "GET",
    url: `${URL}/fetchbasicdetailsbyid`,
  },

  fetchinteriorrndyid: {
    method: "GET",
    url: `${URL}/fetchinteriorrndyid`,
  },

  upsertinteriorRnd: {
    method: "POST",
    url: `${URL}/update-interior-study-rnd/interiorstudyrnd`,
    foldername: "interiorstudyrnd",
  },

  fetchSpacePlannigbyid: {
    method: "GET",
    url: `${URL}/fetchSpacePlannigbyid`,
  },

  fetchspcategoryid: {
    method: "GET",
    url: `${URL}/fetchspcategoryid`,
  },

  updatespCategory: {
    method: "POST",
    url: `${URL}/update-spcategory`,
  },

  addSpaceCategory: {
    method: "POST",
    url: `${URL}/interior/add`,
  },

  addSpacePlanning: {
    method: "POST",
    url: `${URL}/add-space-planning/spaceplanning`,
    foldername: "spaceplanning",
  },

  fetchquestionbyid: {
    method: "GET",
    url: `${URL}/fetchquestionbyid`,
  },
  fetchdashboardData: {
    method: "GET",
    url: `${URL}/fetchdashboardData`,
  },

  fetchProjectdata: {
    method: "GET",
    url: `${URL}/fetchProjectdata`,
  },

  updateInternalStatus: {
    method: "POST",
    url: `${URL}/interior/internalstatus`,
  },

  updateClientStatus: {
    method: "POST",
    url: `${URL}/interior/clientstatus`,
  },
  fetchinternalStatusbyid: {
    method: "GET",
    url: `${URL}/internalStatusbyid`,
  },
  fetchClientStatusbyid: {
    method: "GET",
    url: `${URL}/ClientStatusbyid`,
  },

  deleteSpacePlannig: {
    method: "POST",
    url: `${URL}/delete-space-planning`,
  },

  addquationCategory: {
    method: "POST",
    url: `${URL}/interior/addquation`,
  },
  getQuationbyid: {
    method: "GET",
    url: `${URL}/getQuationbyid`,
  },

  addVendors: {
    method: "POST",
    url: `${URL}/interior/add-vendors`,
  },

  deleteVendor: {
    method: "POST",
    url: `${URL}/delete-vendor`,
  },
  fetchVendorbyId: {
    method: "GET",
    url: `${URL}/fetchVendorbyId`,
  },
  updateQuotation: {
    method: "POST",
    url: `${URL}/interior/update-quotation`,
  },
  addFees: {
    method: "POST",
    url: `${URL}/interior/addfees`,
  },
  getFees: {
    method: "GET",
    url: `${URL}/getFees`,
  },

  deleteFees: {
    method: "POST",
    url: `${URL}/delete-fees`,
  },
  fetchFeesbyId: {
    method: "GET",
    url: `${URL}/fetchFeesbyId`,
  },

  UpdateFees: {
    method: "POST",
    url: `${URL}/interior/update-fees`,
  },

  addinteriorContractorCategory: {
    method: "POST",
    url: `${URL}/addinteriorContractorCategory`,
  },

  getInteriorContractorcategorybyid: {
    method: "GET",
    url: `${URL}/getInteriorContractorcategorybyid`,
  },

  updateinteriorContractorCategory: {
    method: "POST",
    url: `${URL}/updateinteriorContractorCategory`,
  },

  deleteinteriorContractor: {
    method: "POST",
    url: `${URL}/delete-interior-contractor`,
  },

  getinteriorContractorbyid: {
    method: "GET",
    url: `${URL}/getinteriorContractorbyid`,
  },

  addinteriorContractor: {
    method: "POST",
    url: `${URL}/addinteriorContractor`,
  },

  fetchinteriorContractorbyId: {
    method: "GET",
    url: `${URL}/fetchinteriorContractorbyId`,
  },
  updateinteiorContractor: {
    method: "POST",
    url: `${URL}/updateinteiorContractor`,
  },

  fetchInteriorDetails: {
    method: "GET",
    url: `${URL}/fetchInteriorDetails`,
  },
  addMaterialCategory: {
    method: "POST",
    url: `${URL}/interior/addmaterialcategory`,
  },

  fetchmaterialcategorybyid: {
    method: "GET",
    url: `${URL}/materialcategorybyid`,
  },

  AddMaterial: {
    method: "POST",
    url: `${URL}/add-material/material`,
    foldername: "material",
  },

  deletematerial: {
    method: "POST",
    url: `${URL}/delete-material`,
  },

  getInteriorData: {
    method: "GET",
    url: `${URL}/getInteriorData`,
  },

  fetchmaterialbyid: {
    method: "GET",
    url: `${URL}/materialbyid`,
  },

  addConceptCategory: {
    method: "POST",
    url: `${URL}/interior/addConceptCategory`,
  },

  fetchconceptcategorybyid: {
    method: "GET",
    url: `${URL}/conceptcategorybyid`,
  },

  deleteConcept: {
    method: "POST",
    url: `${URL}/delete-concept`,
  },

  AddConcept: {
    method: "POST",
    url: `${URL}/add-concept/concept`,
    foldername: "concept",
  },

  materialupdate: {
    method: "POST",
    url: `${URL}/interior/updatematerial`,
  },

  addTechnicalCategory: {
    method: "POST",
    url: `${URL}/interior/addTechnicalCategory`,
  },

  getTechnicalCategorybyid: {
    method: "GET",
    url: `${URL}/getTechnicalCategorybyid`,
  },
  get3dbyid: {
    method: "GET",
    url: `${URL}/get3dbyid`,
  },

  get3dinternalStatusbyid: {
    method: "GET",
    url: `${URL}/get3dinternalStatusbyid`,
  },

  update3dintenalstatus: {
    method: "POST",
    url: `${URL}/update3dintenalstatus`,
  },

  addmststructure: {
    method: "POST",
    url: `${URL}/addmststructure`,
  },
  structuebyid: {
    method: "GET",
    url: `${URL}/structuebyid`,
  },
  deleteStructure: {
    method: "POST",
    url: `${URL}/delete-structure`,
  },

  structureClientStatusbyid: {
    method: "GET",
    url: `${URL}/structureClientStatusbyid`,
  },

  updatestructureClientStatus: {
    method: "POST",
    url: `${URL}/updatestructureClientStatus`,
  },

  structureinternalStatusbyid: {
    method: "GET",
    url: `${URL}/structureinternalStatusbyid`,
  },

  updatestructureintenalstatus: {
    method: "POST",
    url: `${URL}/updatestructureintenalstatus`,
  },
  Addstructure: {
    method: "POST",
    url: `${URL}/add-structure/structure`,
    foldername: "structure",
  },

  addmstMepf: {
    method: "POST",
    url: `${URL}/addmstMepf`,
  },
  mepfbyid: {
    method: "GET",
    url: `${URL}/mepfbyid`,
  },
  deleteMepf: {
    method: "POST",
    url: `${URL}/delete-mepf`,
  },

  mepfClientStatusbyid: {
    method: "GET",
    url: `${URL}/mepfClientStatusbyid`,
  },

  updatemepfClientStatus: {
    method: "POST",
    url: `${URL}/updatemepfClientStatus`,
  },

  mepfinternalStatusbyid: {
    method: "GET",
    url: `${URL}/mepfinternalStatusbyid`,
  },

  updatemepfintenalstatus: {
    method: "POST",
    url: `${URL}/updatemepfintenalstatus`,
  },
  Addmepf: {
    method: "POST",
    url: `${URL}/add-mepf/mepf`,
    foldername: "mepf",
  },

  AddTechnical: {
    method: "POST",
    url: `${URL}/add-technical-drawing/technicaldrawing`,
    foldername: "technicaldrawing",
  },

  AddThreeD: {
    method: "POST",
    url: `${URL}/add-threed/threed`,
    foldername: "threed",
  },

  deleteTechnical: {
    method: "POST",
    url: `${URL}/delete-technical`,
  },

  deleteThreed: {
    method: "POST",
    url: `${URL}/delete-3d`,
  },

  updateTDInternalStatus: {
    method: "POST",
    url: `${URL}/interior/tdinternalstatus`,
  },

  updateTdClientStatus: {
    method: "POST",
    url: `${URL}/interior/tdclientstatus`,
  },
  update3dClientStatus: {
    method: "POST",
    url: `${URL}/interior/3dclientstatus`,
  },
  fetchTdinternalStatusbyid: {
    method: "GET",
    url: `${URL}/tdinternalStatusbyid`,
  },
  fetchTdClientStatusbyid: {
    method: "GET",
    url: `${URL}/tdClientStatusbyid`,
  },

  fetch3dClientStatusbyid: {
    method: "GET",
    url: `${URL}/threeDClientStatusbyid`,
  },

  addThreeDCategory: {
    method: "POST",
    url: `${URL}/interior/addThreeDCategory`,
  },

  fetchriskbyid: {
    method: "GET",
    url: `${URL}/fetchriskbyid`,
  },

  deleterisk: {
    method: "POST",
    url: `${URL}/delete-risk`,
  },

  Addrisk: {
    method: "POST",
    url: `${URL}/add-risk/riskmatrix`,
    foldername: "riskmatrix",
  },

  updateriskstage: {
    method: "POST",
    url: `${URL}/updateriskstage`,
  },

  addSchedule: {
    method: "POST",
    url: `${URL}/interior/addSchedule`,
  },

  fetchSchedule: {
    method: "GET",
    url: `${URL}/getschedule`,
  },

  deleteSchedule: {
    method: "POST",
    url: `${URL}/delete-schedule`,
  },

  generateStrategicMeeting: {
    method: "POST",
    url: `${URL}/generateStrategicMeeting`,
  },

  fetchallStrategicmeeting: {
    method: "GET",
    url: `${URL}/fetchstrategicmeeting`,
  },

  fetchhodstrategicmeeting: {
    method: "GET",
    url: `${URL}/fetchhodstrategicmeeting`,
  },

  fetchempstrategicMeeting: {
    method: "GET",
    url: `${URL}/fetchempstrategicMeeting`,
  },

  fetchstrategicmeetingbyid: {
    method: "GET",
    url: `${URL}/fetchstrategicmeetingbyid`,
  },

  fetchstrategicParticipantsbyid: {
    method: "GET",
    url: `${URL}/fetchstrategicParticipantsbyid`,
  },

  getstrategicoutecomebyid: {
    method: "GET",
    url: `${URL}/getstrategicoutecomebyid`,
  },

  getmarksbyid: {
    method: "GET",
    url: `${URL}/getmarksbyid`,
  },
  updateStrategicPerformance: {
    method: "POST",
    url: `${URL}/strategic-performance/update`,
  },

  updateMarks: {
    method: "POST",
    url: `${URL}/strategic-marks/update`,
  },

  fetchtaskforstrategic: {
    method: "GET",
    url: `${URL}/fetchtaskforstrategic`,
  },

  getStrategicmeetingPercentage: {
    method: "GET",
    url: `${URL}/getStrategicmeetingPercentage`,
  },

  FetchTopPerformer: {
    method: "GET",
    url: `${URL}/FetchTopPerformer`,
  },

  addinward: {
    method: "POST",
    url: `${URL}/save-inward/inward`,
    foldername: "inward",
  },
  fetchAdminList: {
    method: "GET",
    url: `${URL}/fetchAdminList`,
  },
  addoutward: {
    method: "POST",
    url: `${URL}/save-outward/outward`,
    foldername: "outward",
  },

  fetchoutwardAdminList: {
    method: "GET",
    url: `${URL}/fetchoutwardAdminList`,
  },
  fetchOutwardTeamList: {
    method: "GET",
    url: `${URL}/fetchOutwardTeamList`,
  },
  fetchTeamList: {
    method: "GET",
    url: `${URL}/fetchTeamList`,
  },

  updateService: {
    method: "POST",
    url: `${URL}/interiornewfile/updateService`,
  },

  getServicebyId: {
    method: "GET",
    url: `${URL}/getServicebyId`,
  },

  getBasicInterior: {
    method: "GET",
    url: `${URL}/getBasicInterior`,
  },
  getStudyInterior: {
    method: "GET",
    url: `${URL}/getStudyInterior`,
  },
  getquotationInterior: {
    method: "GET",
    url: `${URL}/getquotationInterior`,
  },

  getConceptInterior: {
    method: "GET",
    url: `${URL}/getConceptInterior`,
  },
  getConsultantsInterior: {
    method: "GET",
    url: `${URL}/getConsultantsInterior`,
  },
  getTdInterior: {
    method: "GET",
    url: `${URL}/getTdInterior`,
  },
  getriskInterior: {
    method: "GET",
    url: `${URL}/getriskInterior`,
  },
  getScheduleInterior: {
    method: "GET",
    url: `${URL}/getScheduleInterior`,
  },

  deleteinterior: {
    method: "DELETE",
    url: `${URL}/remove-interior`,
  },

  deletearchiecture: {
    method: "DELETE",
    url: `${URL}/remove-architecture`,
  },

  getempInterior: {
    method: "GET",
    url: `${URL}/getempInterior`,
  },

  getempBasicInterior: {
    method: "GET",
    url: `${URL}/getempBasicInterior`,
  },
  getempStudyInterior: {
    method: "GET",
    url: `${URL}/getempStudyInterior`,
  },

  getempquotationInterior: {
    method: "GET",
    url: `${URL}/getempquotationInterior`,
  },
  getempConsultantsInterior: {
    method: "GET",
    url: `${URL}/getempConsultantsInterior`,
  },
  getempConceptInterior: {
    method: "GET",
    url: `${URL}/getempConceptInterior`,
  },
  getempTdInterior: {
    method: "GET",
    url: `${URL}/getempTdInterior`,
  },
  getempriskmatrixInterior: {
    method: "GET",
    url: `${URL}/getempriskmatrixInterior`,
  },
  getempScheduleInterior: {
    method: "GET",
    url: `${URL}/getempScheduleInterior`,
  },

  fetchmstMeeting: {
    method: "GET",
    url: `${URL}/fetchmstMeeting`,
  },

  getmstdepartment: {
    method: "GET",
    url: `${URL}/getmstdepartment`,
  },
  getmstmeetingbyid: {
    method: "GET",
    url: `${URL}/getmstmeetingbyid`,
  },

  updatemstMeeting: {
    method: "POST",
    url: `${URL}/mst-meeting/update`,
  },

  fetcharchbdbyid: {
    method: "GET",
    url: `${URL}/fetcharchbdbyid`,
  },

  upsertarchbd: {
    method: "POST",
    url: `${URL}/update-arch-bd/archbasicdetails`,
    foldername: "archbasicdetails",
  },

  upsertarchRnd: {
    method: "POST",
    url: `${URL}/update-arch-study-rnd/archstudyrnd`,
    foldername: "archstudyrnd",
  },

  fetcharchrndyid: {
    method: "GET",
    url: `${URL}/fetcharchrndyid`,
  },

  fetcharchSpacePlannigbyid: {
    method: "GET",
    url: `${URL}/fetcharchSpacePlannigbyid`,
  },

  fetcharchspcategoryid: {
    method: "GET",
    url: `${URL}/fetcharchspcategoryid`,
  },

  AddArchSpacePlanning: {
    method: "POST",
    url: `${URL}/add-arch-space-planning/archspaceplanning`,
    foldername: "archspaceplanning",
  },

  deletearchSpacePlannig: {
    method: "POST",
    url: `${URL}/delete-arch-space-planning`,
  },

  updatearchspCategory: {
    method: "POST",
    url: `${URL}/update-arch-spcategory`,
  },

  addarchSpacePlanningcategory: {
    method: "POST",
    url: `${URL}/add-arch-spcategory`,
  },

  fetcharchspinternalStatusbyid: {
    method: "GET",
    url: `${URL}/archspinternalStatusbyid`,
  },

  updatearchSp: {
    method: "POST",
    url: `${URL}/updatearchSp`,
  },

  fetcharchSpClientStatusbyid: {
    method: "GET",
    url: `${URL}/archSpClientStatusbyid`,
  },

  archspupdateClientStatus: {
    method: "POST",
    url: `${URL}/archspupdateClientStatus`,
  },

  updatearchspstage: {
    method: "POST",
    url: `${URL}/updatearchspstage`,
  },

  addarchdrawing: {
    method: "POST",
    url: `${URL}/architecture/addarchdrawing`,
  },

  fetcharchdrwaingbyid: {
    method: "GET",
    url: `${URL}/archdrwaingbyid`,
  },

  Addarchdrawing: {
    method: "POST",
    url: `${URL}/add-arch-drawing/archdrawing`,
    foldername: "archdrawing",
  },

  deletedrawing: {
    method: "POST",
    url: `${URL}/delete-arch-drawing`,
  },

  fetcharchinternalStatusbyid: {
    method: "GET",
    url: `${URL}/archinternalStatusbyid`,
  },

  updatearchIs: {
    method: "POST",
    url: `${URL}/updatearchIs`,
  },

  fetcharchClientStatusbyid: {
    method: "GET",
    url: `${URL}/archClientStatusbyid`,
  },

  archupdateClientStatus: {
    method: "POST",
    url: `${URL}/archupdateClientStatus`,
  },

  getarchFees: {
    method: "GET",
    url: `${URL}/getarchFees`,
  },

  deletearchFees: {
    method: "POST",
    url: `${URL}/delete-archfees`,
  },

  addarchFees: {
    method: "POST",
    url: `${URL}/addarchFees`,
  },

  fetcharchFeesbyId: {
    method: "GET",
    url: `${URL}/fetcharchFeesbyId`,
  },

  updatearchFees: {
    method: "POST",
    url: `${URL}/updatearchFees`,
  },

  addarchDcCategory: {
    method: "POST",
    url: `${URL}/addarchDcCategory`,
  },

  getarchDccategorybyid: {
    method: "GET",
    url: `${URL}/getarchDccategorybyid`,
  },

  updatearchDcCategory: {
    method: "POST",
    url: `${URL}/updatearchDcCategory`,
  },

  getarchdcbyid: {
    method: "GET",
    url: `${URL}/getarchdcbyid`,
  },

  AddArchdc: {
    method: "POST",
    url: `${URL}/add-arch-dc/archdesignconcept`,
    foldername: "archdesignconcept",
  },

  deletearchDc: {
    method: "POST",
    url: `${URL}/delete-arch-dc`,
  },

  fetcharchdcinternalStatusbyid: {
    method: "GET",
    url: `${URL}/archdcinternalStatusbyid`,
  },

  updatearchdcintenalstatus: {
    method: "POST",
    url: `${URL}/updatearchdcintenalstatus`,
  },

  fetcharchDcClientStatusbyid: {
    method: "GET",
    url: `${URL}/archDcClientStatusbyid`,
  },

  archdcupdateClientStatus: {
    method: "POST",
    url: `${URL}/archdcupdateClientStatus`,
  },

  Addarchfinald: {
    method: "POST",
    url: `${URL}/add-arch-finald/archfinald`,
    foldername: "archfinald",
  },

  fetcharchFinaldbyid: {
    method: "GET",
    url: `${URL}/fetcharchFinaldbyid`,
  },

  deletearchfinald: {
    method: "POST",
    url: `${URL}/delete-arch-finalf`,
  },

  archupdatefinaldstatus: {
    method: "POST",
    url: `${URL}/archupdatefinaldstatus`,
  },
  archfinaldstatusbyid: {
    method: "GET",
    url: `${URL}/archfinaldstatusbyid`,
  },

  updatearchfinaldstage: {
    method: "POST",
    url: `${URL}/updatearchfinaldstage`,
  },

  getarch3dcategorybyid: {
    method: "GET",
    url: `${URL}/getarch3dcategorybyid`,
  },

  updatearch3dCategory: {
    method: "POST",
    url: `${URL}/updatearch3dCategory`,
  },

  addarchThreeDCategory: {
    method: "POST",
    url: `${URL}/addarchThreeDCategory`,
  },

  getarch3dbyid: {
    method: "GET",
    url: `${URL}/getarch3dbyid`,
  },

  updatearchthreedstage: {
    method: "POST",
    url: `${URL}/updatearchthreedstage`,
  },

  AddarchThreeD: {
    method: "POST",
    url: `${URL}/add-arch-threed/archthreed`,
    foldername: "archthreed",
  },

  deletearchThreed: {
    method: "POST",
    url: `${URL}/delete-arch-3d`,
  },

  updatearch3DClientStatus: {
    method: "POST",
    url: `${URL}/updatearch3DClientStatus`,
  },
  fetcharchthreeDClientStatusbyid: {
    method: "GET",
    url: `${URL}/archthreeDClientStatusbyid`,
  },

  arch3dinternalStatusbyid: {
    method: "GET",
    url: `${URL}/arch3dinternalStatusbyid`,
  },

  updatearch3dintenalstatus: {
    method: "POST",
    url: `${URL}/updatearch3dintenalstatus`,
  },

  addarchmststructure: {
    method: "POST",
    url: `${URL}/addarchmststructure`,
  },
  archstructuebyid: {
    method: "GET",
    url: `${URL}/archstructuebyid`,
  },
  deletearchStructure: {
    method: "POST",
    url: `${URL}/delete-arch-structure`,
  },

  archstructureClientStatusbyid: {
    method: "GET",
    url: `${URL}/archstructureClientStatusbyid`,
  },

  updatearchstructureClientStatus: {
    method: "POST",
    url: `${URL}/updatearchstructureClientStatus`,
  },

  archstructureinternalStatusbyid: {
    method: "GET",
    url: `${URL}/archstructureinternalStatusbyid`,
  },

  updatearchstructureintenalstatus: {
    method: "POST",
    url: `${URL}/updatearchstructureintenalstatus`,
  },
  Addarchstructure: {
    method: "POST",
    url: `${URL}/add-arch-structure/archstructure`,
    foldername: "archstructure",
  },

  addarchmstMepf: {
    method: "POST",
    url: `${URL}/addarchmstMepf`,
  },
  archmepfbyid: {
    method: "GET",
    url: `${URL}/archmepfbyid`,
  },
  deletearchMepf: {
    method: "POST",
    url: `${URL}/delete-arch-mepf`,
  },

  archmepfClientStatusbyid: {
    method: "GET",
    url: `${URL}/archmepfClientStatusbyid`,
  },

  updatearchmepfClientStatus: {
    method: "POST",
    url: `${URL}/updatearchmepfClientStatus`,
  },

  archmepfinternalStatusbyid: {
    method: "GET",
    url: `${URL}/archmepfinternalStatusbyid`,
  },

  updatearchmepfintenalstatus: {
    method: "POST",
    url: `${URL}/updatearchmepfintenalstatus`,
  },
  Addarchmepf: {
    method: "POST",
    url: `${URL}/add-arch-mepf/archmepf`,
    foldername: "archmepf",
  },

  addarchContractorCategory: {
    method: "POST",
    url: `${URL}/addarchContractorCategory`,
  },

  fetcharchContractorcategorybyid: {
    method: "GET",
    url: `${URL}/fetcharchContractorcategorybyid`,
  },

  updatearchContractorCategory: {
    method: "POST",
    url: `${URL}/updatearchContractorCategory`,
  },
  deletearchContractor: {
    method: "POST",
    url: `${URL}/delete-arch-contractor`,
  },

  getarchContractorbyid: {
    method: "GET",
    url: `${URL}/getarchContractorbyid`,
  },

  addarchContractor: {
    method: "POST",
    url: `${URL}/addarchContractor`,
  },

  fetcharchContractorbyId: {
    method: "GET",
    url: `${URL}/fetcharchContractorbyId`,
  },
  updatearchContractor: {
    method: "POST",
    url: `${URL}/updatearchContractor`,
  },

  addarchVendorCategory: {
    method: "POST",
    url: `${URL}/addarchVendorCategory`,
  },

  deletearchVendor: {
    method: "POST",
    url: `${URL}/delete-arch-vendor`,
  },

  fetcharchvendorcategorybyid: {
    method: "GET",
    url: `${URL}/fetcharchvendorcategorybyid`,
  },

  updatearchvendorCategory: {
    method: "POST",
    url: `${URL}/updatearchvendorCategory`,
  },

  getarchVendorbyid: {
    method: "GET",
    url: `${URL}/getarchVendorbyid`,
  },

  addarchVendors: {
    method: "POST",
    url: `${URL}/addarchVendors`,
  },

  fetcharchVendorbyId: {
    method: "GET",
    url: `${URL}/fetcharchVendorbyId`,
  },
  updatearchVendor: {
    method: "POST",
    url: `${URL}/updatearchVendor`,
  },

  getarchQuotation: {
    method: "GET",
    url: `${URL}/getarchQuotation`,
  },

  deletearchQuotation: {
    method: "POST",
    url: `${URL}/delete-archquotation`,
  },

  addarchquotation: {
    method: "POST",
    url: `${URL}/addarchquotation`,
  },

  fetcharchquotationbyId: {
    method: "GET",
    url: `${URL}/fetcharchquotationbyId`,
  },

  updatearchquotation: {
    method: "POST",
    url: `${URL}/updatearchquotation`,
  },

  Addarchdocument: {
    method: "POST",
    url: `${URL}/add-arch-document/archdocument`,
    foldername: "archdocument",
  },

  fetcharchdocumentbyid: {
    method: "GET",
    url: `${URL}/fetcharchdocumentbyid`,
  },

  deletearchdocument: {
    method: "POST",
    url: `${URL}/delete-arch-document`,
  },

  archupdatedocumentstatus: {
    method: "POST",
    url: `${URL}/archupdatedocumentstatus`,
  },
  archdocumentstatusbyid: {
    method: "GET",
    url: `${URL}/archdocumentstatusbyid`,
  },

  Addarchfinalf: {
    method: "POST",
    url: `${URL}/add-arch-finalfiles/archfinalfiles`,
    foldername: "archfinalfiles",
  },

  fetcharchdfinalfbyid: {
    method: "GET",
    url: `${URL}/fetcharchdfinalfbyid`,
  },

  deletearchfinalf: {
    method: "POST",
    url: `${URL}/delete-arch-finalfiles`,
  },

  archupdatefinalfstatus: {
    method: "POST",
    url: `${URL}/archupdatefinalfstatus`,
  },
  archfinalfstatusbyid: {
    method: "GET",
    url: `${URL}/archfinalfstatusbyid`,
  },

  addarchmstageny: {
    method: "POST",
    url: `${URL}/addarchmstageny`,
  },
  archagencybyid: {
    method: "GET",
    url: `${URL}/archagencybyid`,
  },
  deletearchagency: {
    method: "POST",
    url: `${URL}/delete-arch-agency`,
  },
  archagencystatusbyid: {
    method: "GET",
    url: `${URL}/archagencystatusbyid`,
  },

  updatearchagency: {
    method: "POST",
    url: `${URL}/updatearchagency`,
  },
  Addarchagency: {
    method: "POST",
    url: `${URL}/add-arch-agency/archagency`,
    foldername: "archagency",
  },

  deletearchsiteeng: {
    method: "POST",
    url: `${URL}/delete-arch-siteeng`,
  },

  fetcharchsiteengbyid: {
    method: "GET",
    url: `${URL}/fetcharchsiteengbyid`,
  },

  Addarchsiteeng: {
    method: "POST",
    url: `${URL}/add-arch-siteeng/archsiteeng`,
    foldername: "archsiteeng",
  },

  fetcharchriskbyid: {
    method: "GET",
    url: `${URL}/fetcharchriskbyid`,
  },

  deletearchrisk: {
    method: "POST",
    url: `${URL}/delete-arch-risk`,
  },

  Addarchrisk: {
    method: "POST",
    url: `${URL}/add-arch-risk/archriskmatrix`,
    foldername: "archriskmatrix",
  },

  fetcharchmaterialcategorybyid: {
    method: "GET",
    url: `${URL}/archmaterialcategorybyid`,
  },

  deletearchmaterial: {
    method: "POST",
    url: `${URL}/delete-arch-material`,
  },

  addarchMaterialCategory: {
    method: "POST",
    url: `${URL}/addarchMaterialCategory`,
  },

  AddarchMaterial: {
    method: "POST",
    url: `${URL}/add-arch-material/archmaterial`,
    foldername: "archmaterial",
  },

  archmaterialupdate: {
    method: "POST",
    url: `${URL}/archmaterialupdate`,
  },

  fetcharchmaterialbyid: {
    method: "GET",
    url: `${URL}/archmaterialbyid`,
  },

  addarchitectureschedule: {
    method: "POST",
    url: `${URL}/addarchitectureschedule`,
  },

  fetcharchSchedule: {
    method: "GET",
    url: `${URL}/getarchschedule`,
  },

  deletearchSchedule: {
    method: "POST",
    url: `${URL}/delete-arch-schedule`,
  },

  archschedulestatusbyid: {
    method: "GET",
    url: `${URL}/archschedulestatusbyid`,
  },

  updatearchscheduleStatus: {
    method: "POST",
    url: `${URL}/updatearchscheduleStatus`,
  },

  getBasicArch: {
    method: "GET",
    url: `${URL}/getBasicArch`,
  },
  getStudyArch: {
    method: "GET",
    url: `${URL}/getStudyArch`,
  },
  getQuotationArch: {
    method: "GET",
    url: `${URL}/getQuotationArch`,
  },
  getdesignconceptArch: {
    method: "GET",
    url: `${URL}/getdesignconceptArch`,
  },
  getConsultantsArch: {
    method: "GET",
    url: `${URL}/getConsultantsArch`,
  },
  getTechnicalDrawingsArch: {
    method: "GET",
    url: `${URL}/getTechnicalDrawingsArch`,
  },
  getScheduleArch: {
    method: "GET",
    url: `${URL}/getScheduleArch`,
  },
  getRiskArch: {
    method: "GET",
    url: `${URL}/getRiskArch`,
  },

  getempArch: {
    method: "GET",
    url: `${URL}/getempArch`,
  },
  getempBasicArch: {
    method: "GET",
    url: `${URL}/getempBasicArch`,
  },
  getempStudyArch: {
    method: "GET",
    url: `${URL}/getempStudyArch`,
  },
  getempQuotationArch: {
    method: "GET",
    url: `${URL}/getempQuotationArch`,
  },
  getempdesignconceptArch: {
    method: "GET",
    url: `${URL}/getempdesignconceptArch`,
  },
  getempConsultantsArch: {
    method: "GET",
    url: `${URL}/getempConsultantsArch`,
  },
  getempTdArch: {
    method: "GET",
    url: `${URL}/getempTdArch`,
  },
  getempScheduleArch: {
    method: "GET",
    url: `${URL}/getempScheduleArch`,
  },
  getempRiskArch: {
    method: "GET",
    url: `${URL}/getempRiskArch`,
  },
  getArchDetails: {
    method: "GET",
    url: `${URL}/getArchDetails`,
  },

  getArchDaysbyId: {
    method: "GET",
    url: `${URL}/getArchDaysbyId`,
  },

  getArchFilesbyId: {
    method: "GET",
    url: `${URL}/getArchFilesbyId`,
  },
  updateArch: {
    method: "POST",
    url: `${URL}/updateArchitecture`,
  },

  getArchData: {
    method: "GET",
    url: `${URL}/getArchData`,
  },

  fetcharchquestionbyid: {
    method: "GET",
    url: `${URL}/fetcharchquestionbyid`,
  },

  getCategory: {
    method: "GET",
    url: `${URL}/getCategory`,
  },

  AddarchfinalDrawing: {
    method: "POST",
    url: `${URL}/add-arch-finaldrawing/archfinaldrawing`,
    foldername: "archfinaldrawing",
  },

  fetcharchdfinaldbyid: {
    method: "GET",
    url: `${URL}/fetcharchdfinaldbyid`,
  },

  updateOnsite: {
    method: "POST",
    url: `${URL}/updateOnsite`,
  },

  updatearchbdstage: {
    method: "POST",
    url: `${URL}/updatearchbdstage`,
  },

  updatearchdrawingstage: {
    method: "POST",
    url: `${URL}/updatearchdrawingstage`,
  },
  updatearchquotationstage: {
    method: "POST",
    url: `${URL}/updatearchquotationstage`,
  },
  updatearchdocumentstage: {
    method: "POST",
    url: `${URL}/updatearchdocumentstage`,
  },
  updatearchfinalfstage: {
    method: "POST",
    url: `${URL}/updatearchfinalfstage`,
  },
  updatearchagencystage: {
    method: "POST",
    url: `${URL}/updatearchagencystage`,
  },

  updatearchfinaldstage: {
    method: "POST",
    url: `${URL}/updatearchfinaldstage`,
  },

  updatearchmaterialstage: {
    method: "POST",
    url: `${URL}/updatearchmaterialstage`,
  },

  updatearchschedulestage: {
    method: "POST",
    url: `${URL}/updatearchschedulestage`,
  },

  updatearchsiteengstage: {
    method: "POST",
    url: `${URL}/updatearchsiteengstage`,
  },

  updatearchriskstage: {
    method: "POST",
    url: `${URL}/updatearchriskstage`,
  },

  fetchquotationcategoryid: {
    method: "GET",
    url: `${URL}/fetchquotationcategoryid`,
  },

  updateQuotationCategory: {
    method: "POST",
    url: `${URL}/interior/update-quotationcategory`,
  },

  fetchmaterialcategoryid: {
    method: "GET",
    url: `${URL}/fetchmaterialcategoryid`,
  },

  updateMaterialCategory: {
    method: "POST",
    url: `${URL}/interior/update-materialcategory`,
  },

  fetchconceptcategoryid: {
    method: "GET",
    url: `${URL}/fetchconceptcategoryid`,
  },

  updateConceptCategory: {
    method: "POST",
    url: `${URL}/interior/update-conceptcategory`,
  },

  fetchtdcategoryid: {
    method: "GET",
    url: `${URL}/fetchtdcategoryid`,
  },

  interiordcinternalStatusbyid: {
    method: "GET",
    url: `${URL}/interiordcinternalStatusbyid`,
  },

  updateinteriordcintenalstatus: {
    method: "POST",
    url: `${URL}/updateinteriordcintenalstatus`,
  },

  interiorDcClientStatusbyid: {
    method: "GET",
    url: `${URL}/interiorDcClientStatusbyid`,
  },

  interiordcupdateClientStatus: {
    method: "POST",
    url: `${URL}/interiordcupdateClientStatus`,
  },

  Addfinald: {
    method: "POST",
    url: `${URL}/add-finald/finald`,
    foldername: "finald",
  },

  fetchFinaldbyid: {
    method: "GET",
    url: `${URL}/fetchFinaldbyid`,
  },

  deletefinald: {
    method: "POST",
    url: `${URL}/delete-finalf`,
  },

  updatefinaldstatus: {
    method: "POST",
    url: `${URL}/updatefinaldstatus`,
  },
  finaldstatusbyid: {
    method: "GET",
    url: `${URL}/finaldstatusbyid`,
  },

  updateTdCategory: {
    method: "POST",
    url: `${URL}/interior/update-tdcategory`,
  },

  fetch3dcategoryid: {
    method: "GET",
    url: `${URL}/fetch3dcategoryid`,
  },

  update3dCategory: {
    method: "POST",
    url: `${URL}/interior/update-3dcategory`,
  },

  schedulestatusbyid: {
    method: "GET",
    url: `${URL}/schedulestatusbyid`,
  },

  updatescheduleStatus: {
    method: "POST",
    url: `${URL}/updatescheduleStatus`,
  },

  updatebdstage: {
    method: "POST",
    url: `${URL}/updatebdstage`,
  },

  updatespstage: {
    method: "POST",
    url: `${URL}/updatespstage`,
  },

  updatequotationstage: {
    method: "POST",
    url: `${URL}/updatequotationstage`,
  },

  updatematerialstage: {
    method: "POST",
    url: `${URL}/updatematerialstage`,
  },
  updateconceptstage: {
    method: "POST",
    url: `${URL}/updateconceptstage`,
  },

  updatetdstage: {
    method: "POST",
    url: `${URL}/updatetdstage`,
  },

  update3dstage: {
    method: "POST",
    url: `${URL}/update3dstage`,
  },

  updateschedulestage: {
    method: "POST",
    url: `${URL}/updateschedulestage`,
  },

  deleteInward: {
    method: "POST",
    url: `${URL}/deleteInward`,
  },

  deleteOutWard: {
    method: "POST",
    url: `${URL}/deleteOutWard`,
  },

  addShifts: {
    method: "POST",
    url: `${URL}/employee/addShifts`,
  },
  updateShifts: {
    method: "POST",
    url: `${URL}/employee/updateShifts`,
  },

  deleteShift: {
    method: "POST",
    url: `${URL}/delete-shift`,
  },

  getShiftList: {
    method: "GET",
    url: `${URL}/getShiftList`,
  },

  getShiftbyid: {
    method: "GET",
    url: `${URL}/getShiftbyid`,
  },

  fetchHolidays: {
    method: "GET",
    url: `${URL}/fetchHolidays`,
  },

  AddOrUpdateCampaign: {
    method: "POST",
    url: `${URL}/AddOrUpdateCampaign/campaign`,
    foldername: "campaign",
  },
  fetchcampaign: {
    method: "GET",
    url: `${URL}/fetchcampaign`,
  },

  fetchAdmincampaign: {
    method: "GET",
    url: `${URL}/fetchAdmincampaign`,
  },

  fetchpostData: {
    method: "GET",
    url: `${URL}/fetchpostData`,
  },

  fetchAdminpost: {
    method: "GET",
    url: `${URL}/fetchAdminpost`,
  },

  addPost: {
    method: "POST",
    url: `${URL}/addPost/post`,
  },
  deletePost: {
    method: "POST",
    url: `${URL}/deletePost`,
  },

  fetchpostbyid: {
    method: "GET",
    url: `${URL}/fetchpostbyid`,
  },

  updatePost: {
    method: "POST",
    url: `${URL}/updatePost/post`,
  },
  deleteCampaign: {
    method: "POST",
    url: `${URL}/deleteCampaign`,
  },

  StatusCampaign: {
    method: "POST",
    url: `${URL}/StatusCampaign`,
  },

  StatusPost: {
    method: "POST",
    url: `${URL}/StatusPost`,
  },
  fetchleads: {
    method: "GET",
    url: `${URL}/fetchleads`,
  },

  fetchAdminleads: {
    method: "GET",
    url: `${URL}/fetchAdminleads`,
  },

  fetchleadsbyid: {
    method: "GET",
    url: `${URL}/fetchleadsbyid`,
  },

  fetchcampaignbyid: {
    method: "GET",
    url: `${URL}/fetchcampaignbyid`,
  },

  AddOrUpdateLeads: {
    method: "POST",
    url: `${URL}/AddOrEditLeads`,
  },
  deleteLeads: {
    method: "POST",
    url: `${URL}/delete-leads`,
  },

  fetchAdminFollowups: {
    method: "GET",
    url: `${URL}/fetchAdminFollowups`,
  },

  fetchFollowupsbyid: {
    method: "GET",
    url: `${URL}/fetchFollowupsbyid`,
  },
  fetchFollowups: {
    method: "GET",
    url: `${URL}/fetchFollowups`,
  },

  AddOrUpdateFollowups: {
    method: "POST",
    url: `${URL}/AddOrUpdateFollowups`,
  },
  deleteFollowups: {
    method: "POST",
    url: `${URL}/delete-followups`,
  },

  fetchAdminQuestion: {
    method: "GET",
    url: `${URL}/fetchAdminQuestion`,
  },

  fetchQuestiondatabyid: {
    method: "GET",
    url: `${URL}/fetchQuestiondatabyid`,
  },
  fetchQuestion: {
    method: "GET",
    url: `${URL}/fetchQuestion`,
  },

  AddOrUpdateQuestion: {
    method: "POST",
    url: `${URL}/AddOrUpdateQuestion`,
  },
  deleteQuestion: {
    method: "POST",
    url: `${URL}/delete-question`,
  },

  fetchAdminMeetingSchedule: {
    method: "GET",
    url: `${URL}/fetchAdminMeetingSchedule`,
  },

  fetchMeetingSchedulebyid: {
    method: "GET",
    url: `${URL}/fetchMeetingSchedulebyid`,
  },
  fetchMeetingSchedule: {
    method: "GET",
    url: `${URL}/fetchMeetingSchedule`,
  },

  AddOrUpdateMeetingschedule: {
    method: "POST",
    url: `${URL}/AddOrUpdateMeetingschedule`,
  },
  deleteMeetingSchedule: {
    method: "POST",
    url: `${URL}/delete-meeting-schedule`,
  },

  fetchSitevisit: {
    method: "GET",
    url: `${URL}/fetchSitevisit`,
  },

  fetchAdminSitevisit: {
    method: "GET",
    url: `${URL}/fetchAdminSitevisit`,
  },
  fetchSitevisitbyid: {
    method: "GET",
    url: `${URL}/fetchSitevisitbyid`,
  },

  AddOrUpdateSitevisit: {
    method: "POST",
    url: `${URL}/AddOrUpdateSitevisit/sitevisit`,
    foldername: "sitevisit",
  },
  deleteSitevisit: {
    method: "POST",
    url: `${URL}/delete-site-visit`,
  },

  fetchproposal: {
    method: "GET",
    url: `${URL}/fetchproposal`,
  },

  fetchAdminproposal: {
    method: "GET",
    url: `${URL}/fetchAdminproposal`,
  },
  fetchproposalbyid: {
    method: "GET",
    url: `${URL}/fetchproposalbyid`,
  },

  AddOrUpdateproposal: {
    method: "POST",
    url: `${URL}/AddOrUpdateproposal/proposal`,
    foldername: "proposal",
  },
  deleteProposal: {
    method: "POST",
    url: `${URL}/delete-proposal`,
  },

  fetchpresentation: {
    method: "GET",
    url: `${URL}/fetchpresentation`,
  },

  fetchpAdminresentation: {
    method: "GET",
    url: `${URL}/fetchpAdminresentation`,
  },
  fetchpresentationbyid: {
    method: "GET",
    url: `${URL}/fetchpresentationbyid`,
  },

  AddOrUpdatepresentation: {
    method: "POST",
    url: `${URL}/AddOrUpdatepresentation/presentation`,
    foldername: "presentation",
  },
  deletepresentation: {
    method: "POST",
    url: `${URL}/delete-presentation`,
  },
  fetchterms: {
    method: "GET",
    url: `${URL}/fetchterms`,
  },

  getLiveLocation: {
    method: "GET",
    url: `${URL}/getLiveLocation`,
  },

  addcategory: {
    method: "POST",
    url: `${URL}/paymentcategory/addcategory`,
  },
  getPaymentcategory: {
    method: "GET",
    url: `${URL}/getPaymentcategory`,
  },
  getcategorybyid: {
    method: "GET",
    url: `${URL}/getcategorybyid`,
  },
  editcategory: {
    method: "POST",
    url: `${URL}/paymentcategory/update`,
  },
  deletePaymentcategoryConfig: {
    method: "POST",
    url: `${URL}/delete-payment-category`,
  },

  insertPayment: {
    method: "POST",
    url: `${URL}/insertPayment`,
  },
  getPayments: {
    method: "GET",
    url: `${URL}/getPayments`,
  },
  getPaymentById: {
    method: "GET",
    url: `${URL}/getPaymentById`,
  },
  updatePayment: {
    method: "POST",
    url: `${URL}/updatePayment`,
  },
  deletePayment: {
    method: "POST",
    url: `${URL}/deletePayment`,
  },

  addvendor: {
    method: "POST",
    url: `${URL}/vendor/add`,
  },
  getVendor: {
    method: "GET",
    url: `${URL}/getVendors`,
  },
  vendorbyid: {
    method: "GET",
    url: `${URL}/vendorsbyid`,
  },
  updatevendor: {
    method: "POST",
    url: `${URL}/vendor/update`,
  },
  deleteVendor: {
    method: "POST",
    url: `${URL}/delete-vendor`,
  },

  getledgergroup: {
    method: "GET",
    url: `${URL}/getledgergroup`,
  },

  getLedgers: {
    method: "GET",
    url: `${URL}/getledgers`,
  },
  getledgersbyid: {
    method: "GET",
    url: `${URL}/getledgersbyid`,
  },

  addledger: {
    method: "POST",
    url: `${URL}/ledgers/addledger`,
  },

  updateLedger: {
    method: "POST",
    url: `${URL}/ledgers/updateLedger`,
  },
  deleteLedger: {
    method: "POST",
    url: `${URL}/delete-ledger`,
  },

  getReceiptfile: {
    method: "GET",
    url: `${URL}/getReceiptfile`,
  },

  getReceipts: {
    method: "GET",
    url: `${URL}/getReceipts`,
  },
  getReceiptsById: {
    method: "GET",
    url: `${URL}/getReceiptsById`,
  },
  updateReceipt: {
    method: "POST",
    url: `${URL}/updateReceipt/receipt`,
    foldername: "receipt",
  },
  deleteReceipt: {
    method: "POST",
    url: `${URL}/deleteReceipt`,
  },
  addReceipt: {
    method: "POST",
    url: `${URL}/addReceipt/receipt`,
    foldername: "receipt",
  },

  getIncomeLedgers: {
    method: "GET",
    url: `${URL}/getIncomeLedgers`,
  },
  getExpenseLedgers: {
    method: "GET",
    url: `${URL}/getExpenseLedgers`,
  },

  getMonthlyReport: {
    method: "GET",
    url: `${URL}/getMonthlyReport`,
  },

  getProjectReport: {
    method: "GET",
    url: `${URL}/getProjectReport`,
  },

  getLedgerReport: {
    method: "GET",
    url: `${URL}/getLedgerReport`,
  },

  getPaymentExpenses: {
    method: "GET",
    url: `${URL}/getPaymentExpenses`,
  },
  getPaymentExpesesById: {
    method: "GET",
    url: `${URL}/getPaymentExpesesById`,
  },
  updatePaymentExpense: {
    method: "POST",
    url: `${URL}/updatePaymentExpense/paymentExpense`,
    foldername: "paymentExpense",
  },
  deletePaymentExpenses: {
    method: "POST",
    url: `${URL}/deletePaymentExpenses`,
  },
  addPaymentExpense: {
    method: "POST",
    url: `${URL}/addPaymentExpense/paymentExpense`,
    foldername: "paymentExpense",
  },

  getProjectReportDetail: {
    method: "GET",
    url: `${URL}/getProjectReportDetail`,
  },
  getLedgerReportDetail: {
    method: "GET",
    url: `${URL}/getLedgerReportDetail`,
  },

  getMonthlyReportDetail: {
    method: "GET",
    url: `${URL}/getMonthlyReportDetail`,
  },

  getEscrowIncome: {
    method: "GET",
    url: `${URL}/getEscrowIncome`,
  },
  getEscrowIncomeById: {
    method: "GET",
    url: `${URL}/getEscrowIncomeById`,
  },
  EscrowaddIncome: {
    method: "POST",
    url: `${URL}/addEscrowIncome`,
  },
  updateEscrowIncome: {
    method: "POST",
    url: `${URL}/updateEscrowIncome`,
  },
  deleteEscrowIncome: {
    method: "POST",
    url: `${URL}/deleteEscrowIncome`,
  },

  updateEscrowExpenses: {
    method: "POST",
    url: `${URL}/updateEscrowExpenses/escrow`,
    foldername: "escrow",
  },
  deleteEscrowExpenses: {
    method: "POST",
    url: `${URL}/deleteEscrowExpenses`,
  },
  addEscrowExpense: {
    method: "POST",
    url: `${URL}/addEscrowExpense/escrow`,
    foldername: "escrow",
  },
  getEscrowExpensesById: {
    method: "GET",
    url: `${URL}/getEscrowExpensesById`,
  },
  getEscrowExpenses: {
    method: "GET",
    url: `${URL}/getEscrowExpenses`,
  },

  getEscrowMonthlyReport: {
    method: "GET",
    url: `${URL}/getEscrowMonthlyReport`,
  },
  getEscrowMonthlyReportDetail: {
    method: "GET",
    url: `${URL}/getEscrowMonthlyReportDetail`,
  },

  getEscrowProjectReport: {
    method: "GET",
    url: `${URL}/getEscrowProjectReport`,
  },
  getEscrowLedgerReport: {
    method: "GET",
    url: `${URL}/getEscrowLedgerReport`,
  },
  getEscrowProjectReportDetail: {
    method: "GET",
    url: `${URL}/getEscrowProjectReportDetail`,
  },
  getEscrowLedgerReportDetail: {
    method: "GET",
    url: `${URL}/getEscrowLedgerReportDetail`,
  },

  getMembersdata: {
    method: "GET",
    url: `${URL}/getMembersdata`,
  },

  getInteriorMembersData: {
    method: "GET",
    url: `${URL}/getInteriorMembersData`,
  },

  getArchMembersData: {
    method: "GET",
    url: `${URL}/getArchMembersData`,
  },

  addPms: {
    method: "POST",
    url: `${URL}/pms/add`,
  },
  fetchPms: {
    method: "GET",
    url: `${URL}/getpms`,
  },
  Pmsbyid: {
    method: "GET",
    url: `${URL}/Pmsbyid`,
  },
  getPmstaskById: {
    method: "GET",
    url: `${URL}/getPmstaskById`,
  },
  updatePms: {
    method: "POST",
    url: `${URL}/pms/update`,
  },
  deletePms: {
    method: "POST",
    url: `${URL}/delete-pms`,
  },

  getEmpPms: {
    method: "GET",
    url: `${URL}/getEmpPms`,
  },

  addCity: {
    method: "POST",
    url: `${URL}/city/add`,
  },
  getcity: {
    method: "GET",
    url: `${URL}/getcity`,
  },
  getCityById: {
    method: "GET",
    url: `${URL}/citybyid`,
  },
  updateCity: {
    method: "POST",
    url: `${URL}/city/update`,
  },
  deleteCity: {
    method: "POST",
    url: `${URL}/delete-city`,
  },
  getWorkflowMeetingClarity: {
    method: "GET",
    url: `${URL}/workflow/meeting-clarity`,
  },
  getWorkflowTeamMembers: {
    method: "GET",
    url: `${URL}/workflow/team-members`,
  },
  s3UploadUrl: {
    method: "POST",
    url: `${URL}/s3/upload-url`,
  },
  s3FileUrl: {
    method: "GET",
    url: `${URL}/s3/file-url`,
  },
  s3DeleteFile: {
    method: "DELETE",
    url: `${URL}/s3/file`,
  },
};
