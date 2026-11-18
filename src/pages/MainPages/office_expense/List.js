import React, { useEffect,useState } from 'react'
import { Link, useLocation, useNavigate ,Navigate} from 'react-router-dom';
import { GetDate, todayDate } from '../../../services/DateAndTimeService';
import { DeleteOfficeExpense, GetOfficeExpenses } from '../../../services/OfficeExpenseService';
import { getRole, getToken, isCust, isEmp, superAccess } from '../../../services/useLocalStorage';
import toast from 'react-hot-toast';
import { SwalAlert } from '../../../UtilsComponent/SwalDialog';
import { image2svg } from '../../../UtilsComponent/UtilFunctions';
import { FileUrl } from '../../../config/file_url';
import { adminKey, empKey } from '../../../config/RoleConfig';
import Admin_list from './child/Admin_list';
import Team_list from './child/Team_list';
import { login } from '../../../config/RouteConfig';


//Office Expenses
const Expenses = () => 
{
    const location = useLocation();
    return (
        <>
            {superAccess() ? <Admin_list/> : (isEmp() ? <Team_list/> :<Navigate to={`/${login.list}`} state={{from:location}} replace/>) }
        </>
    )
}

export default Expenses;