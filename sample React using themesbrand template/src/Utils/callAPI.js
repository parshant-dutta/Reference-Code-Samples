import axios from 'axios';

export const callGetAPI = async (url) => {
    return axios.get(url);
}


export const callPostAPI = async (url, data, options={}) => {
    return axios
    .post(url, data, options)
    }