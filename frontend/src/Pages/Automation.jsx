import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import useOnStartData from "../Components/OnStartData";
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";
import Settings from "../Components/Settings";
import { api } from "../api";
import {
  addFarmRow,
  updateChosenCrop
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
          Potassium: userData.Potassium
        };
        dispatch(addFarmRow(""));
        try {
          const res = await api.post("api/crop_specification/", data);
          console.log("ressssssssss", res.data);
          if (res.data.message === "No Match Found") {
            setDicovering(false);
            setFound(false);
            return;
          }
          console.log(res.data.message);
          res.data.message.forEach((element) => {
            dispatch(addFarmRow(element));
          });
          setDicovering(false);
        } catch (error) {
          console.error("Error fetching crop specs:", error);
          setDicovering(false);
        }
      }
    }
    cropSpecs();
  }, [userData]);

  async function reload() {
    if (userData.Temperature != 0) {
      setDicovering(true);
      const data = {
        Temperature: userData.Temperature,
        Humidity: userData.Humidity,
        Moisture: userData.Moisture,
        Nitrogen: userData.Nitrogen,
        Phosporous: userData.Phosporous,
        Potassium: userData.Potassium
      };
      dispatch(addFarmRow(""));
      try {
        const res = await api.post(
          `api/crop_specification/?ln=${language}`,
          data
        );
        console.log("ressssssssss", res.data);
        if (res.data.message === "No Match Found") {
          setDicovering(false);
          setFound(false);
          return;
        }
        console.log(res);
        console.log(res.data.message);
        res.data.message.forEach((element) => {
          dispatch(addFarmRow(element));
        });
        setDicovering(false);
      } catch (error) {
        console.error("Error reloading crops:", error);
        setDicovering(false);
      }
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
      try {
        if (e.target.checked) {
          const response = await api.post("pump_command/", { pump: 1 });
          console.log("checked", response.data);
        } else {
          const response = await api.post("pump_command/", { pump: 0 });
          console.log("Unchecked", response.data);
        }
      } catch (error) {
        console.error("Error sending pump command:", error);
      }
    }
  }

  function handleInnerOverlay(e) {
    e.stopPropagation();
  }

  async function handleInnerClick(e) {
    setFetching(true);
    try {
      const res2 = await api.patch("api/Chosen_crop/", {
        id: farmrows[id].id,
        isChosen: 1
      });
      if (res2.status === 200) {
        dispatch(updateChosenCrop({ id: farmrows[id].id, isChosen: true }));
      }
    } catch (error) {
      console.error("Error updating chosen crop:", error);
    }
    handleOverlay();
  }

  async function handleRemoveCrop(e) {
    setFetching(true);
    try {
      const res2 = await api.patch("api/Chosen_crop/", {
        id: farmrows[id].id,
        isChosen: false
      });
      if (res2.status === 200) {
        dispatch(updateChosenCrop({ id: farmrows[id].id, isChosen: false }));
      }
    } catch (error) {
      console.error("Error removing crop:", error);
    }
    setFetching(false);
    handleViewOverlay();
  }

  const [language, setLanguage] = useState("English");

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const content = {
    English: {
      greeting: "Hello!",
      chooseLanguage: "Choose your language:",
      suggestedCrops: "Suggested Crops",
      myCrops: "My Crops",
      discoverCrops: "Discover Crops",
      noCropsAvailable: "No crops available",
      fetchingCrops: "Fetching Crops...",
      cropHeader: "Crop",
      descriptionHeader: "Description",
      deployHeader: "Deploy",
      viewButton: "View",
      moreButton: "More",
      startExecution: "Start Execution",
      deploying: "Deploying...",
      removeCrop: "Remove Crop",
      removingCrop: "Removing the crop...",
      description: "Description",
      close: "Close",
      pump: "Pump",
      irrigationIn: "Irrigation happens in",
      projectPeriod: "Project Period"
    },
    Swahili: {
      greeting: "Habari!",
      chooseLanguage: "Chagua lugha yako:",
      suggestedCrops: "Mazao Yaliyopendekezwa",
      myCrops: "Mazao Yangu",
      discoverCrops: "Gundua Mazao",
      noCropsAvailable: "Hakuna mazao yaliyopatikana",
      fetchingCrops: "Kunakuta Mazao...",
      cropHeader: "Zao",
      descriptionHeader: "Maelezo",
      deployHeader: "Tumia",
      viewButton: "Angalia",
      moreButton: "Zaidi",
      startExecution: "Anza Utekelezaji",
      deploying: "Inatekeleza...",
      removeCrop: "Ondoa Zao",
      removingCrop: "Inaondoa zao...",
      description: "Maelezo",
      close: "Funga",
      pump: "Pampu",
      irrigationIn: "Umwagiliaji utafanyika baada ya",
      projectPeriod: "Kipindi cha Mradi"
    }
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  );

  const LoadingSpinnerLarge = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="lg:flex flex-row justify-center bg-white min-h-screen">
      <SideBar />

      <div className="lg:h-full w-screen flex flex-col bg-white">
        <NavBar />

        {/* Language Selector */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="text-black font-medium">
              {content[language].chooseLanguage}
            </label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-black"
            >
              <option value="English">English</option>
              <option value="Swahili">Kiswahili</option>
            </select>
            <h2 className="text-xl font-semibold text-black ml-4">
              {content[language].greeting}
            </h2>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="flex-1 p-6 bg-gray-50"
          style={{ overflow: "scroll", height: "100vh" }}
        >
          {farmrows ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">
                      {content[language].cropHeader}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">
                      {content[language].descriptionHeader}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black uppercase tracking-wider">
                      {content[language].deployHeader}
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 bg-gray-50" colSpan="3">
                      <div className="flex space-x-3">
                        {condition === true ? (
                          <button
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            onClick={() => setCondition(false)}
                          >
                            <i className="fa-solid fa-seedling"></i>
                            <span>{content[language].suggestedCrops}</span>
                          </button>
                        ) : (
                          <button
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            onClick={reload}
                            disabled={discover}
                          >
                            {discover ? (
                              <LoadingSpinner />
                            ) : (
                              <i
                                className="fa fa-refresh"
                                aria-hidden="true"
                              ></i>
                            )}
                            <span>{content[language].discoverCrops}</span>
                          </button>
                        )}
                        <button
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => setCondition(true)}
                        >
                          <i className="fa-solid fa-crop"></i>
                          <span>{content[language].myCrops}</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {farmrows.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center">
                        <div className="text-gray-500 text-lg font-medium">
                          {content[language].noCropsAvailable}
                        </div>
                      </td>
                    </tr>
                  ) : discover ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <LoadingSpinnerLarge />
                          <span className="text-gray-600 text-lg font-medium">
                            {content[language].fetchingCrops}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    farmrows.map(
                      (element, index) =>
                        element.isChosen === condition && (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-black">
                                  {element.crop}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div
                                onClick={openModal}
                                className="text-sm text-gray-600 cursor-pointer hover:text-green-600 transition-colors duration-200 line-clamp-2"
                              >
                                {element.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {element.isChosen ? (
                                <button
                                  value={index}
                                  onClick={handleView}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                  {content[language].viewButton}
                                </button>
                              ) : (
                                <button
                                  value={index}
                                  onClick={handleCrop}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                >
                                  {content[language].moreButton}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <Settings />

        {/* Deploy Modal */}
        <div
          onClick={handleOverlay}
          className={`${
            deploy ? "" : "hidden"
          } fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}
        >
          <div
            onClick={handleInnerOverlay}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-black">
                  {id !== null && farmrows[id].crop}
                </h3>
                <button
                  onClick={handleOverlay}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fa fa-times text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {!fetching ? (
                    <button
                      onClick={handleInnerClick}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                    >
                      {content[language].startExecution}
                    </button>
                  ) : (
                    <div className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg flex items-center justify-center space-x-2">
                      <LoadingSpinner />
                      <span>{content[language].deploying}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {fetching ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinnerLarge />
                    </div>
                  ) : (
                    id !== null && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Temperature:</span>
                            <span className="font-medium text-black">
                              {farmrows[id].Temperature}°C
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Humidity:</span>
                            <span className="font-medium text-black">
                              {farmrows[id].Humidity}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Moisture:</span>
                            <span className="font-medium text-black">
                              {farmrows[id].Moisture}K
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nitrogen:</span>
                            <span className="font-medium text-black">
                              {farmrows[id].Nitrogen}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Potassium:</span>
                            <span className="font-medium text-black">
                              {farmrows[id].Potassium}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phosphorous:</span>
                            <span className="font-medium text-black">
                              {farmrows[id].Phosporous}%
                            </span>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-gray-200 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Days/Week:</span>
                            <span className="font-medium text-black">
                              {farmrows[id].Irrigation_interval_perweek} days
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Times/Day:</span>
                            <span className="font-medium text-black">
                              {farmrows[id].Irrigation_interval_perday} times
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Deploy Modal */}
        <div
          onClick={handleViewOverlay}
          className={`${
            viewDeploy ? "" : "hidden"
          } fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}
        >
          <div
            onClick={handleInnerOverlay}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-black">
                  Crop Management
                </h3>
                <button
                  onClick={handleViewOverlay}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fa fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    <i className="fa fa-clock-o mr-2"></i>
                    {content[language].irrigationIn} 3hrs 30min
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <i className="fa fa-calendar mr-2"></i>
                    {content[language].projectPeriod}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-black font-medium">
                    {content[language].pump}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="pump"
                      onChange={sendCommand}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  {!fetching ? (
                    <button
                      onClick={handleRemoveCrop}
                      className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                    >
                      {content[language].removeCrop}
                    </button>
                  ) : (
                    <div className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg flex items-center justify-center space-x-2">
                      <LoadingSpinner />
                      <span>{content[language].removingCrop}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Modal */}
        {displayModal && (
          <div
            onClick={handleOverlayClick}
            className="overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-black">
                    {content[language].description}
                  </h4>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fa fa-times text-xl"></i>
                  </button>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {description}
                </p>
                <button
                  onClick={closeModal}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  {content[language].close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
