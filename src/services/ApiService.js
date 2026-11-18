import { callApi } from "../utils";

const ApiService = async (data,id,header,method,url) =>{
    try{
        const res = await callApi(method,url,data,id,header);
        return res;
    }catch(err){
        // return err;
                throw err;

    }
}

export default ApiService;