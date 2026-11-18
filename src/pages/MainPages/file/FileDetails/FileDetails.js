import React, { useState, useEffect, useCallback } from "react";
import {
  getRole,
  getToken,
  getUserRoles,
  superAccess,
} from "../../../../services/useLocalStorage";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import {
  adminKey,
  HoD,
  customerKey,
  empKey,
} from "../../../../config/RoleConfig";
import { useForm } from "react-hook-form";
import {
  displayError,
  formclass,
} from "../../../../services/ValidationService";
import ApiService from "../../../../services/ApiService";
import {
  changeFileDetails,
  fetchFileDetails,
  skipFileDetails,
  fetchActiveEmployee,
} from "../../../../config/config";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AuthHeader } from "../../../../services/FormCommon";
import { getFileById } from "../../../../services/FileService";
import { GetDate } from "../../../../services/DateAndTimeService";

const FileDetails = (props) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
    reset,
    trigger,
  } = useForm({
    mode: "onChange",
  });

  const [selectedOptions, setSelectedOptions] = useState("");
  const [date, setDate] = useState("");
  const [card, setCard] = useState("");
  console.log("Selected date:", date);

  const onSubmit = useCallback(
    async (data) => {
      const fileDetailData = {
        ...data,
        mst_file_id: props?.id,
        approved_by_hod: selectedOptions,
        date: date,
        card:card,
      };

      console.log("=====>", fileDetailData);

      try {
        setLoading(true);
        const header = { Authorization: `Bearer ${getToken()}` };
        const res = await ApiService(
          fileDetailData,
          0,
          header,
          changeFileDetails.method,
          changeFileDetails.url
        );
        if (!res.data.error) {
          setLoading(false);
          toast.success(res?.data?.message);
          if (fileDetailData?.is_save == 1) {
            setSubmittable(1);
            props.onUpdateMstStage(2);
            props.onchangeStage(2);
            props.onchangePlotValidationTypes(details?.tps_stage);
          }
        } else {
          setIsSave(0);
          toast.error(res?.data?.message ? res?.data?.message : "Server Error");
          setLoading(false);
        }
      } catch (err) {
        setIsSave(0);
        console.log(err);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Server Error"
        );
      }
    },
    [date, selectedOptions,card]
  );
  const [hod, setHod] = useState("");
  const [land, setLand] = useState("");

  const initialDetails = {
    office_file_no: "",
    land_detail: land,
    hod: hod,
    assign_to: "",
    google_location: "",
    mst_file_id: props.id,
    smc_case_app_id: "",
    village: "",
    taluka: "",
    district: "",
    rs_block_no: "1",
    rs_block_no_text: "",
    ward_no: "",
    tika_moje_no: "1",
    tika_moje_no_text: "",
    cs_no: "",
    tps_no: "",
    tps_stage: "",
    op_no: "",
    fp_no: "",
    subplot_no: "",
    is_save: 0,
    remark_by_assign_to: "",
    remark_by_hod: "",
    approved_by_hod: selectedOptions,
    date: date,
  };

  const params = useParams();

  const [details, setDetails] = useState(() => initialDetails);

  const [isSubmittable, setSubmittable] = useState(1);
  const [is_save, setIsSave] = useState(0);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [endDate, setendDate] = useState("");

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
        console.log("res--<", res);

        if (data) {
          setSubmittable(
            parseInt(data?.is_save) != NaN ? parseInt(data?.is_save) : 0
          );
          props.onchangePlotValidationTypes(data?.tps_stage);
          setSelectedOptions(data.approved_by_hod === 1 ? "Yes" : "No");
          const endDate = data.created_at.substring(0, 10);
          4;

          setendDate(endDate);
          setCard(data.card);
          reset({
            smc_case_app_id: data?.smc_case_app_id,
            village: data?.village,
            office_file_no: data?.office_file_no,
            google_location: data?.google_location,
            taluka: data?.taluka,
            team_id: data?.team_id,
            remark_by_hod: data?.remark_by_hod,
            remark_by_assign_to: data?.remark_by_assign_to,
            district: data?.district,
            rs_block_no: data?.rs_block_no
              ? (data?.rs_block_no).toString()
              : "1",
            rs_block_no_text: data?.rs_block_no_text,
            ward_no: data?.ward_no,
            tika_moje_no: data?.tika_moje_no
              ? (data?.tika_moje_no).toString()
              : "1",
            tika_moje_no_text: data?.tika_moje_no_text,
            cs_no: data?.cs_no,
            tps_no: data?.tps_no,
            tps_stage: data?.tps_stage,
            op_no: data?.op_no,
            fp_no: data?.fp_no,
            subplot_no: data?.subplot_no,
          });
        }
      } else {
        setValue("rs_block_no", "1");
        setValue("tika_moje_no", "1");
        setLoading(false);
        setSubmittable(0);
      }
    } catch (err) {
      setLoading(false);
      if (err.response.data.error) {
        toast.error(err.response.data.message);
      }
    }
  };

  const onConfirmSaveAndNext = useCallback(async () => {
    const valid = await trigger();
    if (valid) {
      SwalAlert({
        confirmButtonText: "Continue",
        title: "Do you wanna save & continue?",
      })
        .then(async (result) => {
          if (result?.isConfirmed) {
            await onSubmit({
              ...getValues(),
              is_save: 1,
              mst_stage_id: 2,
              date: date,
              approved_by_hod: selectedOptions,
          
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [date, selectedOptions]);

  const fetchFile = async () => {
    try {
      const res = await getFileById(parseInt(params.id), getToken());
      if (!res.data?.error) {
        const fileData = JSON.parse(JSON.stringify(res.data.data[0]));
        console.log("fileData==>", fileData);

        setHod(fileData.hod_name);
        setLand(fileData.land_detail);
        setDate(fileData.dates);
      } else {
        toast.error(res.data?.message);
      }
    } catch (err) {
      console.log(`Edit.js(File)-${err}`);
      toast.error(err.response.data.message);
      navigate(`/${FilesRoute.list}`);
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

  useEffect(() => {
    console.log("Yes you are admin " + superAccess() + " ");
    getFileDetails();
    fetchFile();
    getEmployees();
  }, []);

  // useEffect(() => {
  //   if (!loading) {
  //     if ([customerKey].includes(getUserRoles())) {
  //       document.getElementById("fieldset").disabled = true;
  //     } else {
  //       /*Temperatory*/
  //       if (superAccess()) {
  //         document.getElementById("fieldset").disabled = false;
  //       } else {
  //         document.getElementById("fieldset").disabled = isSubmittable
  //           ? true
  //           : false;
  //       }
  //     }
  //   }
  // }, [isSubmittable, loading]);

  useEffect(() => {
    setDetails((prevState) => ({
      ...prevState,
      mst_stage_id: prevState.is_save ? 2 : 1,
    }));
  }, [details.is_save]);

  const handleOptionsChanges = (e) => {
    setSelectedOptions(e.target.value);
  };

  console.log("endDate==>", endDate);
  return (
    <>
      <div className="grey-border rounded">
        <div className="card-header bg-white d-flex align-items-center justify-content-between">
          <h5 className="mb-0 font-weight-normal">File Details</h5>
          <div className="d-flex  ">
            <div className="form-group mr-3">
              <input type="date" className="form-control" value={date} />
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
          {!loading ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset id="fieldset">
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="office_file_no">Office File No.</label>
                      <input
                        type="text"
                        name="office_file_no"
                        id="office_file_no"
                        className={formclass(errors?.office_file_no)}
                        placeholder="Enter No."
                        {...register("office_file_no", {
                          required: "Required",
                        })}
                      />
                      {displayError(errors?.office_file_no?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="land_detail">Land Details</label>
                      <input
                        type="text"
                        name="land_detail"
                        id="land_detail"
                        className="form-control"
                        value={land}
                        {...register("land_detail")}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="hod">HOD</label>
                      <input
                        type="text"
                        name="hod"
                        id="hod"
                        value={hod}
                        className="form-control"
                        {...register("hod")}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="team_id">Assign To</label>
                      <select
                        type="text"
                        name="team_id"
                        id="team_id"
                        className="form-control"
                        {...register("team_id")}
                        disabled={getRole() === empKey && HoD !== ""}
                      >
                        {" "}
                        <option value="">--Select--</option>
                        {employees.map((data) => (
                          <option key={data.id} value={data.id}>
                            {data.first_name} {data.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="smc_case_app_id">
                        SMC Case No./Application ID No
                      </label>
                      <input
                        type="text"
                        name="smc_case_app_id"
                        id="smc_case_app_id"
                        className={formclass(errors?.smc_case_app_id)}
                        placeholder="Enter No."
                        {...register("smc_case_app_id", {
                          required: "Required",
                        })}
                      />
                      {displayError(errors?.smc_case_app_id?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="google_location">Google Location</label>
                      <input
                        type="text"
                        name="google_location"
                        id="google_location"
                        className={formclass(errors?.google_location)}
                        placeholder="Enter No."
                        {...register("google_location", {
                          required: "Required",
                        })}
                      />
                      {displayError(errors?.smc_case_app_id?.message)}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="village">Village</label>
                      <input
                        type="text"
                        name="village"
                        id="village"
                        className={formclass(errors?.village)}
                        placeholder="Village"
                        {...register("village", {
                          required: "Required",
                        })}
                      />
                      {displayError(errors?.village?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="taluka">Taluka</label>
                      <input
                        type="text"
                        name="taluka"
                        id="taluka"
                        className={formclass(errors?.taluka)}
                        placeholder="Taluka"
                        {...register("taluka", {
                          required: "Required",
                        })}
                      />
                      {displayError(errors?.taluka?.message)}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="district">District</label>
                      <input
                        type="text"
                        name="district"
                        id="district"
                        className={formclass(errors?.district)}
                        placeholder="District"
                        {...register("district", {
                          required: "Required",
                        })}
                      />
                      {displayError(errors?.district?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="row">
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          name="rs_block_no"
                          id="rs_block_no1"
                          value="1"
                          className="form-check-input"
                          {...register("rs_block_no", { required: "Required" })}
                        />
                        <label
                          htmlFor="rs_block_no1"
                          className="form-check-label"
                        >
                          R.S No.
                        </label>
                      </div>

                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          name="rs_block_no"
                          id="rs_block_no2"
                          value="2"
                          className="form-check-input"
                          {...register("rs_block_no", { required: "Required" })}
                        />
                        <label
                          htmlFor="rs_block_no2"
                          className="form-check-label"
                        >
                          Block No.
                        </label>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="rs_block_no_text"></label>
                          <input
                            type="text"
                            className={formclass(errors?.rs_block_no_text)}
                            id="rs_block_no_text"
                            name="rs_block_no_text"
                            placeholder=""
                            {...register("rs_block_no_text", {
                              required: "Required",
                            })}
                          />
                          {displayError(errors?.rs_block_no_text?.message)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="ward_no">Ward No.</label>
                      <input
                        type="text"
                        name="ward_no"
                        id="ward_no"
                        className={formclass(errors?.ward_no)}
                        placeholder="Enter ward No."
                        {...register("ward_no", {
                          required: "Required",
                        })}
                      />
                      {displayError(errors?.ward_no?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="row">
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          name="tika_moje_no"
                          id="tika_moje_no1"
                          value="1"
                          className="form-check-input"
                          {...register("tika_moje_no", {
                            required: "Required",
                          })}
                        />
                        <label
                          htmlFor="tika_moje_no1"
                          className="form-check-label"
                        >
                          Tika No.
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          name="tika_moje_no"
                          id="tika_moje_no2"
                          value="2"
                          className="form-check-input"
                          {...register("tika_moje_no", {
                            required: "Required",
                          })}
                        />
                        <label
                          htmlFor="tika_moje_no2"
                          className="form-check-label"
                        >
                          Moje
                        </label>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="tika_moje_no_text"></label>
                          <input
                            type="text"
                            id="tika_moje_no_text"
                            name="tika_moje_no_text"
                            placeholder=""
                            className={formclass(errors?.tika_moje_no_text)}
                            {...register("tika_moje_no_text", {
                              required: "Required",
                            })}
                          />
                          {displayError(errors?.tika_moje_no_text?.message)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="cs_no">C.S. No.</label>
                      <input
                        type="text"
                        name="cs_no"
                        id="cs_no"
                        className={formclass(errors?.cs_no)}
                        {...register("cs_no", {
                          required: "Required",
                        })}
                        placeholder="Enter C.S No."
                      />
                      {displayError(errors?.cs_no?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="tps_no">T.P.S. No.</label>
                      <input
                        type="text"
                        name="tps_no"
                        id="tps_no"
                        className={formclass(errors?.tps_no)}
                        {...register("tps_no", {
                          required: "Required",
                        })}
                        placeholder="Enter T.P.S No."
                      />
                      {displayError(errors?.tps_no?.message)}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="tps_stage">T.P.S. Stage</label>
                      <select
                        name="tps_stage"
                        id="tps_stage"
                        className={formclass(errors?.tps_stage)}
                        {...register("tps_stage", { required: "Required" })}
                      >
                        <option value="">--select--</option>
                        <option value="1">Draft</option>
                        <option value="2">Final</option>
                        <option value="3">Non TP</option>
                      </select>
                      {displayError(errors?.tps_stage?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="op_no">O.P. No.</label>
                      <input
                        type="text"
                        id="op_no"
                        name="op_no"
                        className={formclass(errors?.op_no)}
                        placeholder="Enter O.P No."
                        {...register("op_no", {
                          required: "Required",
                        })}
                      />
                      {displayError(errors?.op_no?.message)}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="fp_no">F.P. No.</label>
                      <input
                        type="text"
                        name="fp_no"
                        id="fp_no"
                        className={formclass(errors?.fp_no)}
                        placeholder="Enter F.P. No."
                        {...register("fp_no", {
                          required: "Required",
                        })}
                      />
                      {displayError(errors?.fp_no?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="subplot_no">Subplot No.</label>
                      <input
                        type="text"
                        name="subplot_no"
                        id="subplot_no"
                        className={formclass(errors?.subplot_no)}
                        placeholder="Enter Subplot No."
                        {...register("subplot_no", {
                          required: "subplot_no",
                        })}
                      />
                      {displayError(errors?.subplot_no?.message)}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="remark_by_assign_to">
                        Remark By(Assign to Name)
                      </label>
                      <textarea
                        type="text"
                        name="remark_by_assign_to"
                        id="remark_by_assign_to"
                        className="form-control"
                        placeholder="Enter Your Remark"
                        rows={3}
                        {...register("remark_by_assign_to")}
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
                        {...register("remark_by_hod")}
                        disabled={getUserRoles() === empKey}
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
                      disabled={getUserRoles() === empKey}
                    />
                    Yes
                    <input
                      type="radio"
                      value="No"
                      checked={selectedOptions === "No"}
                      onChange={handleOptionsChanges}
                      disabled={getUserRoles() === empKey}
                    />
                    No
                  </div>
                </div>

                <div className="row" style={{ justifyContent: "space-around" }}>
                  {superAccess() ? (
                    <>
                      <button
                        className="btn btn-primary"
                        type="submit"
                        value={0}
                        {...register("is_save")}
                      >
                        Save
                      </button>

                      {!isSubmittable ? (
                        <>
                          <button
                            className="btn btn-primary"
                            type="button"
                            value={1}
                            onClick={() => onConfirmSaveAndNext()}
                          >
                            Save & Next2
                          </button>
                        </>
                      ) : (
                        ""
                      )}
                    </>
                  ) : !isSubmittable && [empKey].includes(getRole()) ? (
                    <> <button
                    className="btn btn-primary"
                    type="submit"
                    value={0}
                    {...register("is_save")}
                  >
                    Save
                  </button>

                  <button
                    className="btn btn-primary"
                    type="button"
                    value={1}
                    onClick={() => onConfirmSaveAndNext()}
                  >
                    Save & Next1
                  </button></>
                  ) : (
                    ""
                  )}
                 
                </div>
              </fieldset>
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
    </>
  );
};

export default FileDetails;
