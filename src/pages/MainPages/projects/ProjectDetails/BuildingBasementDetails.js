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
import BuildingBasementDetailsModal from "../../../../components/BuildingBasementDetailsModal";

const BuildingBasementDetails = () => {
  const formname = "userform";

  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [openExtraForm, setOpenExtraForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [projectTypes, setProjectTypes] = useState([]);

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
        <h5 class="mb-0 font-weight-normal">Building Basement Details</h5>
      </div>
      <div class="card-body bg-white rounded-bottom p-3">
        {!loading ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="d-block"> 
              Does the any Building have common Basement?
            </label>
            <div className="form-check col-md-1">
              <input
                type="checkbox"
                className="form-check-input"
                id="yes"
                // checked={checkbox1Checked}
                // onChange={() => setCheckbox1Checked(!checkbox1Checked)}
              />
              <label className="form-check-label" htmlFor="checkbox1">
                Yes
              </label>
            </div>
            <div className="form-check col-md-1">
              <input
                type="checkbox"
                className="form-check-input"
                id="No"
                // checked={checkbox2Checked}
                // onChange={() => setCheckbox2Checked(!checkbox2Checked)}
              />
              <label
                className="form-check-label d-inline-block"
                htmlFor="checkbox2"
              >
                No
              </label>
            </div>
            <div className="row">
              {/* Dropdown 2 */}
              <div class="form-group col-md-6 col-sm-6">
                <label htmlFor="dropdown2">Building Type</label>
                <select
                  id="dropdown2"
                  className="form-control"
                  // value={dropdown2Value}
                  onChange={(e) => setDropdown2Value(e.target.value)}
                >
                  <option value="">Select an option</option>
                </select>
              </div>
              <div class="form-group col-md-6 col-sm-6">
                <label htmlFor="basementlevel">Basement Level</label>
                <select
                  id="basementlevel"
                  className="form-control"
                  // value={basementlevel}
                  onChange={(e) => setDropdown2Value(e.target.value)}
                >
                  <option value="">Select an option</option>
                </select>
              </div>
            </div>

            <table class="table">
              <thead class="text-center">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Building Type</th>
                  <th scope="col">Building Name</th>
                  <th scope="col">No. of Floors</th>
                  <th scope="col">Basement</th>
                  <th scope="col">Basement Level</th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr>
                  <td>1</td>
                  <td>High-rise</td>
                  <td>A</td>
                  <td>14</td>
                  <td>yes</td>
                  <td>1</td>

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
                  <td>1</td>
                  <td>High-rise</td>
                  <td>A</td>
                  <td>14</td>
                  <td>yes</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
            <div class="text-right">
              <button class="btn btn-primary" type="button" onClick={openModal}>
                Add
              </button>
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
      <BuildingBasementDetailsModal
        showModal={showModal}
        closeModal={closeModal}
      />
    </div>
  );
};

export default BuildingBasementDetails;
