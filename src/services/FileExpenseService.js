import {fetchFileExpenses,deleteFileExpense,fetchFileExpenseById,updateFileExpenseById,insertFileExpense} from '../config/config';
import { callApi } from '../utils';

export const GetFileExpenses = async (token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`};
        const res = await callApi(fetchFileExpenses.method,fetchFileExpenses.url,{},0,header);
        return res;
    }catch(err){
        return err;
    }
}

export const DeleteFileExpense = async (id,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`};
        const res = await callApi(deleteFileExpense.method,deleteFileExpense.url,{id},0,header);
        return res;
    }catch(err){
        return err;
    }
}

export const getFileExpenseById = async (id,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`};
        const res = await callApi(fetchFileExpenseById.method,fetchFileExpenseById.url,null,id,header);
        return res;
    }catch(err){    
        return err;
    }
} 


export const updateFileExpense = async (data,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`,["Content-type"]:"multipart/form-data"};
        const res = await callApi(updateFileExpenseById.method,`${updateFileExpenseById.url}/${updateFileExpenseById.foldername}`,data,0,header);
        return res;
    }catch(err){
        return err;
    }
}

export const AddFileExpense = async (data,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`,["Content-type"]:"multipart/form-data"};
        const res = await callApi(insertFileExpense.method,`${insertFileExpense.url}/${insertFileExpense.foldername}`,data,0,header);
        return res;
    }catch(err){
        return err;
    }
}