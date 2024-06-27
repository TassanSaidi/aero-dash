import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchFarmOrchards, fetchTreeSurveyResults } from "../redux/thunk";
import { selectFarmOrchards, selectOrchardSurveys, selectLoading, selectFarmOrchardsFetched } from "../redux/Selector";
import TreeDataTable from "../../dash/components/DashTable/TreeDataTable";
import { FarmOrchardsMap, OrchardSurveyMap } from "../redux/types";
import { format } from 'date-fns';
import FarmLoader from "../components/Loader/FarmLoader";
import './DashContainer.css';

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

                        const existingIndex = newTreeData.findIndex(data => data.id === orchard.id);

                        if (existingIndex >= 0) {
                            // Update existing data
                            newTreeData[existingIndex] = {
                                ...newTreeData[existingIndex],
                                totalTreesSurveyed,
                                latestSurveyDate: latestSurveyDate ? formatDate(latestSurveyDate) : '',
                                averageNDVI: parseFloat(averageNDVI),
                                averageNDRE: parseFloat(averageNDRE),
                            };
                        } else {
                            // Add new data
                            newTreeData.push({
                                id: orchard.id,
                                farmId: farmId,
                                orchardName: orchard.name,
                                totalTreesSurveyed,
                                latestSurveyDate: latestSurveyDate ? formatDate(latestSurveyDate) : '',
                                averageNDVI: parseFloat(averageNDVI),
                                averageNDRE: parseFloat(averageNDRE)
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
        console.log("Average NDVI clicked for orchard ID:", orchardId);
    };

    const handleAverageNDREClick = (orchardId: string) => {
        console.log("Average NDRE clicked for orchard ID:", orchardId);
    };

    const tableColumns = [
        { header: 'Orchard ID', accessor: 'id' },
        { header: 'Farm Name', accessor: 'farmName' },
        { header: 'Orchard Name', accessor: 'orchardName' },
        { header: 'Total Trees Surveyed', accessor: 'totalTreesSurveyed' },
        { header: 'Latest Survey Date', accessor: 'latestSurveyDate' },
        {
            header: 'Average NDVI',
            accessor: 'averageNDVI',
            isClickable: true,
            onClick: handleAverageNDVIClick,
        },
        {
            header: 'Average NDRE',
            accessor: 'averageNDRE',
            isClickable: true,
            onClick: handleAverageNDREClick,
        },
    ];
    return (
        <div className="container">
            <div className="content">
                {isLoading && (
                    <div className="loaderOverlay">
                        <FarmLoader />
                    </div>
                )}
                <h2>Orchard Survey Data</h2>
                {treeData !== undefined && treeData !== null ? (
                    <TreeDataTable data={treeData} columns={tableColumns} />
                ) : displayDataRef.current[currentPage - 1] !== undefined && displayDataRef.current[currentPage - 1] !== null ? (
                    // Assuming displayDataRef holds the previous page's data in a format that can be rendered similarly
                    <TreeDataTable data={displayDataRef.current[currentPage - 1]} columns={tableColumns} />
                ) : (
                    // Fallback content or message when there's no data to display
                    <div>No data available</div>
                )}
                <div className="buttonGroup">
                    <button onClick={handlePrevPage} disabled={currentPage === 0 || isPageLoading}>Previous</button>
                    <button onClick={handleNextPage} disabled={isPageLoading || pendingSurvey}>Next</button>
                </div>
            </div>
        </div>
    );
}

export default DashContainer;
