import {constantMst_Type,constantStatus_File} from '../config/config';
import { callApi } from '../utils';

export const getMst_Type = async (token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`};
        const res = await callApi(constantMst_Type.method,constantMst_Type.url,{},0,header);
        return res;
    }catch(err){
        return err;
    }
}

export const getStatus_File = async (token) =>{
    try{
        const header = {Authorization : `Bearer ${token}`};
        const res = await callApi(constantStatus_File.method,constantStatus_File.url,null,0,header);
        return res;
    }catch(err){
        return err;
    }
}