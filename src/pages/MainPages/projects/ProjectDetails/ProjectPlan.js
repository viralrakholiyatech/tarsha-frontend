import React, { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  getRole,
  getToken,
  getUserRoles,
  superAccess,
} from "../../../../services/useLocalStorage";
import ApiService from "../../../../services/ApiService";
import {
  AuthHeader,
  displayFormData,
  isValidJson,
} from "../../../../services/FormCommon";
import {
  displayError,
  formclass,
} from "../../../../services/ValidationService";
import { projectplanbyid, updateProjectplan } from "../../../../config/config";
import {
  closeButtonSvg,
  dustbinButton,
  eyeButtonSvg,
  FileUrl,
} from "../../../../config/file_url";
import { ReactSVG } from "react-svg";

const ProjectPlan = () => {
  const formname = "userform";

  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

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

  const initialValue = () => {
    append({
      file: "",
    });
  };

  const onFileInput = (e) => {
    const file = e.target.files[0];
    setValue("projectplan", file); // Set the value in the form
    setSelectedImage(file);
  };

  const getFile = async () => {
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        parseInt(params?.id),
        header,
        projectplanbyid.method,
        projectplanbyid.url
      );
      // console.log('API URL:', apiUrl);
      console.log("API Response:", res);
      if (!res.data.error) {
        setLoading(false);
        const data =
          Object.keys(res?.data?.data).length === 0
            ? undefined
            : res?.data?.data[0];
        console.log("data-->", data?.project_plan);

        if (data) {
          setImage(data?.project_plan);

          reset({
            plan: data?.project_plan,
          });
        }
      } else {
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

  // Add a function to handle form submission
  const onSubmit = useCallback(
    async (data) => {
      const formData = new FormData();
      const imageToSubmit = selectedImage ? selectedImage : image;
      formData.append("plan", imageToSubmit);
      formData.append("id", params?.id);
      console.log("formData===>", formData);

      try {
        setLoading(true);
        const header = { Authorization: `Bearer ${getToken()}` };

        let res;

        // If id is not null or blank, update the project
        res = await ApiService(
          formData,
          0,
          header,
          updateProjectplan.method,
          updateProjectplan.url
        );

        if (!res.data.error) {
          setLoading(false);
          toast.success(res?.data?.message);
          if (data.is_save == 1) {
            // setSubmittable(1);
          }
        } else {
          toast.error(res?.data?.message ? res?.data?.message : "Server Error");
          setLoading(false);
        }
      } catch (err) {
        console.log(err);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Server Error"
        );
      }
    },
    [params?.id, selectedImage, image]
  );

  useEffect(() => {
    getFile();
  }, []);

  console.log("image-->", image);

  return (
    <div class="grey-border rounded">
      <div class="card-header bg-white">
        <h5 class="mb-0 font-weight-normal">Project Plan</h5>
      </div>
      <div class="card-body bg-white rounded-bottom p-3">
        {!loading ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              type="file"
              id="plan"
              name="plan"
              className="form-control mb-4"
              onChange={onFileInput}
            />
            <a
              href={`${FileUrl}/${image}`}
              style={{
                position: "absolute",
                right: "10px",
                top: "30%",
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
            <div className="text-center">
              <button className="btn btn-primary" type="submit">
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

export default ProjectPlan;
