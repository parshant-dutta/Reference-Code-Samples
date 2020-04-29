
import { toast } from 'react-toastify';


const SuccessToast = (message) => {
    toast.success(message, {
        position: toast.POSITION.BOTTOM_RIGHT
    });
}

const ErrorToast = (message) => {
    toast.error(message, {
        position: toast.POSITION.BOTTOM_RIGHT
    });
}

const WarnToast = (message) => {
    toast.warn(message, {
        position: toast.POSITION.BOTTOM_RIGHT
    });
}

const InfoToast = (message) => {
    toast.info(message, {
        position: toast.POSITION.BOTTOM_RIGHT
    });
}


export {
    SuccessToast,
    ErrorToast,
    WarnToast,
    InfoToast
}