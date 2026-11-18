import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetDate, todayDate } from "../../../services/DateAndTimeService";
// import { AddFilesites } from "../../../services/FilesitesService";
import { getToken } from "../../../services/useLocalStorage";
import useValidator from "../../../services/Validation";
import { GetFile } from "../../../services/FileService";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import { login, FilesitesRoute, SiteRoute } from "../../../config/RouteConfig";
import ApiService from "../../../services/ApiService";
import {
  getsitesbyid,
  updatesites,
  getchecklist,
  fetchActiveEmployee,
  getfileDatabyId
} from "../../../config/config";
import { getCustomers } from "../../../services/CustomerService";
import axios from "axios";

//File_sites
const Preview = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [sites, setSites] = useState({
    // mst_type_id: "",
    // mst_inspection_checklist_id: "",
    // others_text: "",
    // date: todayDate(),
    // client_id: "",
    // mst_file_project_id: "",
    // key_observation: "",
    // remarks: "",
    // site_incharge: "",
    // authorized_person: "",
    // review_by: "",
    // client_sign: "",
    // review_by_sign: "",
  });
  const [file, setFile] = useState([]);
  const [custData, setCustData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checklistData, setChecklistData] = useState([]);
    const [selectedFileId, setSelectedFileId] = useState("");
  const [filedata, setFileData] = useState("");

  const [otherInputVisible, setOtherInputVisible] = useState(false);
  const [otherInputValue, setOtherInputValue] = useState("");
  const [masterTypes, setMasterTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  // const [validator, showValidationMessage] = useValidator();
  const [validator, showValidationMessage] = useValidator({
    rules: {
      remarks: "required|max:255", // Add any necessary validation rules here
      // Define other validation rules for your other fields as well
    },
  });
  const [selectedMasterTypeID, setSelectedMasterTypeID] = useState(
    masterTypes.length > 0 ? masterTypes[0].id : null
  );
  const [visitCategory, setVisitCategory] = useState("Interior Work");
  const [visitOptions, setVisitOptions] = useState([
    // "Civil Work",
    // "Electrical Work",
    // "Carpenter Work",
    // "POP",
    // "Lighing AC Piping",
    // "Other",
  ]);

  // const handleCategoryChange = (category) => {
  //   setVisitCategory(category);
  //   if (category === "Interior Work") {
  //     setVisitOptions([
  //       "Civil Work",
  //       "Electrical Work",
  //       "Carpenter Work",
  //       "POP",
  //       "Lighing AC Piping",
  //       "Other",
  //     ]);
  //   } else if (category === "Civil Work") {
  //     setVisitOptions(["Center Line", "PVC", "Progress", "DP", "BUC", "Other"]);
  //   }
  // };
  const handleCategoryChange = (category) => {
    setVisitCategory(category);
    if (category === "42") {
      setVisitOptions([
        // "Center Line", "PVC", "Progress", "DP", "BUC", "Other"
      ]);
      setSites((prevState) => ({
        ...prevState,
        types: "42",
      }));
    } else if (category === "43") {
      setVisitOptions([
        // "Civil Work",
        // "Electrical Work",
        // "Carpenter Work",
        // "POP",
        // "Lighting AC Piping",
        // "Other",
      ]);
      setSites((prevState) => ({
        ...prevState,
        types: "43", // Set the value directly
      }));
    }
  };

  const handleOtherInputChange = (event) => {
    setOtherInputValue(event.target.value);
    handleInput(event);
  };

  const handleVisitOptionChange = (id) => {
    setSelectedMasterTypeID(id);
    setOtherInputVisible(id == 6 || id == 12); // Assuming id 6 and 12 correspond to "Other" options

    // Store the id in the mst_inspection_checklist_id field
    setSites((prevState) => ({
      ...prevState,
      mst_inspection_checklist_id: id,
      // mst_type_id: types,
    }));

    if (id !== 6 && id !== 12) {
      setOtherInputValue(""); // Clear the other input value when changing options
    }
    console.log("Selected id:", id);
    // console.log("masterTypeID",)
  };

  const fetchChecklist = async () => {
    try {
      const response = await axios.get(getchecklist.url, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.data?.error) {
        setChecklistData(response.data?.data);
        const masterTypeOptions = response.data?.data.map((item) => ({
          id: item.id,
          types: item.mst_type_id,
          title: item.title,
        }));
        setMasterTypes(masterTypeOptions);
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      console.error(error);
      // Handle error cases here (e.g., toast.error or console.log)
    }
  };

  const getEmployees = async () => {
    try {
      // const res = await GetEmployees(`${getToken()}`);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        header,
        fetchActiveEmployee.method,
        fetchActiveEmployee.url
      );
      if (!res.data.error) {
        const payload = res.data?.data;
        if (Array.isArray(payload) && payload.length) {
          setEmployees(payload);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers(getToken());
      if (!res.data.error) {
        const custData = res.data?.data;
        custData ? setCustData(custData) : "";
      } else {
        toast.error(res.data?.message);
      }
    } catch (err) {
      console.log(err);
      if (err.response.request.status === 501) {
        toast.error("Internal server error");
      } else if (err.response.data?.error) {
        toast.error(err.response.data?.message);
      }
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await GetFile(`${getToken()}`);
      if (!res.data.error) {
        setFile(res.data.data);
      } else {
        toast.error(res.data.message);
        navigate(`/${login.page}`, {
          state: { from: location },
          replace: true,
        });
      }
    } catch (err) {
      console.log(err);
      if (err.response.data.error) {
        toast.error(err.response.data.message);
        navigate(`/${login.page}`, {
          state: { from: location },
          replace: true,
        });
      }
    }
  };

    const handleFileSelect = (event) => {
    const selectedFileId = event.target.value;
    setSelectedFileId(selectedFileId);
    fetchFileDataById(selectedFileId);
    handleInput(event);
  };

    const fetchFileDataById = async (fileId) => {
    try {
      const response = await axios.get(`${getfileDatabyId.url}/${fileId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.data?.error) {
        // Process the file data from the API response
        const fileData = response?.data?.data[0];
        setFileData(fileData);
        console.log("res===>", filedata);
        // Update the state or do whatever you need with the file data
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      console.error(error);
      // Handle error cases here (e.g., toast.error or console.log)
    }
  };

  useEffect(() => {
    if (sites.mst_file_project_id) {
      fetchFileDataById(sites.mst_file_project_id);
    }
  }, [sites.mst_file_project_id]);
  

  
  useEffect(() => {
    fetchFiles();
    fetchCustomers();
    fetchChecklist();
    getEmployees();
  }, []);

  const goBack = () => {
    navigate(`/${SiteRoute.list}`);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;

    console.log(`Input changed - name: ${name}, value: ${value}`);
    showValidationMessage(true);

    setSites((prevState) => {
      return { ...prevState, [name]: value };
    });
  };

  const onFileInput = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;

    console.log(`File input changed - name: ${name}, file:`, file);
    setSites((prevState) => {
      return { ...prevState, [name]: file };
    });
  };

  const sitesData = async () => {
    try {
      setLoading(true);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-Type"]: "application/json",
      };
      const res = await ApiService(
        null,
        parseInt(params?.id),
        header,
        getsitesbyid.method,
        getsitesbyid.url
      );
      if (!res.data.error) {
        setLoading(false);
        const sites_data = res.data.data[0];
        setSites((prevState) => {
          return {
            ...prevState,
            mst_type_id: sites_data?.mst_type_id ? sites_data?.mst_type_id : "",
            mst_inspection_checklist_id: sites_data?.mst_inspection_checklist_id
              ? sites_data?.mst_inspection_checklist_id
              : "",
            mst_file_project_id: sites_data?.mst_file_project_id
              ? sites_data?.mst_file_project_id
              : "",
            others_text: sites_data?.others_text ? sites_data?.others_text : "",
            client_id: sites_data?.client_id ? sites_data?.client_id : "",
            key_observation: sites_data?.key_observation
              ? sites_data?.key_observation
              : "",
            remarks: sites_data?.remarks ? sites_data?.remarks : "",
            site_incharge: sites_data?.site_incharge
              ? sites_data?.site_incharge
              : "",
            authorized_person: sites_data?.authorized_person
              ? sites_data?.authorized_person
              : "",
            review_by: sites_data?.review_by ? sites_data?.review_by : "",
            // description: sites_data?.description,
            created_at: sites_data?.created_at
              ? GetDate(sites_data?.created_at, "YYYY-MM-DD")
              : todayDate(),
          };
        });

        // setImageUrls({
        //   client_sign: sites_data?.client_sign ? sites_data?.client_sign : "",
        //   review_by_sign: sites_data?.review_by_sign ? sites_data?.review_by_sign : "",

        // });
      } else {
        setLoading(false);
        toast.error(res.data.message);
        navigate(`/${SiteRoute.list}`, {
          state: { from: location },
          replace: true,
        });
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      if (err.response.data.error) {
        toast.error(err.response.data.message);
      }
    }
  };

  useEffect(() => {
    sitesData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validator.allValid()) {
      showValidationMessage(true);
      return;
    }

    const formData = new FormData();

    for (const key of Object.keys(sites)) {
      formData.append(key, sites[key]);
    }

    console.log("formdata======>", formData);

    for (var pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    formData.append("id", params.id);

    try {
      setLoading(true);
      // const res = await AddFilesites(formData,`${getToken()}`);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-Type"]: "multipart/form-data",
      };
      const res = await ApiService(
        formData,
        0,
        header,
        updatesites.method,
        updatesites.url
      );
      if (!res.data?.error) {
        toast.success(res.data?.message);
        setLoading(false);
        showValidationMessage(false);
        navigate(`/${SiteRoute.list}`);
      } else {
        setLoading(false);
        toast.error(res.data?.message);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error(err.response.data?.message);
    }
  };

  return (
    <div className="content__wrapper">
      <section className="page-content">
        <div className="page-title mobile-title">
          <h1 className="h4 mb-0">Edit</h1>
          <p className="mb-4">Site Inspection</p>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="card p-5">
              <div className="card-header bg-transparent border-0 mb-5 p-0">
                <div className="row align-items-center justify-content-between">
                  <div className="col-md-6">
                    <h6 className="title-line text-shadow-yellow mb-0 pb-3">
                      Edit Site Inspection
                    </h6>
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                {!loading ? (
                  <form onSubmit={handleSubmit} className="padding_space">
                    <div className="row">
                      <div className="col">
                        <label htmlFor="">Visit Category</label>
                        <div>
                          <label style={{ marginRight: "10px" }}>
                            <input
                              type="radio"
                              name="mst_type_id"
                              checked={sites.mst_type_id == "42"} // Use sites.types to check the selected option
                              onChange={() => {
                                handleCategoryChange("Civil Work");
                                handleVisitOptionChange("Civil Work", "42");
                                handleInput({
                                  target: { name: "mst_type_id", value: "42" },
                                });
                              }}
                            />
                            Civil Work
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="mst_type_id"
                              checked={sites.mst_type_id == "43"} // Use sites.types to check the selected option
                              onChange={() => {
                                handleCategoryChange("Interior Work");
                                handleVisitOptionChange("Interior Work", "43");
                                handleInput({
                                  target: { name: "mst_type_id", value: "43" },
                                });
                              }}
                            />
                            Interior Work
                          </label>
                        </div>
                      </div>
                      <div className="form-group col">
                        <label htmlFor="filename">Date*</label>
                        <input
                          type="date"
                          name="date"
                          className="form-control"
                          onChange={handleInput}
                          id="date"
                          value={sites.date}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div class="form-group col-md-6 col-sm-6">
                        <label htmlFor="client_id">Client Name*</label>
                        <select
                          className="form-control custom-select"
                          name="client_id"
                          onChange={handleInput}
                          value={sites.client_id}
                        >
                          <option value="">--Select--</option>
                          {custData.map((row) => (
                            <option value={row.id}>
                              {row.first_name} {row.last_name}
                            </option>
                          ))}
                        </select>
                        <span className="text-danger">
                          {validator.message(
                            "client_id",
                            sites.client_id,
                            "required"
                          )}
                        </span>
                      </div>

                      <div className="form-group col">
                        <label htmlFor="filename">File Name*</label>
                        <select
                          name="mst_file_project_id"
                          id="mst_file_project_id"
                          className="form-control"
                           onChange={(e) => handleFileSelect(e)}
                          value={sites.mst_file_project_id}
                        >
                          <option value="">Select File Name</option>
                          {file.map((file) => (
                            <option value={file.id}>{file.file_name}</option>
                          ))}
                        </select>
                        {validator.message(
                          "File",
                          sites.mst_file_project_id,
                          "required",
                          { className: "text-danger" }
                        )}
                      </div>
                    </div>
                    <div className="row">
                      {/* <div className="card">
                        <div className="card-header">
                          {visitCategory} Options
                        </div>
                        <div className="card-body">
                          {visitOptions.map((option, index) => (
                            <label style={{ marginRight: "10px" }} key={index}>
                              <input type="radio" name="VisitWork" /> {option}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div> */}
                      <div className="card col-md-6">
                        <div className="card-header">
                          {visitCategory} Options
                        </div>
                        <div className="card-body">
                          {/* {visitOptions.map((option, index) => (
                            <label style={{ marginRight: "10px" }} key={index}>
                              <input
                                type="radio"
                                name="VisitWork"
                                value={option}
                                onChange={(e) => {
                                  handleVisitOptionChange(option);
                                  handleInput(e);
                                }}
                              />
                              {option}
                              {option === "Other" && otherInputVisible && (
                                <input
                                  type="text"
                                  className="mx-2"
                                  placeholder="Type here...."
                                  value={otherInputValue}
                                  onChange={handleOtherInputChange}
                                />
                              )}
                            </label>
                          ))} */}

                          {masterTypes.map((item, index) => (
                            <div
                              key={index}
                              style={{
                                display:
                                  item.types == sites.mst_type_id
                                    ? "block"
                                    : "none",
                              }}
                            >
                              <label style={{ marginRight: "10px" }}>
                                <input
                                  type="radio"
                                  name="mst_inspection_checklist_id"
                                  value={item.id}
                                  // checked={selectedMasterTypeID == item.id}
                                  checked={
                                    item.id ===
                                    sites.mst_inspection_checklist_id
                                  } // Check the selected master type
                                  onChange={() =>
                                    handleVisitOptionChange(item.id, item.types)
                                  }
                                />
                                {item.title}
                                {(item.id === 6 || item.id === 12) &&
                                  otherInputVisible && (
                                    <input
                                      type="text"
                                      className="mx-2"
                                      name="others_text"
                                      placeholder="Type here...."
                                      value={otherInputValue}
                                      onChange={handleOtherInputChange}
                                    />
                                  )}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="office_main_box col-md-6">
                        <span className="box_heading ">
                          Office no. {filedata?.office_file_no}
                        </span>
                        <h2 className="tps_heading">
                          {filedata?.tps_no || "N/A"}
                        </h2>
                        <div className="row office_box_row">
                          <div className="office_box col">
                            <span className="box_miniheading">Block No.</span>
                            <h5>{filedata?.rs_block_no_text || "N/A"}</h5>
                          </div>
                          <div className="office_box col text-right">
                            <span className="box_miniheading">File Code</span>
                            <h5>{filedata?.file_name || "N/A"}</h5>
                          </div>
                        </div>
                        <div className="row office_box_row">
                          <div className="office_box col">
                            <span className="box_miniheading">T.P.S. No.</span>
                            <h5>{filedata?.tps_no || "N/A"}</h5>
                          </div>
                          <div className="office_box col text-right">
                            <span className="box_miniheading">F.P. No.</span>
                            <h5>{filedata?.fp_no || "N/A"}</h5>
                          </div>
                        </div>
                        <div className="row office_box_row mb-0">
                          <div className="office_box col">
                            <span className="box_miniheading">Ward No.</span>
                            <h5>{filedata?.ward_no || "N/A"}</h5>
                          </div>
                          <div className="office_box col text-right">
                            <span className="box_miniheading">C.S. No.</span>
                            <h5>{filedata?.cs_no || "N/A"}</h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group col-md-6">
                        <label htmlFor="key_observation">Key Observation</label>
                        <textarea
                          name="key_observation"
                          id="key_observation"
                          placeholder="Type here...."
                          cols="30"
                          rows="5"
                          className="form-control"
                          onChange={handleInput}
                          value={sites.key_observation}
                        ></textarea>
                        {validator.message(
                          "Key Observation",
                          sites.key_observation,
                          "required",
                          { className: "text-danger" }
                        )}
                      </div>
                      <div className="form-group col-md-6">
                        <label htmlFor="remarks">Remark</label>
                        <textarea
                          name="remarks"
                          id="remarks"
                          value={sites.remarks}
                          placeholder="Type here...."
                          cols="30"
                          rows="5"
                          className="form-control"
                          onChange={handleInput}
                        ></textarea>
                        {validator.message(
                          "remarks",
                          sites.remarks,
                          "required|max:255",
                          { className: "text-danger" }
                        )}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="site_incharge">Site Incharge</label>
                          <input
                            type="text"
                            name="site_incharge"
                            id="site_incharge"
                            placeholder="Enter Name"
                            className="form-control"
                            onChange={handleInput}
                            value={sites.site_incharge}
                          />
                          {validator.message(
                            "Site Incharge",
                            sites.site_incharge,
                            "required",
                            { className: "text-danger" }
                          )}{" "}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="authorized_person">
                            Client/Authorized Person
                          </label>
                          <input
                            type="text"
                            name="authorized_person"
                            id="authorized_person"
                            placeholder="Enter Name"
                            className="form-control"
                            onChange={handleInput}
                            value={sites.authorized_person}
                          />
                          {validator.message(
                            "Authorized Person",
                            sites.authorized_person,
                            "required",
                            { className: "text-danger" }
                          )}{" "}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="review_by">Reviewed By</label>
                          <select
                            type="text"
                            name="review_by"
                            id="review_by"
                            className="form-control"
                            value={sites?.review_by}
                            onChange={handleInput}
                          >
                            <option value={""}>--Select--</option>
                            {employees.map((data) => (
                              <option key={data.id} value={data.id}>
                                {data.first_name} {data.last_name}
                              </option>
                            ))}
                          </select>
                          {validator.message(
                            "Reviewed By",
                            sites.review_by,
                            "required",
                            { className: "text-danger" }
                          )}{" "}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <label htmlFor="client_sign">Client Signature</label>
                        <input
                          type="file"
                          name="client_sign"
                          id="client_sign"
                          style={{ height: "auto" }}
                          onChange={onFileInput}
                          className="form-control"
                        ></input>
                        <span className="text-danger"></span>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="review_by_sign">
                          Authorized Person Signature
                        </label>
                        <input
                          type="file"
                          name="review_by_sign"
                          id="review_by_sign"
                          style={{ height: "auto" }}
                          onChange={onFileInput}
                          className="form-control"
                        ></input>
                        <span className="text-danger"></span>
                      </div>
                    </div>
                    <br />
                    <div className="row">
                      <div className="form-group mb-0 col-md-2">
                        <button type="submit" className="btn">
                          Submit
                        </button>
                      </div>
                      <div className="form-group mb-0 col-md-4">
                        <button type="button" onClick={goBack} className="btn">
                          Back
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <Loader
                    type="spinner-default"
                    bgColor={"#000000"}
                    title={"Please wait"}
                    color={"#000000"}
                    size={50}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Preview;
