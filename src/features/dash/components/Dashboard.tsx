import React, { useEffect, useState } from 'react';
import {
  useGetFarmsQuery,
  useLazyGetOrchardsQuery,
  useLazyGetTreeSurveysQuery,
  useLazyGetOrchardSurveysQuery,
} from '../../../services/FarmApi';
import DashTable from './DashTable/DashTable';
import TreeData from '../types/Tree';
import FarmLoader from './Loader/FarmLoader';
import './Dashboard.css'; 

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

interface Column {
  header: string;
  accessor: string;
}

interface DashboardProps {
  name: string;
}

interface ExtendedFarm extends Farm {
  orchards?: ExtendedOrchard[];
}

interface ExtendedOrchard extends Orchard {
  surveys?: ExtendedOrchardSurvey[];
}

interface ExtendedOrchardSurvey extends OrchardSurvey {
  treeSurveys?: TreeSurvey[];
}

// Dashboard component
const Dashboard: React.FC<DashboardProps> = ({ name }) => {
  // const [isLoading, setLoading] = useState(true);
  // const { data: farmsData, isLoading: isLoadingFarms } = useGetFarmsQuery();
  // const [triggerGetOrchards] = useLazyGetOrchardsQuery();
  // const [triggerGetOrchardSurveys] = useLazyGetOrchardSurveysQuery();
  // const [triggerGetTreeSurveys] = useLazyGetTreeSurveysQuery();
  // const [treeData, setTreeData] = useState<TreeData[]>([]);

  // useEffect(() => {
  //   if (farmsData?.results && farmsData.results.length > 0) {
  //     const fetchAllData = async () => {
  //       try {
  //         const allTreeData: TreeData[] = [];
  //         let idCounter = 1;

  //         for (const farm of farmsData.results) {
  //           const orchardsData = await triggerGetOrchards('' + farm.id).unwrap();
  //           for (const orchard of orchardsData.results) {
  //             const orchardSurveysData = await triggerGetOrchardSurveys(orchard.id).unwrap();
  //             for (const survey of orchardSurveysData.results) {
  //               const treeSurveysData = await triggerGetTreeSurveys(survey.id).unwrap();

  //               if (treeSurveysData.results.length > 0) {
  //                 const totalSurveys = treeSurveysData.results.length;
  //                 const totalNDVI = treeSurveysData.results.reduce((sum, treeSurvey) => sum + treeSurvey.ndvi, 0);
  //                 const totalNDRE = treeSurveysData.results.reduce((sum, treeSurvey) => sum + treeSurvey.ndre, 0);

  //                 const averageNDVI = Number((totalNDVI / totalSurveys).toFixed(2));
  //                 const averageNDRE = Number((totalNDRE / totalSurveys).toFixed(2));

  //                 let latestSurveyDate = orchardSurveysData.results
  //                   .map(survey => new Date(survey.date))
  //                   .sort((a, b) => b.getTime() - a.getTime())[0]
  //                   ?.toISOString() || 'N/A';

  //                 latestSurveyDate = formatDate(latestSurveyDate);

  //                 const treeDataEntry: TreeData = {
  //                   id: idCounter++,
  //                   farmName: farm.name,
  //                   orchardName: orchard.name,
  //                   totalTreesSurveyed: totalSurveys,
  //                   latestSurveyDate,
  //                   averageNDVI,
  //                   averageNDRE,
  //                   ndviValues: treeSurveysData.results.map(treeSurvey => treeSurvey.ndvi),
  //                   ndreValues: treeSurveysData.results.map(treeSurvey => treeSurvey.ndre),
  //                   corordinates: treeSurveysData.results.map(treeSurvey => ({ lat: treeSurvey.lat, lng: treeSurvey.lng })),
  //                 };

  //                 allTreeData.push(treeDataEntry);
  //               }
  //             }
  //           }
  //         }

  //         setTreeData(allTreeData);
  //         setLoading(false);
  //       } catch (error) {
  //         setLoading(false);
  //         console.error('Error fetching data:', error);
  //       }
  //     };

  //     fetchAllData();
  //   }
  // }, [farmsData, triggerGetOrchards, triggerGetOrchardSurveys, triggerGetTreeSurveys]);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Farm Name', accessor: 'farmName' },
    { header: 'Orchard Name', accessor: 'orchardName' },
    { header: 'Total Trees Surveyed', accessor: 'totalTreesSurveyed' },
    { header: 'Latest Survey Date', accessor: 'latestSurveyDate' },
    { header: 'Average NDVI', accessor: 'averageNDVI' },
    { header: 'Average NDRE', accessor: 'averageNDRE' },
  ];

  const clickableColumns = {
    averageNDVI: (value: any, row: Record<string, any>) => {

    },
    averageNDRE: (value: any, row: Record<string, any>) => {
    
    }
  };


  return (
    <div className="dashboard-container">
      <h1>Aerbotics Tree Survey Dashboard {name}</h1>
      {/* {isLoading ? (
        <FarmLoader /> 
      ) : (
        <div className="table-container">
          <DashTable
            columns={columns}
            data={treeData}
            clickableColumns={clickableColumns}
          />
        </div>
      )} */}
    </div>
  );
};

export default Dashboard;
