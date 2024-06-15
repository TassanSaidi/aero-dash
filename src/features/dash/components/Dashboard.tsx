// Import React
import React, { useEffect, useState } from 'react';
import { useGetFarmsQuery, useLazyGetOrchardsQuery, useLazyGetTreeSurveysQuery, useLazyGetOrchardSurveysQuery } from '../../../services/FarmApi';
import DashTable from './DashTable/DashTable';
import TreeData from '../types/Tree';
import FarmLoader from './Loader/FarmLoader';

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
interface Column {
  header: string;
  accessor: string; // Key to access the data in each row
}

interface DashboardProps {
  columns: Column[];
  data: Record<string, any>[];
  clickableColumns: Record<string, (value: any, row: Record<string, any>) => void>; // Object with accessor keys as keys and click handler functions as values
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

const Dashboard: React.FC<DashboardProps> = ({ name }) => {
  const [isLoading, setLoading] = useState(true);


  const { data: farmsData, isLoading: isLoadingFarms, error: farmsErro, refetch } = useGetFarmsQuery();
  const [triggerGetOrchards, { data: orchardsData, isLoading: isLoadingOrchards, error: orchardsError }] = useLazyGetOrchardsQuery();
  const [triggerGetOrchardSurveys, { data: orchardSurveysData, isLoading: isLoadingOrchardSurveys, error: orchardSurveysError }] = useLazyGetOrchardSurveysQuery();
  const [triggerGetTreeSurveys, { data: treeSurveysData, isLoading: isLoadingTreeSurveys, error: treeSurveysError }] = useLazyGetTreeSurveysQuery();
  const [farms, setFarms] = useState<ExtendedFarm[]>([]);

  const [treeData, setTreeData] = useState<TreeData[]>([]);


  useEffect(() => {
    if (farmsData?.results && farmsData.results.length > 0) {
      // Start fetching orchards for each farm
      const fetchAllData = async () => {
        try {
          const allTreeData: TreeData[] = [];
          let idCounter = 1; // Initialize id counter

          for (const farm of farmsData.results) {
            const orchardsData = await triggerGetOrchards('' + farm.id).unwrap();

            for (const orchard of orchardsData.results) {
              const orchardSurveysData = await triggerGetOrchardSurveys(orchard.id).unwrap();

              for (const survey of orchardSurveysData.results) {
                const treeSurveysData = await triggerGetTreeSurveys(survey.id).unwrap();

                // Calculate the average NDVI and NDRE from the list of tree surveys
                if (treeSurveysData.results.length > 0) {
                  const totalSurveys = treeSurveysData.results.length;
                  const totalNDVI = treeSurveysData.results.reduce((sum, treeSurvey) => sum + treeSurvey.ndvi, 0);
                  const totalNDRE = treeSurveysData.results.reduce((sum, treeSurvey) => sum + treeSurvey.ndre, 0);

                  const averageNDVI = Number((totalNDVI / totalSurveys).toFixed(2));
                  const averageNDRE = Number((totalNDRE / totalSurveys).toFixed(2));

                  // Find the latest survey date
                  let latestSurveyDate = orchardSurveysData.results
                    .map(survey => new Date(survey.date))
                    .sort((a, b) => b.getTime() - a.getTime())[0]
                    ?.toISOString() || 'N/A'; // Default to 'N/A' if no surveys are found

                  latestSurveyDate = formatDate(latestSurveyDate);

                  // Aggregate the tree survey data into TreeData format
                  const treeDataEntry: TreeData = {
                    id: idCounter++,
                    farmName: farm.name,
                    orchardName: orchard.name, // Assuming orchard name is the desired name
                    totalTreesSurveyed: totalSurveys,
                    latestSurveyDate,
                    averageNDVI,
                    averageNDRE,
                    ndviValues: treeSurveysData.results.map(treeSurvey => treeSurvey.ndvi),
                    ndreValues: treeSurveysData.results.map(treeSurvey => treeSurvey.ndre),
                  };

                  allTreeData.push(treeDataEntry);
                }
              }
            }
          }

          setTreeData(allTreeData);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          console.error('Error fetching data:', error);
        }
      };

      fetchAllData();
    }
  }, [farmsData, triggerGetOrchards, triggerGetOrchardSurveys, triggerGetTreeSurveys]);


  const columns2 = [
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
      //alert(`Clicked on averageNDVI: ${value} (Row: ${JSON.stringify(row)})`);
    },
    averageNDRE: (value: any, row: Record<string, any>) => {
     // alert(`Clicked on averageNDRE: ${value} (Row: ${JSON.stringify(row)})`);
    }
  };

 

  return (
    <div>
      <h1>Aerbotics Farm Dash</h1>
      {isLoading ? (
        <FarmLoader /> // Render FarmLoader while isLoading is true
      ) : (
        <div>
          {/* Render other components or data once loading is complete */}
          <DashTable
            columns={columns2}
            data={treeData}
            clickableColumns={clickableColumns}
          />
          {/* Display fetched data or other components */}
        </div>
      )}

    </div>

  );
};

export default Dashboard;