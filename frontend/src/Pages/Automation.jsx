import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import useOnStartData from "../Components/OnStartData";
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";
import Settings from "../Components/Settings";
import { api } from "../api";
import {
  addFarmRow,
  updateChosenCrop,
//   updateLocationGraphData,
} from "../Slices/uiSlice";
import { useDispatch } from "react-redux";

export default function Automation() {
  const [description, setDescription] = useState("");
  const [deploy, setDeploy] = useState(false);
  const [viewDeploy, setViewDeploy] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [id, setId] = useState(null);
  const dispatch = useDispatch();
  const farmrows = useSelector((state) => state.ui.farmTable);
  const [displayModal, setDisplay] = useState(false);
  const userData = useSelector((state) => state.user);
  const [discover, setDicovering] = useState(false);
  const [condition, setCondition] = useState(false);
  const [found, setFound] = useState(true);

  const openModal = (e) => {
    setDescription(e.target.textContent);
    setDisplay(true);
  };

  // const fetchData=useOnStartData()

  // useEffect(() => {
  //     const handlePageReload = async () => {
  //       if (window.performance) {
  //         const navigationType = window.performance.getEntriesByType("navigation")[0] || {};
  //         if (navigationType.type === 'reload') {
  //           try {
  //             await fetchData();
  //             console.log('Data fetched after page refresh.');
  //           } catch (error) {
  //             console.error('Error fetching data:', error);
  //           }
  //         }
  //       }
  //     };

  //     handlePageReload(); // Call the async function inside useEffect
  //   }, [fetchData])

  const closeModal = () => setDisplay(false);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("overlay")) {
      closeModal();
    }
  };

  useEffect(() => {
    async function cropSpecs() {
      if (userData.Temperature !== 0) {
        setDicovering(true);
        const data = {
          Temperature: userData.Temperature,
          Humidity: userData.Humidity,
          Moisture: userData.Moisture,
          Nitrogen: userData.Nitrogen,
          Phosporous: userData.Phosporous,
          Potassium: userData.Potassium,
        };
        dispatch(addFarmRow(""));
        const res = await api.post("api/crop_specification/", data);
        console.log("ressssssssss", res.data);
        if (res.data.message === "No Match Found") {
          setDicovering(false);
        }
        console.log(res.data.message);
        res.data.message.forEach((element) => {
          dispatch(addFarmRow(element));
          setDicovering(false);
        }, []);
      }
    }
    cropSpecs();
  }, [userData]);

  async function reload() {
    if (userData.Temperature != 0 ) {
      setDicovering(true);
      const data = {
        Temperature: userData.Temperature,
        Humidity: userData.Humidity,
        Moisture: userData.Moisture,
        Nitrogen: userData.Nitrogen,
        Phosporous: userData.Phosporous,
        Potassium: userData.Potassium,
      };
      dispatch(addFarmRow(""));
      const res = await api.post(
        `api/crop_specification/?ln=${language}`,
        data
      );
      console.log("ressssssssss", res.data);
      if (res.data.message === "No Match Found") {
        setDicovering(false);
        setFound(false);
      }
      console.log(res);
      console.log(res.data.message);
      res.data.message.forEach((element) => {
        dispatch(addFarmRow(element));
        setDicovering(false);
      }, []);
    }
  }

  function handleCrop(e) {
    const index = parseInt(e.target.value, 10);
    console.log(index);
    setId(index);
    setDeploy(true);
  }

  function handleOverlay() {
    setDeploy(false);
    setTimeout(() => {
      setFetching(false);
    }, 3000);
  }

  function handleViewOverlay(e) {
    setViewDeploy(false);
    setTimeout(() => {
      setFetching(false);
    }, 3000);
  }

  function handleView(e) {
    const index = parseInt(e.target.value, 10);
    console.log(index);
    setId(index);
    setViewDeploy(true);
  }

  async function sendCommand(e) {
    console.log(e.target.id);
    if (e.target.id === "pump") {
      if (e.target.checked) {
        const response = await api.post("pump_command/", { pump: 1 });
        console.log("checked", response.data);
      } else {
        const response = await api.post("pump_command/", { pump: 0 });
        console.log("Unchecked", response.data);
      }
    }
  }

  function handleInnerOverlay(e) {
    e.stopPropagation();
  }

  async function handleInnerClick(e) {
    setFetching(true);
    // const res=await api.post('api/update_api_data/',farmrows[id])
    const res2 = await api.patch("api/Chosen_crop/", {
      id: farmrows[id].id,
      isChosen: 1,
    });
    if (res2.status === 200) {
      dispatch(updateChosenCrop({ id: farmrows[id].id, isChosen: true }));
    }
    handleOverlay();
  }

  async function handleRemoveCrop(e) {
    setFetching(true);

    const res2 = await api.patch("api/Chosen_crop/", {
      id: farmrows[id].id,
      isChosen: false,
    });
    if (res2.status === 200) {
      dispatch(updateChosenCrop({ id: farmrows[id].id, isChosen: false }));
    }
    setFetching(false);
    handleViewOverlay();
  }
  const [language, setLanguage] = useState("English");

  // Handler for language change
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  // Sample text in different languages
  const content = {
    English: {
      greeting: "Hello!",
      chooseLanguage: "Choose your language:",
    },
    Swahili: {
      greeting: "Habari!",
      chooseLanguage: "Chagua lugha yako:",
    },
  };

  return (
    <div className="lg:flex flex-row justify-center">
      <SideBar />

      <div className="lg:h-full w-screen flex flex-col">
        <NavBar />

        <div>
          <label>
            {content[language].chooseLanguage}
            <select value={language} onChange={handleLanguageChange}>
              <option value="English">English</option>
              <option value="Swahili">Kiswahili</option>
            </select>
          </label>

          <h2>{content[language].greeting}</h2>
        </div>
        <div className="" style={{ overflow: "scroll", height: "100vh" }}>
          {farmrows ? (
            <table className="table w-[100%]  p-[8px]">
              <thead>
                <tr>
                  <th>Crop </th>
                  <th>Description</th>
                  <th>Deploy</th>
                </tr>
              </thead>

              <tbody className="h-[full] overflow-y-auto">
                <tr>
                  <td className=" bg-[#cbc9be]]" colSpan="3">
                    {condition === true ? (
                      <button
                        className="bg-[#FFFDF6] text-black mt-2 ml-2  "
                        onClick={() => setCondition(false)}
                      >
                        <i class="fa-solid fa-crop"></i> Suggested crops
                      </button>
                    ) : (
                      <button
                        className="bg-[#FFFDF6] text-black mt-2 "
                        onClick={reload}
                      >
                        <i class="fa fa-refresh" aria-hidden="true"></i>{" "}
                        Discover Crops{" "}
                      </button>
                    )}
                    <button
                      className="bg-[#FFFDF6] text-black mt-2 ml-2  "
                      onClick={() => setCondition(true)}
                    >
                      <i class="fa-solid fa-crop"></i> My crops
                    </button>
                  </td>
                </tr>
                {farmrows.length === 0 ? (
                  <span className="absolute right-[40%] top-[50%] text-lg font-semibold">
                    No crops available.
                  </span>
                ) : !discover ? (
                  <>
                    {farmrows.map(
                      (element, index) =>
                        element.isChosen === condition && (
                          <tr key={index}>
                            <td className="flex flex-row gap-1 items-center">
                              {element.crop}
                            </td>
                            <td>
                              <div onClick={openModal}>
                                {element.description}
                              </div>
                            </td>
                            <td>
                              {element.isChosen ? (
                                <button
                                  value={index}
                                  onClick={handleView}
                                  className="chosenBtn table-btn outline-none"
                                >
                                  View
                                </button>
                              ) : (
                                <button
                                  value={index}
                                  onClick={handleCrop}
                                  className="table-btn outline-none"
                                >
                                  More
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                    )}
                  </>
                ) : (
                  <span className="absolute right-[40%] top-[50%] text-lg font-semibold">
                    Fetching Crops....{" "}
                    <i className="fa-solid fa-cog fa-spin text-[3rem]"></i>
                  </span>
                )}
              </tbody>
            </table>
          ) : (
            ""
          )}
        </div>
        <Settings />
        <div
          onClick={handleOverlay}
          className={`${
            deploy ? "" : "hidden"
          } h-full bg-opacity-80 flex flex-col justify-center items-center bg-slate-700 text-wrap fixed z-50 right-0 left-0 text-gray-900 text-lg font-semibold w-[100%]`}
        >
          <div
            onClick={handleInnerOverlay}
            className="md:w-[30rem] relative flex flex-row pt-6 px-3 gap-2 min-h-[10rem] mx-w-[20rem] w-[80%] h-[60%] rounded-[.3rem] bg-[#e2e0d6]"
          >
            <div className="sb text-black">
              <button>{id !== null && farmrows[id].crop}</button>
              {!fetching ? (
                <button
                  className="hover:bg-[#FFFDF6] hover:rounded-md"
                  value={farmrows[id]}
                  onClick={handleInnerClick}
                >
                  Start Execution
                </button>
              ) : (
                "Deploying......"
              )}
            </div>
            <div
              className={`y flex bg-transparent pr-3 pt-3 ${
                !fetching && "justify-between items-start"
              } flex-col ${
                fetching && "justify-center items-center"
              } pl-3 flex-1`}
            >
              {fetching && <i className="fa-solid fa-cog fa-spin"></i>}
              {!fetching && id !== null && (
                <div className="doc flex justify-between flex-col items-start pl-3 flex-1">
                  <div className="bd">
                    Temperature <span>{farmrows[id].Temperature}ºC</span>
                  </div>
                  <div>
                    Humidity <span>{farmrows[id].Humidity}%</span>
                  </div>
                  <div>
                    Moisture <span>{farmrows[id].Moisture}K</span>
                  </div>
                  <div>
                    Nitrogen <span>{farmrows[id].Nitrogen}%</span>
                  </div>
                  <div>
                    Potassium <span>{farmrows[id].Potassium}%</span>
                  </div>
                  <div>
                    Phosphorous <span>{farmrows[id].Phosporous}%</span>
                  </div>
                  <div>
                    No of Days to Irrigate per Week
                    <span>{farmrows[id].Irrigation_interval_perweek} days</span>
                  </div>
                  <div>
                    No of times to irrigate per Day
                    <span>
                      {" "}
                      {farmrows[id].Irrigation_interval_perday} times
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          onClick={handleViewOverlay}
          className={`${
            viewDeploy ? "" : "hidden"
          } h-full bg-opacity-80 flex flex-col justify-center items-center bg-slate-700  text-wrap fixed z-50 right-0 left-0 text-gray-900 text-lg font-semibold   w-[100%]`}
        >
          <div
            onClick={handleInnerOverlay}
            className="md:w-[30rem] relative flex flex-col pt-6 px-3 gap-2 min-h-[10rem] mx-w-[20rem] w-[80%] h-[60%] rounded-[.3rem] bg-[#e2e0d6]"
          >
            <span>Irrigation happens in .. 3hrs 30 min...*</span>
            <span>Project Period...*</span>

            <span className="flex flex-row items-center gap-2">
              Pump
              <label className="switch z-0">
                <input type="checkbox" id="pump" onChange={sendCommand} />
                <span className="slider"></span> 
              </label>
            </span>
            <div className="controlBtns">
              {!fetching ? (
                <button
                  onClick={handleRemoveCrop}
                  className="text-black bg-[#FFFDF6]"
                >
                  Remove Crop
                </button>
              ) : (
                "Removing the crop..."
              )}
            </div>
          </div>
        </div>

        {displayModal && (
          <div
            onClick={handleOverlayClick}
            className="modalOverlay overlay fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50"
          >
            <div className="dialogModal text-white">
              <h4 className="text-[#e2e8f0] text-[18px]">Description</h4>
              <p>{description}</p>
              <button
                onClick={closeModal}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
             
          </div>
        )}
      </div>
    </div>
  );
}
