import { fetchMstDocument } from '../config/config';
import {callApi} from '../utils';

export const getDocumentMaster = async (category_name,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`};
        const res = await callApi(fetchMstDocument.method,fetchMstDocument.url,{category:category_name},0,header);
        return res;
    }catch(err){
        return err;
    }
}