import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Animation = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/home');  
        }, 2000); 

        return () => clearTimeout(timer);  
    }, [navigate]);

    return (
        <div className="w-full mt-56 flex justify-center bg-black">
            <div className="relative overflow-hidden h-72">
                <img src="/logo.gif" alt="Animation"/>
            </div>
        </div>
    );
};

export default Animation;
