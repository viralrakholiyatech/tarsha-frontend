import React, { useCallback, useEffect, useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  AuthHeader,
  displayFormData,
  isValidJson,
} from "../../../../services/FormCommon";
import {
  displayError,
  formclass,
} from "../../../../services/ValidationService";
import {
  closeButtonSvg,
  dustbinButton,
  eyeButtonSvg,
  FileUrl,
} from "../../../../config/file_url";
import {
  deleteSiteCondition,
  getProjectDirection,
  locationbyid,
  updatelocation,
  addlocation,
  getlocation,
} from "../../../../config/config";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import { ReactSVG } from "react-svg";
import {
  getRole,
  getToken,
  getUserRoles,
  superAccess,
} from "../../../../services/useLocalStorage";
import ApiService from "../../../../services/ApiService";

const SiteLocation = () => {
  const formname = "userform";


  const params = useParams();
  const mst_file_id = params.id;

  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState("");
  const [currentInputValue, setCurrentInputValue] = useState("");
  const [currentHiddenId, setCurrentHiddenId] = useState("");
  const [eastimage, setEastImage] = useState(null);
  const [westimage, setWestImage] = useState(null);
  const [southimage, setSouthImage] = useState(null);
  const [northimage, setNorthImage] = useState(null);
  const [selecdImage, setSelectedImage] = useState(null);
  const [selectedeastimage, setSelectedEastImage] = useState(null);
  const [westSelectedimage, setSelectedWestImage] = useState(null);
  const [southSelectedimage, setSelectedSouthImage] = useState(null);
  const [northSelectedimage, setSelectedNorthImage] = useState(null);

  const {
    register,
    control,
    reset,
    getValues,
    trigger,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: "onChange",
  });

  const { append, remove, fields } = useFieldArray({
    name: formname,
    control,
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    console.log("Input changed:", event.target.name, event.target.value);

    // Check if the input field has a corresponding hidden ID
    const hiddenIdElement = document.getElementById(`${name}_direction`);
    // const hiddenId = hiddenIdElement ? hiddenIdElement.value : "";

    setCurrentInputValue(value);
    setCurrentHiddenId(hiddenId);

    console.log("Current Input Value:", value);
    console.log("Current Hidden ID:", hiddenId);

    // You can also perform additional actions here if needed
  };

  const initialFormValue = {
    project_detail_id: "",
    east: "",
    direction: "",
    mst_file_id:"",
    east_wide: "",
    project_detail_id: "",
    west: "",
    west_direction: "",
    west_wide: "",
    project_detail_id: "",
    south: "",
    south_direction: "",
    south_wide: "",
    project_detail_id: "",
    north: "",
    north_direction: "",
    north_wide: "",
    google_image_file: "",
  };
  useEffect(() => {
    const storedSelectedCheckboxes = localStorage.getItem("selectedCheckboxes");

    if (storedSelectedCheckboxes !== null) {
      const selectedCheckboxes = JSON.parse(storedSelectedCheckboxes);

      console.log("Retrieved Selected Checkbox Value:", selectedCheckboxes);

      setSelectedCheckboxes(selectedCheckboxes);
    } else {
      console.log("No selected checkboxes found in local storage");
    }
  }, []);

  const oneastInput = (e) => {
    const file = e.target.files[0];
    setValue("east_wide", file);
    // setEastImage(file);
    setEastImage(file || selectedeastimage);
  };

  const onwestInput = (e) => {
    const file = e.target.files[0];
    setValue("west_wide", file);
    // setWestImage(file);/
    setWestImage(file || setSelectedWestImage);
  };
  const onNorthInput = (e) => {
    const file = e.target.files[0];
    setValue("north_wide", file);
    // setNorthImage(file);
    setNorthImage(file || setSelectedNorthImage);

  };
  const onSouthInput = (e) => {
    const file = e.target.files[0];
    setValue("south_wide", file);
    // setSouthImage(file);
    setSouthImage(file || setSelectedSouthImage);
  };
  const onFileInput = (e, index) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };
  console.log("selected===>", selecdImage);

  useEffect(() => {
    const fetchProjectDirection = async () => {
      try {
        setLoading(true);
        const res = await axios({
          method: getlocation.method,
          url: `${getlocation.url}`,
          headers: AuthHeader(),
        });

        if (!res?.data?.error) {
          setLoading(false);
          const responseData = res?.data?.data;
          

          // Initialize projectId to 0 initially
          let projectId = 0;

          // Check if there's at least one item in the responseData array
          if (responseData.length > 0) {
            // Loop through the response data to find a matching projectDetailId
            for (const item of responseData) {
              const projectDetailId = item.mst_file_id;
              // console.log('projectDetailId==>',projectDetailId)
              // console.log("mst_file_idss===>", mst_file_id);
              if (mst_file_id == projectDetailId) {
                // console.log("setProjectIdsdddd==>", projectDetailId);
                setProjectId(projectDetailId);
                // console.log("mst_file_id == projectDetailId===>", mst_file_id == projectDetailId);
                // console.log("setProjectId==>", projectId);
                break;
              }
            }
          }

         
       
          // setProjectId(projectId);
          console.log("projectId==>", projectId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
        console.log(err);
        // toast.error("Something went wrong");
      }
    };

    // Call fetchProjectDirection whenever selectedCheckboxes changes
    fetchProjectDirection();
  }, [mst_file_id]); // Add selectedCheckboxes to the dependency array

  console.log("proefhv===>", projectId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios({
          method: locationbyid.method,
          url: `${locationbyid.url}/${projectId}`,
          headers: AuthHeader(),
        });

        if (!res?.data?.error) {
          setLoading(false);

          const payload = res?.data?.data;
          const site_condition_data = payload;
          console.log("payload===>", site_condition_data);

          if (site_condition_data) {
            setSelectedEastImage(site_condition_data[0]?.file_upload);
            setSelectedWestImage(site_condition_data[1]?.file_upload);
            setSelectedSouthImage(site_condition_data[2]?.file_upload);
            setSelectedNorthImage(site_condition_data[3]?.file_upload);
            // Populate the form fields with the data from the API response
            setValue("east", site_condition_data[0]?.description);
            // setValue("direction", site_condition_data[0]?.direction);
            setValue("east_wide", site_condition_data[0]?.file_upload);
            setValue("west", site_condition_data[1]?.description);
            // setValue("west_direction", site_condition_data[1]?.west_direction);
            setValue("west_wide", site_condition_data[1]?.file_upload);
            setValue("north", site_condition_data[2]?.description);
            // setValue("north_direction", site_condition_data[2]?.north_direction);
            setValue("north_wide", site_condition_data[2]?.file_upload);
            setValue("south", site_condition_data[3]?.description);
            // setValue("south_direction", site_condition_data[3]?.south_direction);
            setValue("south_wide", site_condition_data[3]?.file_upload);

            // Handle the site_condition_image array separately
            const site_condition_image_arr =
              site_condition_data.site_condition_image;

            if (
              Array.isArray(site_condition_image_arr) &&
              site_condition_image_arr?.length > 0
            ) {
              const rows = [];
              site_condition_image_arr.forEach((e, i) => {
                rows.push({
                  index: e?.index,
                  file: e?.file,
                  site_condition_image: "",
                  delete_button: i > 0,
                  remove_button: false,
                });
              });
              append(rows);
            } else {
              initialValue();
            }
          } else {
            reset(initialFormValue);
            initialValue();
          }
        } else {
          setLoading(false);
          // toast.error(res?.data?.message);
        }
      } catch (err) {
        setLoading(false);
        console.log(err);
        // toast.error("Something went wrong");
      }
    };

    fetchData();
  }, [projectId]);

  const onSubmit = useCallback(async () => {
    event.preventDefault();
    const projectDetailId = localStorage.getItem("selectedCheckboxes");
    const formData = new FormData();

    formData.append("project_detail_id", projectDetailId);
    formData.append("mst_file_id", mst_file_id);
    formData.append("east", getValues("east"));
    formData.append("direction", getValues("direction"));
    // formData.append("east_wide", eastimage);
    if (!eastimage) {
      formData.append("east_wide", selectedeastimage);
    } else {
      formData.append("east_wide", eastimage);
    }
    formData.append("west", getValues("west"));
    formData.append("west_direction", getValues("west_direction"));
    // formData.append("west_wide", westimage);
    if (!westimage) {
      formData.append("west_wide", westSelectedimage);
    } else {
      formData.append("west_wide", westimage);
    }
    formData.append("north", getValues("north"));
    formData.append("north_direction", getValues("north_direction"));
    // formData.append("north_wide", northimage);
    if (!northimage) {
      formData.append("north_wide", southSelectedimage);
    } else {
      formData.append("north_wide", northimage);
    }
    formData.append("south", getValues("south"));
    formData.append("south_direction", getValues("south_direction"));
    // formData.append("south_wide", southimage);
    if (!southimage) {
      formData.append("south_wide", northSelectedimage);
    } else {
      formData.append("south_wide", southimage);
    }

    // Add site_condition_image files to formData
    fields.forEach((value, index) => {
      formData.append(
        `site_condition_image[${index}]`,
        value.site_condition_image
      );
    });

    const header = { Authorization: `Bearer ${getToken()}` };
    let res;
    if (projectId == 0) {
      res = await ApiService(
        formData,
        0,
        header,
        addlocation.method,
        addlocation.url
      );
    } else {
      res = await ApiService(
        formData,
        0,
        header,
        updatelocation.method,
        updatelocation.url
      );
    }

    if (!res.data.error) {
      setLoading(false);
      toast.success("Site Location updated");
    } else {
      toast.error(res?.data?.message ? res?.data?.message : "Server Error");
      setLoading(false);
    }
  }, [
    projectId,
    eastimage,
    westimage,
    southimage,
    northimage,
    fields,
    getValues,
  ]);

  const initialValue = () => {
    append({
      file: "",
      site_condition_image: "",
      delete_button: false,
      remove_button: false,
    });
  };

  const addSiteConditionImage = () => {
    append({
      file: "",
      site_condition_image: "",
      delete_button: false,
      remove_button: true,
    });
  };

  const onRemoveImage = (index) => {
    SwalAlert({})
      .then(async (result) => {
        if (result.isConfirmed) {
          await removeImage(index);
          // console.log(index);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const removeImage = async (index) => {
    try {
      setLoading(true);
      const data = { index: index, mst_file_id: params?.id };

      const res = await axios({
        method: deleteSiteCondition.method,
        url: deleteSiteCondition.url,
        headers: AuthHeader(),
        data: data,
      });

      if (!res?.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);
        reset({});
        // await fetchData();
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error("Something went wrong");
      console.log(err);
    }
  };

  return (
    <div class="grey-border rounded">
      <div class="card-header bg-white">
        <h5 class="mb-0 font-weight-normal">Site Location</h5>
      </div>
      <div class="card-body bg-white rounded-bottom p-3">
        {!loading ? (
          <form onSubmit={(e) => onSubmit(e)} className="file_icon_form">
            <fieldset id="fieldset">
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="east">East Side</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="write here.."
                      id="east_description"
                      name="east"
                      onChange={handleInputChange}
                      {...register("east")}
                    />
                    <input
                      type="hidden"
                      id="direction"
                      name="direction"
                      value="1"
                      {...register("direction")}
                    />

                    {/* {displayError(errors?.east?.message)} */}
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="east_wide">East Upload</label>
                    <input
                      type="file"
                      id="east_wide"
                      name="east_wide"
                      className="form-control"
                      onChange={oneastInput}
                      // {...register("east_wide", { required: "Required" })}
                      // className={formclass(errors?.east_wide)}
                    />
                    {/* {displayError(errors?.east_wide?.message)} */}
                    <a
                      href={`${FileUrl}/${selectedeastimage}`}
                      style={{
                        position: "absolute",
                        right: "-8px",
                        top: "50%",
                      }}
                      target={"_blank"}
                    >
                      <ReactSVG
                        src={`${eyeButtonSvg}`}
                        wrapper="span"
                        beforeInjection={(svg) => {
                          // svg.classList.add('svg-class-name')
                          svg.setAttribute("style", "width: 20px");
                        }}
                      />
                    </a>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="west">West Side</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="write here.."
                      id="west_description"
                      name="west"
                      onChange={handleInputChange}
                      {...register("west")}
                    />
                    <input
                      type="hidden"
                      id="west_direction"
                      name="west_direction"
                      value="2"
                      {...register("west_direction")}
                    />

                    {/* {displayError(errors?.west?.message)} */}
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="west_wide">West Upload</label>
                    <input
                      type="file"
                      className="form-control"
                      id="west_wide"
                      name="west_wide"
                      onChange={onwestInput}
                      // {...register("west_wide", { required: "Required" })}
                      // className={formclass(errors?.west_wide)}
                    />
                    {/* {displayError(errors?.west_wide?.message)} */}
                    <a
                      href={`${FileUrl}/${westSelectedimage}`}
                      style={{
                        position: "absolute",
                        right: "-8px",
                        top: "50%",
                      }}
                      target={"_blank"}
                    >
                      <ReactSVG
                        src={`${eyeButtonSvg}`}
                        wrapper="span"
                        beforeInjection={(svg) => {
                          // svg.classList.add('svg-class-name')
                          svg.setAttribute("style", "width: 20px");
                        }}
                      />
                    </a>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="north">North Side</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="write here.."
                      id="north_description"
                      name="north"
                      onChange={handleInputChange}
                      {...register("north")}
                    />
                    <input
                      type="hidden"
                      id="north_direction"
                      name="north_direction"
                      value="3"
                      {...register("north_direction")}
                    />

                    {/* {displayError(errors?.north?.message)} */}
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="north_wide">North Upload</label>
                    <input
                      type="file"
                      className="form-control"
                      id="north_wide"
                      name="north_wide"
                      onChange={onNorthInput}
                      // {...register("north_wide", { required: "Required" })}
                      // className={formclass(errors?.north_wide)}
                    />
                    {/* {displayError(errors?.north_wide?.message)} */}
                    <a
                      href={`${FileUrl}/${southSelectedimage}`}
                      style={{
                        position: "absolute",
                        right: "-8px",
                        top: "50%",
                      }}
                      target={"_blank"}
                    >
                      <ReactSVG
                        src={`${eyeButtonSvg}`}
                        wrapper="span"
                        beforeInjection={(svg) => {
                          // svg.classList.add('svg-class-name')
                          svg.setAttribute("style", "width: 20px");
                        }}
                      />
                    </a>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="south">South Side</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="write here.."
                      id="description"
                      name="south"
                      onChange={handleInputChange}
                      {...register("south")}
                    />
                    <input
                      type="hidden"
                      id="south_direction"
                      name="south_direction"
                      value="4"
                      {...register("south_direction")}
                    />

                    {/* {displayError(errors?.south?.message)} */}
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="south_wide">South Upload</label>
                    <input
                      type="file"
                      className="form-control"
                      id="south_wide"
                      name="south_wide"
                      onChange={onSouthInput}
                      // {...register("south_wide", { required: "Required" })}76
                      // className={formclass(errors?.south_wide)}
                    />
                    {/* {displayError(errors?.south_wide?.message)} */}
                    <a
                      href={`${FileUrl}/${northSelectedimage}`}
                      style={{
                        position: "absolute",
                        right: "-8px",
                        top: "50%",
                      }}
                      target={"_blank"}
                    >
                      <ReactSVG
                        src={`${eyeButtonSvg}`}
                        wrapper="span"
                        beforeInjection={(svg) => {
                          // svg.classList.add('svg-class-name')
                          svg.setAttribute("style", "width: 20px");
                        }}
                      />
                    </a>
                  </div>
                </div>
              </div>

              {fields.map((value, index) => (
                <div className="row">
                  <div className="col">
                    <label
                      htmlFor={`${formname}[${index}].site_condition_image`}
                    >
                      Site Condition Image ({index + 1})
                    </label>
                    <div className="position-relative">
                      <input
                        type="file"
                        className="form-control"
                        id={`${formname}[${index}].site_condition_image`}
                        name={`${formname}[${index}].site_condition_image`}
                        onChange={(e) => onFileInput(e, index)}
                      />
                      {value?.file?.length > 0 && value?.file != null ? (
                        <React.Fragment>
                          <a
                            className="extra_eye_icon"
                            href={`${FileUrl}/${value?.file}`}
                            target={"_blank"}
                          >
                            <ReactSVG
                              src={`${eyeButtonSvg}`}
                              wrapper="span"
                              beforeInjection={(svg) => {
                                svg.setAttribute("style", "width: 20px");
                              }}
                            />
                          </a>
                        </React.Fragment>
                      ) : (
                        ""
                      )}
                    </div>
                    {displayError(
                      errors.userform?.[index]?.site_condition_image?.message
                    )}
                  </div>
                  <div className="col">
                    {value?.remove_button ? (
                      <button
                        type="button"
                        className="bg-transparent border-0 dustbin_icon"
                        onClick={() => remove(index)}
                      >
                        <ReactSVG
                          src={`${closeButtonSvg}`}
                          wrapper="span"
                          beforeInjection={(svg) => {
                            svg.setAttribute("style", "width: 20px");
                          }}
                        />
                      </button>
                    ) : index > 0 ? (
                      <button
                        type="button"
                        className="bg-transparent border-0 dustbin_icon"
                        onClick={() => onRemoveImage(value?.index)}
                      >
                        <ReactSVG
                          src={`${dustbinButton}`}
                          wrapper="span"
                          beforeInjection={(svg) => {
                            svg.setAttribute("style", "width: 20px");
                          }}
                        />
                      </button>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              ))}

              <div className="row mt-5">
                <div className="col">
                  <button
                    className="btn"
                    onClick={() => addSiteConditionImage()}
                    type="button"
                  >
                    Add Images
                  </button>
                </div>
                <div className="col">
                  <button className="btn" type="submit">
                    Save
                  </button>
                </div>
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
  );
};

export default SiteLocation;
