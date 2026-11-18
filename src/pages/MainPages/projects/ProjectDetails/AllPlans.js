import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  getprojectdetials,
  addallplans,
  getallplansbyid,
  getallplans,
  projectbyid,
  updateallplans,
} from "../../../../config/config";
import {
  getRole,
  getToken,
  getUserRoles,
  superAccess,
} from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";
import {
  AuthHeader,
  displayFormData,
  isValidJson,
} from "../../../../services/FormCommon";
import { useParams } from "react-router-dom";
import ApiService from "../../../../services/ApiService";

function AllPlans() {
  const params = useParams();
  const [data, setData] = useState([]);
  const [head, setHead] = useState([]);
  const [tabdata, settabData] = useState([]);
  const [tabhead, settabHead] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState("");
  const [loading, setLoading] = useState(true);
  const [planName1, setPlanName1] = useState([]);
  const [planName2, setPlanName2] = useState("");
  const [selectedFile, setSelectedFile] = useState([]);
  const [selectedFile1, setSelectedFile1] = useState([]);
  const [projectid, setProjectId] = useState("");
  const [projectid2, setProjectId2] = useState("");
  const [show, setShow] = useState([]);
  const [show1, setShow1] = useState([]);
  const [isFinalize, setIsFinalize] = useState(0);
  const [allid, setAllId] = useState("");
  const [length, setLength] = useState("");
  const [projectDetailsId, setProjectDetailId] = useState("");

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

        setProjectDetailId(data.mst_project_type_id);
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

  console.log("projectDetailsId==>", projectDetailsId);

  useEffect(() => {
    const fetchDataFromAPI = async () => {
      try {
        const response = await axios({
          method: getprojectdetials.method,
          url: `${getprojectdetials.url}/${projectDetailsId}`,
          headers: AuthHeader(),
        });

        setData(response.data.data[0].qty);
        setHead(response.data.data[0].title);
        setProjectId(response.data.data[0].mst_project_subtype_id);
        setProjectId2(response.data.data[1].mst_project_subtype_id);
        settabData(response.data.data[1].qty);
        settabHead(response.data.data[1].title);
        setLength(response.data.data[0].response_length);
        setLoading(false);
        console.log("response-->ss", response.data.data);
        console.log("head==>", tabhead);
      } catch (error) {
        console.error("Error fetching data from API", error);
        setLoading(false);
      }
    };

    fetchDataFromAPI();
  }, [projectDetailsId]);

  // useEffect(() => {
  //   const fetchAllPlans = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await axios({
  //         method: getallplans.method,
  //         url: `${getallplans.url}`,
  //         headers: AuthHeader(),
  //       });

  //       if (!res?.data?.error) {
  //         setLoading(false);
  //         const responseData = res?.data?.data;
  //         console.log("response12345==>", responseData);

  //         if (responseData.length > 0) {
  //           for (const item of responseData) {
  //             const projectDetail = item.project_detail_id;
  //             if (projectDetailsId == projectDetail) {
  //               setAllId(projectDetail);
  //                  break;

  //             }
  //           }
  //         }

  //         // Set projectId based on the loop result

  //         // Now you have the projectId set based on the matching projectDetailId
  //         console.log("selectedCheckboxes ==>", selectedCheckboxes);
  //         // console.log("jsdjdb==>",projectId)
  //       } else {
  //         setLoading(false);
  //       }
  //     } catch (err) {
  //       setLoading(false);
  //       console.log(err);
  //       toast.error("Something went wrong");
  //     }
  //   };

  //   // Call fetchProjectDirection whenever selectedCheckboxes changes
  //   fetchAllPlans();
  // }, [projectDetailsId]);

  useEffect(() => {
    const fetchAllPlans = async () => {
      try {
        setLoading(true);
        const res = await axios({
          method: getallplans.method,
          url: `${getallplans.url}`,
          headers: AuthHeader(),
        });

        if (!res?.data?.error) {
          setLoading(false);
          const responseData = res?.data?.data;
          console.log("response12345==>", responseData);

          if (responseData.length > 0) {
            let foundMatchingProject = false;
            for (const item of responseData) {
              const projectDetail = item.project_detail_id;
              if (projectDetailsId === projectDetail) {
                setAllId(projectDetail);
                foundMatchingProject = true;
                break;
              }
            }
            if (!foundMatchingProject) {
              setAllId(0); // Set AllId to 0 if no matching projectDetail is found
            }
          } else {
            setAllId(0); // Set AllId to 0 if responseData is empty
          }
          console.log("setAllId ==>", allid);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
        console.log(err);
        toast.error("Something went wrong");
      }
    };

    // Call fetchProjectDirection whenever selectedCheckboxes changes
    fetchAllPlans();
  }, [projectDetailsId]);

  useEffect(() => {
    const getProjectDetails = async () => {
      try {
        setLoading(true);
        const header = { Authorization: `Bearer ${getToken()}` };
        const allid = parseInt(projectDetailsId);

        if (!isNaN(allid)) {
          const res = await ApiService(
            null,
            allid,
            header,
            getallplansbyid.method,
            getallplansbyid.url
          );

          const response = res?.data?.data;
          console.log("res--->", response);

          if (Array.isArray(response) && response.length > 0) {
            const projectType1Items = response.filter(
              (item) => item.project_type_id === projectid
            );
            const planNames = projectType1Items.map((item) => item.title);
            const checkbox = projectType1Items.map((item) => item.show_client);

            // Filter the items with project_type_id equal to 12
            const projectType12Items = response.filter(
              (item) => item.project_type_id === projectid2
            );

            // Extract the 'title' values from the filtered items
            const planName2Value = projectType12Items.map((item) => item.title);
            const checkbox2value = projectType12Items.map(
              (item) => item.show_client
            );

            // Set planName2 to the extracted values
            setPlanName2(planName2Value);
            setShow1(checkbox2value);
            setShow(checkbox);
            setPlanName1(planNames);
          } else {
            setLoading(false);
            console.log("No data found for the selected project ID");
          }
        } else {
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
    getProjectDetails();
  }, [selectedCheckboxes, projectid2]);

  const handleCheckboxChange = (index) => {
    const updatedCheckboxValues = [...show];

    // If the checkbox at the given index doesn't exist, create it with a value of 1; otherwise, toggle between 0 and 1.
    if (updatedCheckboxValues[index] === undefined) {
      updatedCheckboxValues[index] = 1;
    } else {
      updatedCheckboxValues[index] = updatedCheckboxValues[index] === 0 ? 1 : 0;
    }

    setShow(updatedCheckboxValues);
    console.log("updatedCheckboxValues===>", updatedCheckboxValues);
  };
  const handleCheckb = (e, index) => {
    const newValue = e.target.checked ? 1 : 0;

    const updatedCheckboxValues = [...show1];

    updatedCheckboxValues[index] = newValue;

    setShow1(updatedCheckboxValues);
    console.log(updatedCheckboxValues);
  };

  const handlePlanNameChange = (e, index) => {
    const newValue = e.target.value;
    console.log("newvalue==>", newValue);
    const updatedPlanNames = [...planName1];
    updatedPlanNames[index] = newValue;
    setPlanName1(updatedPlanNames);
  };
  const handlePlanName = (e, index) => {
    const newValue = e.target.value;
    console.log("newvalue==>", newValue);
    const updatedPlanNames = [...planName2];
    updatedPlanNames[index] = newValue;
    setPlanName2(updatedPlanNames);
  };
  const handleplanechange = (e, index) => {
    console.log("handleplanechange called for index", index);
    const file = e.target.files[0]; // Get the first selected file
    const updatedSelectedFile = [...selectedFile]; // Create a copy of the array
    updatedSelectedFile[index] = file; // Update the element at the specified index
    setSelectedFile(updatedSelectedFile); // Set the state with the updated array
  };
  console.log("selected-->", selectedFile);

  const handleplane2change = (e, index) => {
    console.log("handleplane2change called for index", index);
    const file = e.target.files[0]; // Get the first selected file
    const updatedSelectedFile1 = [...selectedFile1]; // Create a copy of the array
    updatedSelectedFile1[index] = file; // Update the element at the specified index
    setSelectedFile1(updatedSelectedFile1); // Set the state with the updated array
  };
  console.log("selectedfile-->", selectedFile1);

  // const handleSubmit = useCallback(
  //   async (e) => {
  //     e.preventDefault();
  //     const obj = {
  //       project_detail_id: selectedCheckboxes,
  //       planname: planName1,
  //       planname2: planName2,
  //       file_upload1:selectedFile,
  //       file_upload2:selectedFile1,
  //       project_type_id: projectid,
  //       project_type_id2: projectid2,
  //       show: show,
  //       show1: show1,
  //       is_finalize: isFinalize,
  //     };

  //     const fileDetailData = {
  //       obj: obj,
  //       // direction: 2,
  //     };

  //     console.log("fileDetailData===>", fileDetailData);
  //     // console.log("projectId===>",projectId)

  //     try {
  //       setLoading(true);
  //       const header = { Authorization: `Bearer ${getToken()}` };
  //       let res;
  //       if (allid == 0 ) {
  //       res = await ApiService(
  //         fileDetailData,
  //         0,
  //         header,
  //         addallplans.method,
  //         addallplans.url
  //       );
  //       } else {
  //         // If id is not null or blank, update the project
  //         res = await ApiService(
  //           fileDetailData,
  //           0,
  //           header,
  //           updateallplans.method, // Assuming you have a separate updateproject method
  //           updateallplans.url // Assuming you have a separate updateproject URL
  //         );
  //       }

  //       if (!res.data.error) {
  //         setLoading(false);
  //         toast.success(res?.data?.message);
  //       } else {
  //         toast.error(res?.data?.message ? res?.data?.message : "Server Error");
  //         setLoading(false);
  //       }
  //     } catch (err) {
  //       console.log(err);
  //       toast.error(
  //         err?.response?.data?.message
  //           ? err?.response?.data?.message
  //           : "Server Error"
  //       );
  //     }
  //   },
  //   [selectedCheckboxes, show, isFinalize, planName1, projectid, projectid2,allid]
  // );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("project_detail_id", selectedCheckboxes);
      formData.append("project_type_id", projectid);
      formData.append("project_type_id2", projectid2);
      formData.append("is_finalize", isFinalize);
      formData.append("length", length);
      show.forEach((value, index) => {
        formData.append(`show[${index}]`, value);
      });

      // Append show1 values for the second set of plans
      show1.forEach((value, index) => {
        formData.append(`show1[${index}]`, value);
      });

      // Append planname values
      planName1.forEach((name, index) => {
        formData.append(`planname[${index}]`, name);
      });

      // Append planname2 values
      planName2.forEach((name, index) => {
        formData.append(`planname2[${index}]`, name);
      });

      // Append file uploads for the first set of plans
      // selectedFile.forEach((file, index) => {
      //   if (file) {
      //     formData.append(`file_upload1[${index}]`, file);
      //   }
      // });

      if (selectedFile.length === 0) {
        formData.append("file_upload1", ""); // Assuming 'file_upload1' is the key for the old image
      } else {
        // Append file uploads for the first set of plans
        selectedFile.forEach((file, index) => {
          if (file) {
            formData.append(`file_upload1[${index}]`, file);
          }
        });
      }

      // Append file uploads for the second set of plans
      // selectedFile1.forEach((file, index) => {
      //   if (file) {
      //     formData.append(`file_upload2[${index}]`, file);
      //   }
      // });

      if (selectedFile1.length === 0) {
        formData.append("file_upload2", ""); // Assuming 'file_upload2' is the key for the old image
      } else {
        // Append file uploads for the second set of plans
        selectedFile1.forEach((file, index) => {
          if (file) {
            formData.append(`file_upload2[${index}]`, file);
          }
        });
      }

      try {
        setLoading(true);
        const header = { Authorization: `Bearer ${getToken()}` };
        let res;

        // if (allid === 0) {
        res = await ApiService(
          formData,
          0,
          header,
          addallplans.method,
          addallplans.url
        );
        // } else {
        //   res = await ApiService(
        //     formData,
        //     0,
        //     header,
        //     updateallplans.method,
        //     updateallplans.url
        //   );
        // }
        console.log("res--->", res);
        if (!res.data.error) {
          setLoading(false);
          toast.success(res?.data?.message);
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
    [
      selectedCheckboxes,
      isFinalize,
      planName1,
      projectid,
      projectid2,
      allid,
      selectedFile,
      selectedFile1,
      show,
      show1,
      length,
    ]
  );

  const generateTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="6">Loading...</td>
        </tr>
      );
    }

    if (!data || data.length === 0) {
      return (
        <tr>
          <td colSpan="6">No data available.</td>
        </tr>
      );
    }

    const rows = [];
    for (let index = 0; index < data; index++) {
      rows.push(
        <tr key={index}>
          <td>
            <input
              type="text"
              placeholder={`Enter Plan Name `}
              id="planname"
              name="planname"
              className="form-control"
              value={planName1[index]}
              onChange={(e) => handlePlanNameChange(e, index)}
            />
          </td>
          <td>
            <label className="custom-checkbox">
              <input
                type="radio"
                name="is_finalize"
                id="is_finalize"
                value={index}
                // onChange={(e) => handleCheckboxChange(e, "is_finalize")}
              />
              <span className="checkbox-label"></span>
            </label>
          </td>
          <td>
            <label className="custom-checkbox">
              <input
                type="checkbox"
                name="show_client"
                id="show_client"
                value={index}
                checked={show[index] === 1}
                onChange={() => handleCheckboxChange(index)}
                // checked={show[index] === 1}
              />
              <span className="checkbox-label"></span>
            </label>
          </td>
          <td>{index + 1}</td>

          <td>
            <input
              type="file"
              id="file_upload1"
              name="file_upload1"
              className="form-control"
              onChange={(e) => handleplanechange(e, index)}
            />
          </td>
        </tr>
      );
    }

    return rows;
  };

  const generateTabeRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="6">Loading...</td>
        </tr>
      );
    }

    if (!tabdata || tabdata.length === 0) {
      return (
        <tr>
          <td colSpan="6">No data available.</td>
        </tr>
      );
    }

    const rows = [];
    for (let index = 0; index < tabdata; index++) {
      rows.push(
        <tr key={index}>
          <td>
            <input
              type="text"
              placeholder="Enter Plan Name "
              id="planname"
              name="planname"
              value={planName2[index]}
              className="form-control"
              onChange={(e) => handlePlanName(e, index)}
            />
          </td>
          <td>
            <label className="custom-checkbox">
              <input
                type="radio"
                name="is_finalize"
                id="is_finalize"
                value={index}
                // onChange={(e) => handleCheckboxChange(e, "is_finalize")}
              />
              <span className="checkbox-label"></span>
            </label>
          </td>
          <td>
            <label className="custom-checkbox">
              <input
                type="checkbox"
                name="show_client"
                id="show_client"
                value={index}
                checked={show1[index] === 1}
                onChange={(e) => handleCheckb(e, index)}
              />
              <span className="checkbox-label"></span>
            </label>
          </td>
          <td>{index + 1}</td>

          <td>
            <input
              type="file"
              id="file_upload2"
              name="file_upload2"
              className="form-control"
              onChange={(e) => handleplane2change(e, index)}
            />
          </td>
        </tr>
      );
    }

    return rows;
  };

  return (
    <div class="grey-border rounded">
      <div class="card-header bg-white">
        <h5 class="mb-0 font-weight-normal">All Plans</h5>
      </div>
      <div class="card-body bg-white rounded-bottom p-3">
        <h5 class="mb-0 font-weight-normal">{head}</h5>
        <form onSubmit={handleSubmit}>
          <table className="table">
            <thead className="text-center">
              <tr>
                <th scope="col">Plan Name</th>
                <th scope="col">Finalize</th>
                <th scope="col">Show to Client</th>
                <th scope="col">#</th>

                <th scope="col">Upload Plan</th>
              </tr>
            </thead>
            <tbody className="text-center">{generateTableRows()}</tbody>
          </table>

          <h5 class="mb-0 font-weight-normal">{tabhead}</h5>
          <table className="table">
            <thead className="text-center">
              <tr>
                <th scope="col">Plan Name</th>
                <th scope="col">Finalize</th>
                <th scope="col">Show to Client</th>
                <th scope="col">#</th>

                <th scope="col">Upload Plan</th>
              </tr>
            </thead>
            <tbody className="text-center">{generateTabeRows()}</tbody>
          </table>
          <button type="submit" className="btn ">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default AllPlans;
