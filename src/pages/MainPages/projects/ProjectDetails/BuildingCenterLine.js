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
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
// import { deleteInaugurationMessage, getInaugurationMessage, saveInaugurationMessage } from '../../../../config/config';
import {
  closeButtonSvg,
  dustbinButton,
  eyeButtonSvg,
  FileUrl,
} from "../../../../config/file_url";
import { GetDate } from "../../../../services/DateAndTimeService";
import { ReactSVG } from "react-svg";

const BuildingCenterLine = () => {
  const formname = "userform";

  const params = useParams();

  const [loading, setLoading] = useState(false);

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

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios({
        method: getInaugurationMessage.method,
        url: `${getInaugurationMessage.url}/${params?.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setLoading(false);

        const payload = res?.data?.data;

        const imageData = isValidJson(payload[0]?.inauguration_message);

        const inauguration_date = payload[0]?.inauguration_date
          ? GetDate(payload[0]?.inauguration_date, "YYYY-MM-DD")
          : "";

        reset({ inauguration_date: inauguration_date });
        if (Array.isArray(imageData) && imageData?.length > 0) {
          const rows = [];

          imageData.forEach((e, i) => {
            rows.push({
              index: e?.index,
              file: e?.file,
              inauguration_message: "",
              delete_button: !i,
              remove_button: false,
            });
          });

          append(rows);
        } else {
          initialValue();
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const onSubmit = useCallback(async () => {
    try {
      setLoading(true);

      const inauguration_date = getValues(`inauguration_date`);
      const imageData = getValues()[`${formname}`];

      const formData = new FormData();

      formData.append("mst_file_id", params?.id);
      formData.append("inauguration_date", inauguration_date);

      let i = 0;
      for (let e of imageData) {
        formData.append(`${++i}_file`, e?.inauguration_message[0]);
      }

      const res = await axios({
        method: saveInaugurationMessage.method,
        url: saveInaugurationMessage.url,
        headers: AuthHeader({ ["Content-Type"]: "multipart/form-data" }),
        data: formData,
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

  const initialValue = () => {
    append({
      file: "",
      inauguration_message: "",
      delete_button: false,
      remove_button: false,
    });
  };

  const onRemoveImage = (index) => {
    SwalAlert({})
      .then(async (result) => {
        if (result.isConfirmed) {
          // console.log(index);
          await removeImage(index);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const removeImage = async (index) => {
    try {
      const data = { index: index, mst_file_id: params?.id };
      const res = await axios({
        method: deleteInaugurationMessage.method,
        url: deleteInaugurationMessage.url,
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
    fetchData();
  }, []);

  return (
    <div class="grey-border rounded">
      <div class="card-header bg-white">
        <h5 class="mb-0 font-weight-normal">Building Center Line</h5>
      </div>
      <div class="card-body bg-white rounded-bottom p-3">
        {!loading ? (
          <form onSubmit={handleSubmit(onSubmit)}>
               <label>A-Center Line</label>
            <div className="form-group row">
                
              <div className="form-group col-lg-6">
             
                <div className="row">
                  <div className="form-group col-lg-12">
                    <label htmlFor={`${formname}.inauguration_message`}>
                      Inauguration Image{" "}
                    </label>
                    <div>
                      <input
                        type="file"
                        id={`${formname}.inauguration_message`}
                        name={`${formname}.inauguration_message`}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group col-lg-12">
                    <label htmlFor="inauguration_date" className="d-block">
                      Inauguration Date
                    </label>
                    <input
                      type="date"
                      name="inauguration_date"
                      id="inauguration_date"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
              <div class="form-group col-md-6">
                <label for="description">Description</label>
                <textarea
                  class="form-control"
                  id="description"
                  rows="6"
                ></textarea>
              </div>
            </div>
            <label>B-Center Line</label>
            <div className="form-group row">
                
              <div className="form-group col-lg-6">
             
                <div className="row">
                  <div className="form-group col-lg-12">
                    <label htmlFor={`${formname}.inauguration_message`}>
                      Inauguration Image{" "}
                    </label>
                    <div>
                      <input
                        type="file"
                        id={`${formname}.inauguration_message`}
                        name={`${formname}.inauguration_message`}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group col-lg-12">
                    <label htmlFor="inauguration_date" className="d-block">
                      Inauguration Date
                    </label>
                    <input
                      type="date"
                      name="inauguration_date"
                      id="inauguration_date"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
              <div class="form-group col-md-6">
                <label for="description">Description</label>
                <textarea
                  class="form-control"
                  id="description"
                  rows="6"
                ></textarea>
              </div>
            </div>
            <label>C-Center Line</label>
            <div className="form-group row">
                
              <div className="form-group col-lg-6">
             
                <div className="row">
                  <div className="form-group col-lg-12">
                    <label htmlFor={`${formname}.inauguration_message`}>
                      Inauguration Image{" "}
                    </label>
                    <div>
                      <input
                        type="file"
                        id={`${formname}.inauguration_message`}
                        name={`${formname}.inauguration_message`}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group col-lg-12">
                    <label htmlFor="inauguration_date" className="d-block">
                      Inauguration Date
                    </label>
                    <input
                      type="date"
                      name="inauguration_date"
                      id="inauguration_date"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
              <div class="form-group col-md-6">
                <label for="description">Description</label>
                <textarea
                  class="form-control"
                  id="description"
                  rows="6"
                ></textarea>
              </div>
            </div>

            <div className="row mt-5">
              <div className="col">
                <button type="submit" className="btn">
                  Save
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
  );
};

export default BuildingCenterLine;
