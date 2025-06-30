import React,{useEffect} from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { displaySideBar,updateLocationGraphData } from '../Slices/uiSlice';
import useRemoveSideBar from './RemoveSidebar';
import { api } from '../api';

const Graph = () => {
    const handleRemoveSideBar=useRemoveSideBar()
    const dataList=useSelector((state)=>state.ui.locationGraphData)
    const dispatch=useDispatch()
    console.log(dataList['message'])
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    useEffect(() => {
      async function defaultStart() {  
        const res = await api.post('locationData/', {
          country: 'Kenya',
          county: 'Nairobi',
          sub_county: 'Westlands'
        });
        console.log(res.data);  // Fix: replaced `print` with `console.log`
        dispatch(updateLocationGraphData(res.data));
      }
  
      defaultStart();  // Now only runs once on mount
    }, [dispatch]);  // Fix: Put it inside useEffect with dependency array
    
    function getHeight(x){
      return Math.round((x * 100) / 40);
    }
    const tempData = [];
    const rainfallData = [];
    const humidityData = [];
  if(dataList&&dataList['message']){
    dataList['message'].forEach((element,index)=>{
     tempData.push( 
      { month: monthNames[element.Month - 1], temp: element.Temperature, height: getHeight(element.Temperature) * 2},
     )
     rainfallData.push(
       { month: monthNames[element.Month - 1], rainfall: element.Rainfall_mm, height: getHeight(element.Rainfall_mm) * 3 }
     )
     humidityData.push(
       { month: monthNames[element.Month - 1], humidity: element.Humidity, height: getHeight(element.Humidity) }
     )
    }) 
  } 
    
    
    

  
  return (
    <div className='flex flex-wrap bg-gray-50' onClick={handleRemoveSideBar}>
    <div className="container mx-auto p-4 max-w-[30rem]">
      <h1 className="text-2xl font-bold mb-4">Yearly Temperature.. Trend</h1>
      <div className="chart-container">
        {tempData.map((item, index) => (
          <div
            key={index}
            className='bar'
            style={{ height: item.height }}
            title={`${item.month}: ${item.temp}°C`}
          >
            <span>{item.temp}°C </span>
          </div>
        ))}
      </div>
      <div className="x-axis">
        {tempData.map((item, index) => (
          <div key={index} className="label">
            {item.month.substring(0, 3)}
          </div>
        ))}
      </div>
    </div>

    <div className="container mx-auto p-4 max-w-[30rem]">
      <h1 className="text-2xl font-bold mb-4">Yearly Rainfall..... Trend</h1>
      <div className="chart-container">
        {rainfallData.map((item, index) => (
          <div
            key={index}
            className='bar'
            style={{ height: item.height }}
            title={`${item.month}: ${item.temp}°C`}
          >
            <span>{item.rainfall}mm</span>
          </div>
        ))}
      </div>
      <div className="x-axis">
        {tempData.map((item, index) => (
          <div key={index} className="label">
            {item.month.substring(0, 3)}
          </div>
        ))}
      </div>
    </div>

    <div className="container mx-auto p-4 max-w-[30rem]">
      <h1 className="text-2xl font-bold mb-4">Yearly Humidity Trend</h1>
      <div className="chart-container">
        {humidityData.map((item, index) => (
          <div
            key={index}
            className='bar'
            style={{ height: item.height }}
            title={`${item.month}: ${item.temp}°C`}
          >
            <span>{item.humidity}%</span>
          </div>
        ))}
      </div>
      <div className="x-axis">
        {tempData.map((item, index) => (
          <div key={index} className="label">
            {item.month.substring(0, 3)}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Graph;
