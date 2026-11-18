import {userlogin} from '../config/api';
import {callApi} from '../utils';

export const DoLogin = async (formData) =>{
    try{
        const res = await callApi(userlogin.method,userlogin.url,formData,0,null);
        return res;
    }catch(err){
        return err;
    }
}