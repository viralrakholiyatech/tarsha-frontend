import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken, superAccess } from "../../../services/useLocalStorage";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { InteriorRoute } from "../../../config/RouteConfig";
import { Accordion, Tab, Nav } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  getQuationbyid,
  deleteVendor,
  getFees,
  deleteFees,
  getInteriorData,
  updatequotationstage,
} from "../../../config/config";
import AddQuotationModal from "./components/AddQuotationModal";
import AddVendorQuationModal from "./components/AddVendorQuationModal";
import AddFeesModal from "./components/AddFeesModal";
import UpdateFeesModal from "./components/UpdateFeesModal";
import UpdateQotCatgoryModal from "./components/UpdateQotCatgoryModal";
import UpdateVendorModal from "./components/UpdateVendorModal";
import { RiInformationFill } from "react-icons/ri";
import { FileUrl } from "../../../config/file_url";

function Vendor() {
  return (
    <>
        <div className="content__wrapper">
        <section className="page-content">
     <div className="card">
     <div className="row">
        <Accordion className="table-responsive mb-2">
          {Object.entries(catgeoryData)
            .filter(
              ([groupName, data]) =>
                groupName.trim() !== "" && data.items.length > 0
            )
            .map(([groupName, data]) => (
              <Accordion.Item key={groupName} eventKey={groupName}>
                <Accordion.Header>
                  {groupName} &nbsp;{data.totalPrice} &nbsp;
                  <Link
                    className="cursor-pointer delete_btn ms-4"
                    title="Edit"
                    onClick={(e) => {
                      handleShowUpdateCategryModal(data.items[0]?.mst_id);
                    }}
                  >
                    <img
                      className="in__svg"
                      src={`${FileUrl}/img/icons/edit.svg`}
                      alt="Edit"
                    />
                  </Link>
                </Accordion.Header>
                <Accordion.Body>
                  <div className="table-responsive team_table">
                    <table className="table datatable">
                      <thead>
                        <tr>
                          <th>Vendor</th>
                          <th>Mobile No.</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.items?.length > 0 ? (
                          data.items.map((item, index) => (
                            <tr key={item.id}>
                              <td>{item.vendors}</td>
                              <td className="cursor-pointer">
                                {item.mobile_no}
                              </td>
                              <td>{item.price}</td>
                              <td>
                                <span
                                  className={`status_text_btn ${
                                    item.status === 0
                                      ? "pending"
                                      : item.status === 1
                                      ? "approved"
                                      : item.status === 2
                                      ? "rejected"
                                      : ""
                                  }`}
                                >
                                  {item.status === 0
                                    ? "Pending"
                                    : item.status === 1
                                    ? "Approved"
                                    : item.status === 2
                                    ? "Rejected"
                                    : ""}
                                </span>
                              </td>
                              {item?.qid ? (
                                <td>
                                  <Link
                                    className="cursor-pointer delete_btn"
                                    onClick={(e) => {
                                      handleShowUpdateVendorModal(item?.qid);
                                    }}
                                  >
                                    <img
                                      className="in__svg"
                                      src={`${FileUrl}/img/icons/edit.svg`}
                                      alt="Edit"
                                    />
                                  </Link>
                                  <a
                                    className="cursor-pointer delete_btn"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent event from bubbling up
                                      onRemoveVendor(item?.qid);
                                    }}
                                  >
                                    <img
                                      className="in__svg"
                                      src={`${FileUrl}/img/icons/delete.svg`}
                                      alt="Delete"
                                    />
                                  </a>
                                </td>
                              ) : (
                                ""
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center">
                              No Data Available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex justify-content-end gap-3 mt-3">
                    <button
                      className="form_save_btn"
                      onClick={() =>
                        handleShowSpaceModal(data?.items[0]?.mst_id)
                      }
                    >
                      Add
                    </button>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
        </Accordion>
        <div className="d-flex justify-content-end gap-3 mt-3">
          <button className="form_save_btn" onClick={handleShowModal}>
            Add New Category
          </button>
        </div>
      </div>
     </div>
     </section>
        </div>
   
    
     
    </>
  );
}

export default Vendor;
