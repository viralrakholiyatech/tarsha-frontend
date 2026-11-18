import React, { useEffect, useState } from "react";
import {
  getFileDocumentJson,
  fetchFileDetails,
} from "../../../../config/config";
import ApiService from "../../../../services/ApiService";
import { getDocumentMaster } from "../../../../services/DocumentMasterService";
import { updateFileDocumentJson } from "../../../../services/FileService";
import {
  getRole,
  getToken,
  superAccess,
} from "../../../../services/useLocalStorage";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import {
  customerKey,
  HoD,
  adminKey,
  empKey,
} from "../../../../config/RoleConfig";

const RequiredDocumentList = (props) => {

  const [card, setCard] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      id: props.id,
      file_document_json: checkedValues,
      is_save: is_save,
      remark_by_hod: document.getElementById("remark_by_hod").value,
      remark_by_emp: document.getElementById("remark_by_emp").value,
      approved_by_hod: selectedOptions,
      date: startDate,
      card:card,
    };
    console.log("data-->", data);

    try {
      setLoading(true);
      const res = await updateFileDocumentJson(data, getToken());
      if (!res.data.error) {
        toast.success(res.data.message);
        setLoading(false);
        if (data?.is_save) {
          setFormDisabled(data.is_save);
          props.onUpdateMstStage(3);
          props.onchangeStage(3);
        }
      } else {
        toast.error(res.data.message);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      if (err.response.data.error) {
        toast.error(err.response.data.message);
      }
    }
  };

  const [documents, setDocuments] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState("");
  const [checkedValues, setCheckedValues] = useState({});
  const [is_save, setIsSave] = useState(1);
  const [formDisabled, setFormDisabled] = useState(1);
  const [loading, setLoading] = useState(false);
  const [remarkByHod, setRemarkByHod] = useState("");
  const [remarkByEmp, setRemarkByEmp] = useState("");
  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");

  const fetchDocumentMaster = async () => {
    try {
      setLoading(true);
      const res = await getDocumentMaster("File", getToken());
      // console.log("res==>", res);

      if (res && res.data) {
        const datafile = res.data.data;
        setLoading(false);
        setDocuments(datafile);
        await getFileJson();
      } else {
        setLoading(false);
        const obj = {};
        datafile.map((val) => {
          obj[val.id] = 0;
        });
        setCheckedValues(obj);
      }
    } catch (err) {
      setLoading(false);
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        console.error(err);
      }
    }
  };

  const handleInput = (e) => {
    const name = e.target.name.split("_")[1];
    const checked = e.target.checked;

    setCheckedValues((prevState) => ({
      ...prevState,
      [name]: checked ? 1 : 0,
    }));
  };

  const getFileJson = async () => {
    try {
      setLoading(true);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-type"]: "application/json",
      };
      const res = await ApiService(
        null,
        props.id,
        header,
        getFileDocumentJson.method,
        getFileDocumentJson.url
      );
      const jsonString = JSON.stringify(res.data.data);
      const datas = res.data.data;
      console.log("data-->", datas);
      if (typeof jsonString != "undefined") {
        setLoading(false);
        const object = JSON.parse(JSON.parse(jsonString)["file_document_json"]);
        const isSave = JSON.parse(JSON.parse(jsonString)["is_save"]);
        // console.log("object--->",object[0].created_at.substring(0, 10))
        setendDate(object[0]?.created_at?.substring(0, 10));
        setCard(datas?.card)
        setFormDisabled(
          typeof isSave != "undefined" && typeof parseInt(isSave) == "number"
            ? parseInt(isSave)
            : 0
        );

        // setSelectedOptions(datas.approved_by_hod === 1 ? "Yes" : "No");
        // setRemarkByHod(datas.remark_by_hod || "");
        // setRemarkByEmp(datas.remark_by_emp || "");

        for (let data of object) {
          setCheckedValues((prevState) => ({
            ...prevState,
            [data["mst_document_id"]]: data["checked"],
          }));
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      alert(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  };

  //   useEffect(() => {
  //     if (!loading) {
  //       if ([customerKey].includes(getRole())) {
  //         document.getElementById("fieldset").disabled = true;
  //       } else {
  //         /*Temperatory*/
  //         if (superAccess()) {
  //           document.getElementById("fieldset").disabled = false;
  //         } else {
  //           document.getElementById("fieldset").disabled = formDisabled
  //             ? true
  //             : false;
  //         }
  //       }
  //     }
  //   }, [formDisabled, loading]);

  const getFileDetails = async () => {
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        props?.id,
        header,
        fetchFileDetails.method,
        fetchFileDetails.url
      );
      console.log("API Response:", res);

      if (!res.data.error) {
        setLoading(false);
        const data =
          Object.keys(res?.data?.data).length === 0
            ? undefined
            : res?.data?.data;

        const startDates = data.created_at.substring(0, 10);

        setstartDate(startDates);
      } else {
      }
    } catch (err) {
      setLoading(false);
      if (err.response.data.error) {
        toast.error(err.response.data.message);
      }
    }
  };

  useEffect(() => {
    fetchDocumentMaster();
    getFileDetails();
  }, []);

  const handleOptionsChanges = (e) => {
    setSelectedOptions(e.target.value);
  };
  return (
    <>
      <div class="grey-border rounded">
        <div class="card-header bg-white d-flex align-items-center justify-content-between">
          <h5 class="mb-0 font-weight-normal">Required Documents List</h5>
          <div className="d-flex align-items-center">
            <div className="form-group mr-3">
              <input type="date" className="form-control" value={startDate} />
            </div>
            <div className="form-group">
              <input
                type="date"
                className="form-control"
                name="endDate"
                value={endDate}
              />
               <div className="text-right">
                {superAccess() ? (
                  <select
                    name="card_no"
                    id="card_no"
                    className="form-control"
                    value={card}
                    onChange={(e) => setCard(e.target.value)}
                  >
                    <option value={""}>--Select Card--</option>
                    <option value="green">Green</option>
                    <option value="red">Red</option>
                  </select>
                ) : (
                  <button class="status_btn red">{card}</button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div class="card-body bg-white rounded-bottom p-3">
          <form onSubmit={handleSubmit}>
            {!loading ? (
              <fieldset id="fieldset">
                <div className="table-responsive mt-3">
                  <table className="table">
                    <thead className="grey__head">
                      <tr>
                        {/* <th width="10%">No.</th> */}
                        <th width="90%">Details</th>
                        {/* <th width="20%">Types</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((data, index) => (
                        <tr key={index}>
                          {/* <td width="10%">{index+1}</td> */}
                          <td width="90%">
                            <div className="form-check form-check-inline">
                              <input
                                type="checkbox"
                                onChange={handleInput}
                                checked={
                                  typeof checkedValues[data.id] !=
                                    "undefined" && checkedValues[data.id] == 1
                                }
                                name={`${props.id}_${data.id}_document`}
                                id={`${props.id}_${data.id}_document`}
                                className="form-check-input"
                              />
                              &nbsp;
                              <label
                                className="form-check-label"
                                htmlFor={`${props.id}_${data.id}_document`}
                              >
                                {data.doc_name}
                              </label>
                            </div>
                          </td>
                          {/* <td width="20%">{data.types==1 ? "Original" : "Xerox"}</td> */}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot></tfoot>
                  </table>
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="remark_by_emp">
                          Remark By(Assign to Name)
                        </label>
                        <textarea
                          type="text"
                          name="remark_by_emp"
                          id="remark_by_emp"
                          className="form-control"
                          placeholder="Enter Your Remark"
                          rows={3}
                          value={remarkByEmp}
                          onChange={(e) => setRemarkByEmp(e.target.value)}
                          disabled={getRole() === adminKey && HoD !== ""}
                        />
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="remark_by_hod">Remark By(hod)</label>
                        <textarea
                          type="text"
                          name="remark_by_hod"
                          id="remark_by_hod"
                          className="form-control"
                          placeholder="Enter Your Remark"
                          rows={3}
                          value={remarkByHod}
                          onChange={(e) => setRemarkByHod(e.target.value)}
                          disabled={getRole() === empKey}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="form-group col-md-6">
                      <label>Approved By HOD</label>
                      <input
                        type="radio"
                        value="Yes"
                        checked={selectedOptions === "Yes"}
                        onChange={handleOptionsChanges}
                        disabled={getRole() === empKey}
                      />
                      Yes
                      <input
                        type="radio"
                        value="No"
                        checked={selectedOptions === "No"}
                        onChange={handleOptionsChanges}
                        disabled={getRole() === empKey}
                      />
                      No
                    </div>
                  </div>
                </div>

                <div className="row">
                  {superAccess() ? (
                    <>
                      <div className="col">
                        <button
                          className="btn btn-success"
                          onClick={() => setIsSave(0)}
                          name="btnSubmit"
                        >
                          Save
                        </button>
                      </div>

                      {!formDisabled ? (
                        <div className="col">
                          <button
                            className="btn btn-success"
                            onClick={() => setIsSave(1)}
                            name="btnSubmitAndContinue"
                          >
                            Save & Next
                          </button>
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  ) : !formDisabled && [empKey].includes(getRole()) ? (
                    <>
                      <div className="col">
                        <button
                          className="btn btn-success"
                          onClick={() => setIsSave(0)}
                          name="btnSubmit"
                        >
                          Save
                        </button>
                      </div>
                      <div className="col">
                        <button
                          className="btn btn-success"
                          onClick={() => setIsSave(1)}
                          name="btnSubmitAndContinue"
                        >
                          Save & Next
                        </button>
                      </div>
                    </>
                  ) : (
                    ""
                  )}

                  <div className="col"></div>
                </div>
              </fieldset>
            ) : (
              <Loader
                type="spinner-default"
                bgColor={"#000000"}
                title={"Please wait"}
                color={"#000000"}
                size={50}
              />
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default RequiredDocumentList;
