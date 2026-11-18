import {fetchFile,deleteFile,insertFile,fetchFileById,updateFileById, changeFileDocumentJson} from '../config/config';
import { callApi } from '../utils';

export const GetFile = async (token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`};
        const res = await callApi(fetchFile.method,fetchFile.url,{},0,header);
        return res;
    }catch(err){
        return err;
    }
}

export const DeleteFile = async (id,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`};
        const res = await callApi(deleteFile.method,deleteFile.url,{id},0,header);
        return res;
    }catch(err){
        return err;
    }
}

export const getFileById = async (id,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`,["Content-type"]:"application/json"};
        const res = await callApi(fetchFileById.method,fetchFileById.url,null,id,header);
        return res;
    }catch(err){    
        return err;
    }
} 

export const addFile = async (data,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`,["Content-type"]:"multipart/form-data;"};
        const res = await callApi(insertFile.method,`${insertFile.url}/${insertFile.foldername}`,data,0,header);
        return res;
    }catch(err){
        return err;
    }
}

export const updateFile = async (data,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`,["Content-type"]:"application/json"};
        const res = await callApi(updateFileById.method,updateFileById.url,data,0,header);
        return res;
    }catch(err){
        return err;
    }
}

export const updateFileDocumentJson = async (data,token) =>{
    try{
        const header = {Authorization:`Bearer ${token}`,["Content-type"]:"application/json"};
        const res = await callApi(changeFileDocumentJson.method,changeFileDocumentJson.url,data,0,header);
        return res;
    }catch(err){
        return err;
    }
}