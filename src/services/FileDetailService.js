import { callApi } from "../utils";
import { fetchFileDetails,changeFileDetails } from "../config/api";

export const GetFileDetails = async (id,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`};
        const res = await callApi(fetchFileDetails.method,fetchFileDetails.url,null,id,header);
        return res;
    }catch(err){
        return err;
    }
}

export const MadeFileDetailsChanges = async (data,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`};
        const res = await callApi(changeFileDetails.method,changeFileDetails.url,data,0,header);
        return res;
    }catch(err){
        return err;
    }
}