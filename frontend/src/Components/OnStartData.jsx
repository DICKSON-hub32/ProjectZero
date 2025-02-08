import { useEffect, useState } from "react";
import { api } from "../api";
import { updateData } from "../Slices/userSlice";
import { useDispatch } from "react-redux";


export default function useOnStartData() {
    const dispatch=useDispatch()
    const [isFetching, setFetching] = useState(true);

    useEffect(() => {
        let intervalId;
        async function fetchData() {
            try {
                const res = await api.get('api/user/onstart/');
                dispatch(updateData(res.data));
                setFetching(false);
            } catch (error) {
                console.error(error);
                setFetching(false);
            }
        }
        fetchData();
        intervalId = setInterval(fetchData, 2000); 

        return () => clearInterval(intervalId);

    },[]);

    return isFetching;
}
