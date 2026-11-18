import React, { useEffect,useState } from 'react'
import { Link, useLocation, useNavigate,Navigate } from 'react-router-dom';
import { GetDate } from '../../../services/DateAndTimeService';
import { DeleteFileExpense, GetFileExpenses } from '../../../services/FileExpenseService';
import { getRole, getToken, isEmp, superAccess } from '../../../services/useLocalStorage';
import Loader from 'react-js-loader';
import toast from 'react-hot-toast';
import {login, FileExpenseRoute } from '../../../config/RouteConfig';
import { SwalAlert } from '../../../UtilsComponent/SwalDialog';
import { FileUrl } from '../../../config/file_url';
import { image2svg } from '../../../UtilsComponent/UtilFunctions';
import { adminKey, empKey } from '../../../config/RoleConfig';
import Admin_FileExpense_List from './child/Admin_FileExpense_List';
import Team_FileExpense_List from './child/Team_FileExpense_List';

//File_expense
const Expenses = () => {

    const location = useLocation();
    return (
        <>
           {superAccess() ? <Admin_FileExpense_List/> : isEmp() ? <Team_FileExpense_List/> : <Navigate to={`/${login.list}`} state={{from:location}} replace/>}
        </>
      )
}

export default Expenses;