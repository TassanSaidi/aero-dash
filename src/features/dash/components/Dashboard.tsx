// Import React
import React, {useEffect, useState} from 'react';
import { useGetFarmsQuery, useLazyGetOrchardsQuery, useLazyGetTreeSurveysQuery, useLazyGetOrchardSurveysQuery } from '../../../services/FarmApi';
import DashTable from './DashTable/DashTable';
import TreeData from '../types/Tree';
import { format } from 'path';

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
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
            const orchardsData = await triggerGetOrchards(''+farm.id).unwrap();
            
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
                    averageNDRE
                  };

                  allTreeData.push(treeDataEntry);
                }
              }
            }
          }

          setTreeData(allTreeData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchAllData();
    }
  }, [farmsData, triggerGetOrchards, triggerGetOrchardSurveys, triggerGetTreeSurveys]);






  // Define the columns for the table
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Age', accessor: 'age' },
    { header: 'City', accessor: 'city' },
  ];

  const columns2 = [
    { header: 'ID', accessor: 'id' },
    { header: 'Farm Name', accessor: 'farmName' },
    { header: 'Orchard Name', accessor: 'orchardName' },
    { header: 'Total Trees Surveyed', accessor: 'totalTreesSurveyed' },
    { header: 'Latest Survey Date', accessor: 'latestSurveyDate' },
    { header: 'Average NDVI', accessor: 'averageNDVI' },
    { header: 'Average NDRE', accessor: 'averageNDRE' },
  ];

  // Define the data for the table
  const datas = [
    { id: 1, name: 'Alice', age: 28, city: 'New York' },
    { id: 2, name: 'Bob', age: 35, city: 'San Francisco' },
    { id: 3, name: 'Charlie', age: 42, city: 'Seattle' },
    { id: 4, name: 'David', age: 33, city: 'Boston' },
    { id: 5, name: 'Eve', age: 29, city: 'Austin' },
    { id: 6, name: 'Frank', age: 37, city: 'Denver' },
    { id: 7, name: 'Grace', age: 30, city: 'Chicago' },
    { id: 8, name: 'Hank', age: 45, city: 'Houston' },
    { id: 9, name: 'Ivy', age: 27, city: 'Philadelphia' },
    { id: 10, name: 'Jack', age: 32, city: 'Phoenix' },
    { id: 11, name: 'Kate', age: 31, city: 'San Diego' },
    { id: 12, name: 'Leo', age: 34, city: 'Dallas' },
  ];
  

  // Define click handlers for specific columns
  const clickableColumns = {
    averageNDVI: (value: any, row: Record<string, any>) => {
      alert(`Clicked on averageNDVI: ${value} (Row: ${JSON.stringify(row)})`);
    },
    averageNDRE: (value: any, row: Record<string, any>) => {
      alert(`Clicked on averageNDVI: ${value} (Row: ${JSON.stringify(row)})`);
    }
  };
  const handleRefresh = () => {
    // Manually trigger the refresh of farm data and subsequent queries
    refetch();
    // Optionally, you can trigger refetch of other queries here if needed
    // farmApi.endpoints.getOrchards.refetch();
    // farmApi.endpoints.getOrchardSurveys.refetch();
    // farmApi.endpoints.getTreeSurveys.refetch();
  };


  return (
    <div>
     <h1>Aerbotics Farm Dash</h1>
     <button onClick={handleRefresh} style={{ marginTop: '2rem' }}>
        Refresh Table
      </button>
           <DashTable
        columns={columns2}
        data={treeData}
        clickableColumns={clickableColumns}
      />
      
     

    </div>
  );
};

export default Dashboard;