import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchFarmOrchards, fetchTreeSurveyResults } from "../redux/thunk";
import { selectFarmOrchards, selectOrchardSurveys, selectLoading, selectFarmOrchardsFetched } from "../redux/Selector";
import TreeDataTable from "../../dash/components/DashTable/TreeDataTable";
import { FarmOrchardsMap, OrchardSurveyMap } from "../redux/types";
import { format, set } from 'date-fns';
import FarmLoader from "../components/Loader/FarmLoader";
import './DashContainer.css';
import Histogram from "../components/Graph/Histogram";

const PAGE_SIZE = 10;

// define DisplayData type
interface DisplayData {
    id: string;
    farmId: string;
    orchardName: string;
    totalTreesSurveyed: number;
    latestSurveyDate: string;
    averageNDVI: number;
    averageNDRE: number;
    ndviValues: number[];
    ndreValues: number[];
}

interface HistogramProps {
    data: number[]; // Array of numbers for the histogram
    title: string; // Title for the chart headline
    showHistogram: boolean; // Boolean to show/hide the histogram
    onClose: () => void; // Function to handle closing the modal
  }

const DashContainer: React.FC = () => {
    const dispatch = useAppDispatch();
    const displayDataRef = useRef<{ [key: string]: DisplayData[] }>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [treeData, setTreeData] = useState<DisplayData[]>([]);
    const [isPageLoading, setIsPageLoading] = useState(false);

    const farmOrchards: FarmOrchardsMap = useAppSelector(selectFarmOrchards);
    const orchardSurvey: OrchardSurveyMap = useAppSelector(selectOrchardSurveys);
    const isLoading = useAppSelector(selectLoading);
    const farmOrchardsFetched = useAppSelector(selectFarmOrchardsFetched);
    const [pendingSurvey, setPendingSurvey] = useState(true);
    const [histogram, setHistogram] = useState<HistogramProps>();
    const tableHeader = "Aerbotics Orchard Survey Data";



    useEffect(() => {
        // Check if data for the current page already exists in displayDataRef
        if (!displayDataRef.current[currentPage] || displayDataRef.current[currentPage].length === 0) {
            // If data does not exist for the current page, dispatch fetchFarmOrchards
            dispatch(fetchFarmOrchards());
        } else {
            // If data exists, update treeData with the existing data
            // Ensure there's at least one array and one item in the first array before setting
            if (displayDataRef.current[currentPage].length > 0) {
                setTreeData(displayDataRef.current[currentPage]);
                console.log("Data exists for page:", currentPage, displayDataRef.current[currentPage]);
                console.log("New Tree data:", treeData);
                console.log("Tree Data length", treeData.length);
            }
        }
    }, [currentPage, dispatch]);

    useEffect(() => {
        console.log("Tree Data updated:", treeData);
        console.log("Tree Data length", treeData.length);
    }, [treeData]);



    useEffect(() => {
        if (farmOrchardsFetched && Object.keys(farmOrchards).length > 0) {
            console.log("Farm Orchards fetched:", farmOrchards);
            const orchardIds = Object.keys(farmOrchards)
                .map(farmId => farmOrchards[farmId].map(orchard => orchard.id))
                .flat();
            console.log("Orchard IDs:", orchardIds);
            if (orchardIds.length > 0) {
                getOrchardSurveys(orchardIds, currentPage, PAGE_SIZE);
            }
        }
    }, [farmOrchardsFetched, currentPage, farmOrchards]);

    const getOrchardSurveys = (orchardIds: string[], page: number, pageSize: number) => {
        // Check if data for the current page already exists
        console.log("Checking if data for page exists:", page);
        if (displayDataRef.current[page]) {
            console.log("Data exists for page:", page, displayDataRef.current[page]);
            // Use existing data
            //setTreeData(displayDataRef.current[page]);
            return; // Exit the function to avoid making an API call
        }
        setIsPageLoading(true); // Indicate page loading
        const start = page * pageSize;
        const end = start + pageSize;
        const paginatedOrchardIds = orchardIds.slice(start, end);
        dispatch(fetchTreeSurveyResults(paginatedOrchardIds))
            .then(() => {
                setIsPageLoading(false); // Loading finished
                // After fetching, updateTreeData will be triggered by useEffect
                // which will update displayDataRef with the new data
            })
            .catch(() => setIsPageLoading(false)); // Handle error if necessary
    };

    useEffect(() => {
        if (!isLoading && !isPageLoading && displayDataRef.current[currentPage] === undefined) {
            updateTreeData();
        }
    }, [orchardSurvey, farmOrchards, currentPage, isLoading, isPageLoading]);

    const updateTreeData = () => {
        if (!orchardSurvey) return;
        let newTreeData: DisplayData[] = []; // Maintain current data

        const startIndex = currentPage * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        // Calculate the total number of orchards
        const totalOrchards = Object.values(farmOrchards)
            .flat()
            .length;

        // Check if there are no more orchards beyond the current pagination
        setPendingSurvey(endIndex >= totalOrchards);
        const paginatedOrchardIds = Object.keys(farmOrchards)
            .map(farmId => farmOrchards[farmId].map(orchard => orchard.id))
            .flat()
            .slice(startIndex, endIndex);

        Object.keys(farmOrchards).forEach(farmId => {
            farmOrchards[farmId].forEach(orchard => {
                if (paginatedOrchardIds.includes(orchard.id)) {
                    const surveyData = orchardSurvey[orchard.id];
                    if (surveyData) {
                        const { surveys, latestSurveyDate } = surveyData;
                        const totalTreesSurveyed = surveys.length;
                        const averageNDVI = (surveys.reduce((acc, survey) => acc + survey.ndvi, 0) / totalTreesSurveyed).toFixed(2);
                        const averageNDRE = (surveys.reduce((acc, survey) => acc + survey.ndre, 0) / totalTreesSurveyed).toFixed(2);
                        const ndviValues = surveys.map(survey => survey.ndvi);
                        const ndreValues = surveys.map(survey => survey.ndre);
                        const existingIndex = newTreeData.findIndex(data => data.id === orchard.id);

                        if (existingIndex >= 0) {
                            // Update existing data
                            newTreeData[existingIndex] = {
                                ...newTreeData[existingIndex],
                                totalTreesSurveyed,
                                latestSurveyDate: latestSurveyDate ? formatDate(latestSurveyDate) : '',
                                averageNDVI: parseFloat(averageNDVI)|| 0,
                                averageNDRE: parseFloat(averageNDRE) || 0,
                            };
                        } else {
                            // Add new data
                            newTreeData.push({
                                id: orchard.id,
                                farmId: farmId,
                                orchardName: orchard.name,
                                totalTreesSurveyed,
                                latestSurveyDate: latestSurveyDate ? formatDate(latestSurveyDate) : '',
                                averageNDVI: parseFloat(averageNDVI) || 0,
                                averageNDRE: parseFloat(averageNDRE) || 0,
                                ndviValues,
                                ndreValues,
                            });
                        }
                    }
                }
            });
        });

        setTreeData(newTreeData);
        console.log("SAIDI:", newTreeData);
        // Assuming DisplayData objects can be uniquely identified by a property (e.g., id)
        // Assuming currentPage is defined and holds the current page identifier
        // Ensure the array for the current page exists


        // Append newTreeData to the array for the current page
        if (!displayDataRef.current[currentPage] && newTreeData.length > 0) {
            displayDataRef.current[currentPage] = [];
        }
        if (displayDataRef.current[currentPage]) {
            displayDataRef.current[currentPage] = newTreeData;
        }


    };

    const formatDate = (inputDateStr: string): string => {
        return format(new Date(inputDateStr), 'EEE dd MMM yyyy');
    };

    const handleNextPage = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const handlePrevPage = () => {
        // Determine if the current page is the last page with data
        const isLastPageWithData = !displayDataRef.current[currentPage + 1];

        // Navigate to the previous page
        setCurrentPage(prevPage => Math.max(prevPage - 1, 0));

        // If navigating back from the last page with data, update pendingSurvey to false
        if (isLastPageWithData) {
            setPendingSurvey(false);
        }
    };

    const handleAverageNDVIClick = (orchardId: string) => {
        const orchardData = treeData.find(data => data.id === orchardId);
        setHistogram({
            data: orchardData?.ndviValues || [],
            title: 'NDVI Values for ' + orchardData?.orchardName +' with Average: ' + orchardData?.averageNDVI || '',
            showHistogram: true,
            onClose: () => setHistogram({ ...histogram, showHistogram: false}),
        })
    };

    const handleAverageNDREClick = (orchardId: string) => {
        const orchardData = treeData.find(data => data.id === orchardId);
        setHistogram({
            data: orchardData?.ndreValues || [],
            title: 'NDRE Values for ' + orchardData?.orchardName + ' with Average: ' + orchardData?.averageNDRE || '',
            showHistogram: true,
            onClose: () => setHistogram({ ...histogram, showHistogram: false}),
        })
    };

    const tableColumns = [
        { header: 'Farm ID', accessor: 'farmId', sortable: false }, // Not sortable
        { header: 'Orchard ID', accessor: 'id', sortable: false }, // Not sortable
        { header: 'Orchard Name', accessor: 'orchardName', sortable: false }, // Not sortable
        { header: 'Total Trees Surveyed', accessor: 'totalTreesSurveyed', sortable: false }, // Not sortable
        { header: 'Latest Survey Date', accessor: 'latestSurveyDate', sortable: true }, // Sortable
        {
            header: 'Average NDVI',
            accessor: 'averageNDVI',
            isClickable: true,
            onClick: handleAverageNDVIClick,
            sortable: true, // Sortable
        },
        {
            header: 'Average NDRE',
            accessor: 'averageNDRE',
            isClickable: true,
            onClick: handleAverageNDREClick,
            sortable: true, // Sortable
        },
    ];
    
    // src/features/dash/components/YourComponent.jsx

return (
    <div className="container">
        {isLoading && (
            <div className="loaderOverlay">
                <FarmLoader />
            </div>
        )}
        <div className="content">
            {treeData ? (
                <TreeDataTable data={treeData} columns={tableColumns} title={tableHeader} />
            ) : displayDataRef.current[currentPage - 1] ? (
                <TreeDataTable data={displayDataRef.current[currentPage - 1]} columns={tableColumns} title={tableHeader}  />
            ) : (
                <div>No data available</div>
            )}
            <div className="buttonGroup">
                <button  
                    onClick={handlePrevPage} 
                    disabled={currentPage === 0 || isPageLoading}
                    className={currentPage === 0 || isPageLoading ? 'disabled' : ''}
                >
                    Previous
                </button>
                <button 
                    onClick={handleNextPage} 
                    disabled={isPageLoading || pendingSurvey}
                    className={isPageLoading || pendingSurvey ? 'disabled' : ''}
                >
                    Next
                </button>
            </div>
            <Histogram
                data={histogram?.data || []}
                title={histogram?.title || ''}
                showHistogram={histogram?.showHistogram || false}
                onClose={histogram?.onClose || (() => {})}
            />
        </div>
    </div>
);

    
}

export default DashContainer;
