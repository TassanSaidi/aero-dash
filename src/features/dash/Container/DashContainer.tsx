import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchFarmOrchards, fetchTreeSurveyResults } from "../redux/thunk";
import { selectFarmOrchards, selectOrchardSurveys, selectLoading, selectFarmOrchardsFetched } from "../redux/Selector";
import TreeDataTable from "../../dash/components/DashTable/TreeDataTable";
import { FarmOrchardsMap, OrchardSurveyMap } from "../redux/types";
import { format } from 'date-fns';
import FarmLoader from "../components/Loader/FarmLoader";
import './DashContainer.css';

const PAGE_SIZE = 10;

const DashContainer: React.FC = () => {
    const dispatch = useAppDispatch();

    const [currentPage, setCurrentPage] = useState(0);
    const [treeData, setTreeData] = useState<DisplayData[]>([]);
    const [isPageLoading, setIsPageLoading] = useState(false);

    const farmOrchards: FarmOrchardsMap = useAppSelector(selectFarmOrchards);
    const orchardSurvey: OrchardSurveyMap = useAppSelector(selectOrchardSurveys);
    const isLoading = useAppSelector(selectLoading);
    const farmOrchardsFetched = useAppSelector(selectFarmOrchardsFetched);

    useEffect(() => {
        dispatch(fetchFarmOrchards());
    }, [dispatch]);

    useEffect(() => {
        if (farmOrchardsFetched && Object.keys(farmOrchards).length > 0) {
            const orchardIds = Object.keys(farmOrchards)
                .map(farmId => farmOrchards[farmId].map(orchard => orchard.id))
                .flat();
                
            if (orchardIds.length > 0) {
                getOrchardSurveys(orchardIds, currentPage, PAGE_SIZE);
            }
        }
    }, [farmOrchardsFetched, currentPage, farmOrchards]);

    const getOrchardSurveys = (orchardIds: string[], page: number, pageSize: number) => {
        setIsPageLoading(true); // Indicate page loading
        const start = page * pageSize;
        const end = start + pageSize;
        const paginatedOrchardIds = orchardIds.slice(start, end);
        dispatch(fetchTreeSurveyResults(paginatedOrchardIds))
            .then(() => setIsPageLoading(false)) // Loading finished
            .catch(() => setIsPageLoading(false)); // Handle error if necessary
    };

    useEffect(() => {
        if (!isLoading && !isPageLoading) {
            updateTreeData();
        }
    }, [orchardSurvey, farmOrchards, currentPage, isLoading, isPageLoading]);

    const updateTreeData = () => {
        if (!orchardSurvey) return;

        let newTreeData: DisplayData[] = [...treeData]; // Maintain current data

        const startIndex = currentPage * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
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
                                farmName: orchard.farmName,
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
    };

    const formatDate = (inputDateStr: string): string => {
        return format(new Date(inputDateStr), 'EEE dd MMM yyyy');
    };

    const handleNextPage = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage(prevPage => Math.max(prevPage - 1, 0));
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
                <TreeDataTable data={treeData} columns={tableColumns} />
                {isLoading && (
                    <div className="loaderOverlay">
                        <FarmLoader />
                    </div>
                )}
                <div className="buttonGroup">
                    <button onClick={handlePrevPage} disabled={currentPage === 0 || isPageLoading}>Previous</button>
                    <button onClick={handleNextPage} disabled={isPageLoading}>Next</button>
                </div>
            </div>
        </div>
    );
}

export default DashContainer;
