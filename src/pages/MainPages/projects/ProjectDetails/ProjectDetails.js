import React, { useCallback, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import {
  getRole,
  getToken,
  getUserRoles,
  superAccess,
} from "../../../../services/useLocalStorage";
import ApiService from "../../../../services/ApiService";
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

  updateprojectdetail,
  projectcheckboxbyid,
  addprojectdetails,
  projectdetailsbyid,
  projectbyid,
} from "../../../../config/config";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import { useLocation } from "react-router-dom";

const ProjectDetails = () => {

  const params = useParams();
  const [selectedCheckboxes, setSelectedCheckboxes] = useState("");
  const [apiResponse, setApiResponse] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState([]);
  const [detailsId, setDeatilsId] = useState(0);
  const [projectDetailsId,setProjectDetailId] = useState('')
  
  // const id =0

  const handleIncrement = (index) => {
    const updatedCounters = [...counter];
    updatedCounters[index] = (counter[index] || 0) + 1;
    setCounter(updatedCounters);
  };
  const handleDecrement = (index) => {
    if (counter[index] > 0) {
      const updatedCounters = [...counter];
      updatedCounters[index] = counter[index] - 1;
      setCounter(updatedCounters);
    }
  };  


  const getFileDetails = async () => {
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        parseInt(params?.id),
        header,
        projectbyid.method,
        projectbyid.url
      );
      // console.log('API URL:', apiUrl);
      console.log("API Response:===>", res);
      if (!res.data.error) {
        setLoading(false);
        const data =
          Object.keys(res?.data?.data).length === 0
            ? undefined
            : res?.data?.data[0];

            setProjectDetailId(data.mst_project_type_id)
      }
    } catch (err) {
      setLoading(false);
      if (err.response.data.error) {
        toast.error(err.response.data.message);
      }
    }
  };

  useEffect(() => {
    getFileDetails();
  }, []);

 

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

  useEffect(() => {
    // Only call getProjectDetails when selectedCheckboxes is not empty
    if (projectDetailsId !== "") {
      getProjectDetails();
      getProjectCheckbox();
    }
  }, [projectDetailsId]); // Add selectedCheckboxes as a dependency

  useEffect(() => {
    // Initialize counters based on API response
    if (subcategories.length > 0) {
      const initialCounters = subcategories.map((checkbox) => {
        const matchingItem = apiResponse.find(
          (item) => item.mst_project_subtype_id === checkbox.id
        );
        return matchingItem ? matchingItem.qty : 0;
      });
      setCounter(initialCounters);
    }
    
  }, [subcategories, apiResponse]);

  const getProjectDetails = async () => {
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };

      // Check if selectedCheckboxes is a valid integer
      const projectId = parseInt(projectDetailsId);
      console.log("Parsed Project ID:", projectId);
      console.log("projectDetailsId", projectDetailsId);

      if (!isNaN(projectId)) {
        const res = await ApiService(
          null,
          projectId, // Use the valid integer here
          header,
          projectdetailsbyid.method,
          projectdetailsbyid.url
        );
        setSubcategories(res?.data?.data);
        console.log("subcat===>", res?.data?.data);

        // Rest of your code...
      } else {
        // Handle the case where selectedCheckboxes is not a valid integer
        setLoading(false);
        console.log("Invalid project ID");
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.message);
      } else {
        console.error("An error occurred:", err);
      }
    }
  };

  // const handleCheckboxChange = (index) => {
  //   const isChecked = subcategories.includes(index);

  //   if (isChecked) {
  //     const updatedSelectedCheckboxes = subcategories.filter(
  //       (i) => i !== index
  //     );
  //     setSubcategories(updatedSelectedCheckboxes);
  //   } else {
  //     setSubcategories([...subcategories, index]);
  //   }
  // };

  const handleCheckboxChange = (index) => {
    const isChecked = subcategories.includes(index);
    console.log(`Checkbox at index ${index} isChecked: ${isChecked}`);
  
    if (isChecked) {
      const updatedSelectedCheckboxes = subcategories.filter((i) => i !== index);
      console.log("Removing checkbox:", index);
      setSubcategories(updatedSelectedCheckboxes);
    } else {
      console.log("Adding checkbox:", index);
      setSubcategories([...subcategories, index]);
    }
  };
  

  const getProjectCheckbox = async () => {
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };

      // Check if selectedCheckboxes is a valid integer
      const projectId = parseInt(projectDetailsId);
      console.log("Parsed Project ID:", projectId);

      if (!isNaN(projectId)) {
        const res = await ApiService(
          null,
          projectId, // Use the valid integer here
          header,
          projectcheckboxbyid.method,
          projectcheckboxbyid.url
        );
        setApiResponse(res?.data?.data);
        if (res?.data?.data && res.data.data.length > 0) {
          const firstId = res.data.data[0].id;
          setDeatilsId(firstId);
          console.log("id===>", firstId);
          console.log("res==>", res.data.data);
        } else {
          // No API response, set firstId to 0
          setDeatilsId(0);
          console.log("No API response, firstId set to 0");
        };
      } else {
        // Handle the case where selectedCheckboxes is not a valid integer
        setLoading(false);
        console.log("Invalid project ID");
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.message);
      } else {
        console.error("An error occurred:", err);
      }
    }
  };
  console.log("detailsId--->", detailsId);


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit called");
   

    // Create an array to store the selected data
    const selectedData = [];

    // Loop through subcategories to gather selected data
    subcategories.forEach((checkbox, index) => {
      if (subcategories.includes(index)) {
        selectedData.push({
          mst_project_subtype_id: checkbox.id,
          qty: counter[index] || 1,
          project_detail_id: selectedCheckboxes,
        });
      }
    });

    try {
      const header = { Authorization: `Bearer ${getToken()}` };

      let res;
      
      if (detailsId == 0) {
        res = await ApiService(
          selectedData, // Pass the selected data as the payload
          0, // Use the valid integer here
          header,
          addprojectdetails.method,
          addprojectdetails.url
        );
      } else {
        res = await ApiService(
          selectedData, // Pass the selected data as the payload
          0, // Use the valid integer here
          header,
          updateprojectdetail.method, // Use the appropriate API endpoint for adding project details
          updateprojectdetail.url
        );
      }

      // Handle success, show a toast, or perform any other actions you need
      toast.success("Data saved successfully");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.message);
      } else {
        console.error("An error occurred:", err);
      }
    }
  };

  return (
    <>
      <div class="grey-border rounded">
        <div class="card-header bg-white">
          <h5 class="mb-0 font-weight-normal">Project Details</h5>
        </div>
        <div class="card-body bg-white rounded-bottom p-3">
          <form onSubmit={handleSubmit}>
            {subcategories.map((checkbox, index) => (
              <label key={index} className="d-flex">
                <input
                  type="checkbox"
                  value={checkbox.id}
                  className="mx-2"
                  name="mst_project_subtype_id"
                  id="mst_project_subtype_id"
                  onChange={() => handleCheckboxChange(index)}
                  // checked={subcategories.includes(checkbox.id)}
                  // checked={apiResponse.some(item => item.mst_project_subtype_id === checkbox.id)}
                  // checked={
                  //   apiResponse.some(item => item.mst_project_subtype_id === checkbox.id) ||
                  //   subcategories.includes(index)
                  // }
                />
                {checkbox.title}
                <div>
                  {subcategories.includes(index) && (
                    <div> 
                      <button
                        type="button"
                        onClick={() => handleDecrement(index)}
                        className="mx-2"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        // id={`counter-${index}`}
                        // name={`counter-${index}`}
                        id="qty"
                        name="qty"
                        className="mx-2"
                        style={{ width: "50px" }}
                        value={counter[index] || 1}
                      />
                      <button
                        type="button"
                        onClick={() => handleIncrement(index)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </label>
            ))}

            <div className="row mt-5">
              <div className="col">
                <button type="submit" className="btn">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
