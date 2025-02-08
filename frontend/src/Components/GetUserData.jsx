import { useState, useEffect } from "react";
import { api } from "../api"; // Adjust the path to your API file

export default function useData() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await api.get('user/');
                setUserData(response.data);
                setLoading(false)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false);
            }
        }
        fetchUserData();
    }, []);

    return ([userData, loading ]);
}
