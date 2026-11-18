import { deleteOfficeExpense, fetchOfficeExpenseById, fetchOfficeExpenses, insertOfficeExpense, updateOfficeExpenseById } from '../config/config';
import {callApi} from '../utils';

export const GetOfficeExpenses = async (token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`};
        const res = await callApi(fetchOfficeExpenses.method,fetchOfficeExpenses.url,{},0,header);
        return res;
    }catch(err){
        return err;
    }
}

export const DeleteOfficeExpense = async (id,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`};
        const res = await callApi(deleteOfficeExpense.method,deleteOfficeExpense.url,{id},0,header);
        return res;
    }catch(err){
        return err;
    }
}

export const getOfficeExpenseById = async (id,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`};
        const res = await callApi(fetchOfficeExpenseById.method,fetchOfficeExpenseById.url,null,id,header);
        return res;
    }catch(err){    
        return err;
    }
} 

export const updateOfficeExpense = async (data,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`,["Content-type"]:"multipart/form-data"};
        const res = await callApi(updateOfficeExpenseById.method,`${updateOfficeExpenseById.url}/${updateOfficeExpenseById.foldername}`,data,0,header);
        return res;
    }catch(err){
        return err;
    }
}

export const AddOfficeExpense = async (data,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`,["Content-type"]:"multipart/form-data"};
        const res = await callApi(insertOfficeExpense.method,`${insertOfficeExpense.url}/${insertOfficeExpense.foldername}`,data,0,header);
        return res;
    }catch(err){
        return err;
    }
}