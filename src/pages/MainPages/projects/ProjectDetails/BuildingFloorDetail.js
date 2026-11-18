import React, { useCallback, useEffect, useState } from "react";
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
  deleteApprovedPlanPdf,
  deleteBuildingBangalow,
  getBuildingBangalow,
  getProjectTypes,
  saveBuildingBangalow,
} from "../../../../config/config";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";

const BuildingFloorDetail = () => {
  const formname = "userform";

  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [openExtraForm, setOpenExtraForm] = useState(false);
  const [projectTypes, setProjectTypes] = useState([]);
  const [isCheckboxSelected, setIsCheckboxSelected] = useState(false);

  const [activeTab, setActiveTab] = useState("basement");
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

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const project_type_register = register("project_type", {
    required: "Required",
  });

  const { append, remove, fields } = useFieldArray({
    name: formname,
    control,
  });

  const initialBuildingEntry = () => {
    append({
      building_name: "",
      num_of_floor: "",
      delete_button: false,
      remove_button: false,
    });
  };

  const fetchProjectTypes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios({
        method: getProjectTypes.method,
        url: `${getProjectTypes.url}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setLoading(false);
        setProjectTypes(res?.data?.data);
        fetchData();
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error("Something went wrong");
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios({
        method: getBuildingBangalow.method,
        url: `${getBuildingBangalow.url}/${params?.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setLoading(false);
        const payload = res?.data?.data;

        if (Array.isArray(payload) && payload?.length > 0) {
          reset({ project_type: payload[0]?.building_project_type });

          const building_data = isValidJson(payload[0]?.building_details);

          console.log(building_data);

          if (Array.isArray(building_data) && building_data?.length > 0) {
            let rows = [];
            building_data.forEach((e, i) => {
              rows.push({
                index: e?.index,
                building_name: e?.building_name,
                num_of_floor: e?.num_of_floor,
                delete_button: i > 0,
                remove_button: false,
              });
            });
            append(rows);
            setOpenExtraForm(true);
          } else {
            if (isBuilding(payload[0]?.building_project_type)) {
              setOpenExtraForm(true);
              initialBuildingEntry();
            }
          }
        } else {
          reset({ project_type: "" });
          initialBuildingEntry();
        }
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const onSubmit = useCallback(async () => {
    try {
      setLoading(true);

      const project_type = parseInt(getValues("project_type"));
      const additional_data = getValues()[`${formname}`];

      const arr = [];
      console.log(project_type);

      if (isBuilding2(project_type)) {
        let i = 0;
        for (let e of additional_data) {
          arr.push({
            index: ++i,
            building_name: e?.building_name?.trim(),
            num_of_floor: e?.num_of_floor,
          });
        }
      } else {
        console.log("false");
      }

      console.log(arr);

      const data = {
        mst_file_id: params?.id,
        building_project_type: project_type,
        building_details: arr?.length > 0 ? arr : undefined,
      };

      const res = await axios({
        method: saveBuildingBangalow.method,
        url: saveBuildingBangalow.url,
        headers: AuthHeader(),
        data: { data: data },
      });

      if (!res?.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);
        reset({});
        await fetchData();
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error("Something went wrong");
    }
  }, []);

  const addForm = () => {
    try {
      append({
        building_name: "",
        num_of_floor: "",
        delete_button: false,
        remove_button: true,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const onRemove = (index) => {
    SwalAlert({})
      .then(async (result) => {
        if (result.isConfirmed) {
          // console.log(index);
          await removeBuilding(index);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const removeBuilding = async (index) => {
    try {
      const data = { index: index, mst_file_id: params?.id };
      const res = await axios({
        method: deleteBuildingBangalow.method,
        url: deleteBuildingBangalow.url,
        headers: AuthHeader(),
        data: data,
      });

      if (!res?.data?.error) {
        toast.success(res?.data?.message);
        reset({});
        await fetchData();
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  const isBuilding = (id) => {
    try {
      return projectTypes.some(
        (e) => e?.id == id && e?.type_name == "Building"
      );
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const isBuilding2 = async (id) => {
    try {
      return projectTypes.some(
        (e) => e?.id == id && e?.type_name == "Building"
      );
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const openForm = (e) => {
    try {
      console.log(e?.target?.value);

      setOpenExtraForm(isBuilding(e?.target?.value) ? true : false);

      const shouldOpen = getValues()[`${formname}`];
      console.log(shouldOpen);

      if (
        isBuilding(e?.target?.value) == true &&
        (shouldOpen == undefined || shouldOpen?.length == 0)
      ) {
        initialBuildingEntry();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div class="grey-border rounded">
      <div class="card-header bg-white">
        <h5 class="mb-0 font-weight-normal">Building Floor Details</h5>
      </div>
      <div class="card-body bg-white rounded-bottom p-3">
        {!loading ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
              <div className="form-group col-md-6">
                <label htmlFor="clientseen" className="d-block">
                  Client seen Validity
                </label>
                <input
                  type="date"
                  name="clientseen"
                  id="clientseen"
                  className="form-control"
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="terracefloor">Terrace Floor</label>
                <div>
                  <input
                    type="file"
                    id="terracefloor"
                    name="terracefloor"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="form-group col-md-6">
                <label htmlFor="uwt">UWT(Under Water Tank)</label>
                <div>
                  <input
                    type="file"
                    id="uwt"
                    name="uwt"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="ohwt">OHWT(Over Head Water Tank)</label>
                <div>
                  <input
                    type="file"
                    id="ohwt"
                    name="ohwt"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="tab-buttons">
                <button
                  onClick={() => handleTabClick("basement")}
                  className={activeTab === "basement" ? "active" : ""}
                >
                  Basement Detail
                </button>
                <button
                  onClick={() => handleTabClick("floor")}
                  className={activeTab === "floor" ? "active" : ""}
                >
                  Floor Detail
                </button>
              </div>
              <div className="tab-content">
                {activeTab === "basement" && (
                  <>
                    <div class="text-right mb-4">
                      {isCheckboxSelected && (
                        <button className="btn btn-primary">Upload</button>
                      )}{" "}
                    </div>

                    <div>
                      <table class="table">
                        <thead class="text-center">
                          <tr>
                            <th></th>
                            <th scope="col">Basement Level</th>
                            <th scope="col">Document Name</th>
                            <th scope="col">Upload File</th>
                          </tr>
                        </thead>
                        <tbody class="text-center">
                          <tr>
                            <td>
                              <label class="custom-checkbox">
                                <input
                                  type="checkbox"
                                  name="showtoclient"
                                  value="1"
                                  onClick={() =>
                                    setIsCheckboxSelected(!isCheckboxSelected)
                                  }
                                />
                                <span class="checkbox-label"></span>
                              </label>
                            </td>
                            <td>1</td>
                            <td>High-rise</td>
                            <td>A</td>

                            {/* delete  */}
                            {/* {fields.map((row, index) => (
                 <tr key={row.id}>
                    <td>{index + 1}</td>
            
                         <td>
                      <a role="button" onClick={() => onRemoveproject(index)}>
                            {actionButtonObject.delete}
                  </a>
                  </td>
               </tr>
               ) )} */}
                          </tr>
                          <tr>
                            <td>
                              <label class="custom-checkbox">
                                <input
                                  type="checkbox"
                                  name="showtoclient"
                                  value="1"
                                  onClick={() =>
                                    setIsCheckboxSelected(!isCheckboxSelected)
                                  }
                                />
                                <span class="checkbox-label"></span>
                              </label>
                            </td>
                            <td>1</td>
                            <td>High-rise</td>
                            <td>A</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                {activeTab === "floor" && (
                  <div>
                    {/* Content for Floor Detail tab */}
                    <h2>Floor Detail Content</h2>
                    <p>Put your floor details here.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <button type="submit" className="btn">
                Save
              </button>
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
  );
};

export default BuildingFloorDetail;
