import React, { useState, useEffect } from "react";
import Heatmap from "./Heatmap";
import TaskGraph from "./TaskGraph";
import UnassignedTask from "./UnassignedTask";
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import GroupsIcon from "@mui/icons-material/Groups";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { CircularProgress, Box, Typography } from "@mui/material";

import StatCard from "./StatCard";
import CommunityNeedsHeatmap from "./CommunityNeedHeatmap";
import CategoryBarChart from "./CategoryBarChart"
import TaskCompletionChart from "./TaskCompletionChart";
import AIBriefPanel from "../../../components/admin/AIBriefPanel";
import { getAdminStats, getStrategicInsights } from "../../../api/adminApi";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await getAdminStats();
        console.log("Dashboard Stats received:", stats);
        setData(stats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchInsights = async () => {
        // Cache insights to avoid hitting API limits on every navigation
        const cached = sessionStorage.getItem('ai_strategic_brief');
        if (cached) {
            setInsights(JSON.parse(cached));
            setInsightsLoading(false);
            return;
        }

        try {
            const result = await getStrategicInsights();
            setInsights(result);
            sessionStorage.setItem('ai_strategic_brief', JSON.stringify(result));
        } catch (error) {
            console.error("Failed to fetch AI insights", error);
        } finally {
            setInsightsLoading(false);
        }
    };

    fetchData();
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-gray-500">No data available</div>;

  // Process heatmap data
  const heatmapArray = data?.heatmap_data || [];
  const maxNeed = heatmapArray.length > 0 ? Math.max(...heatmapArray.map(h => h.value), 1) : 1;
  const processedHeatmapData = heatmapArray.map(h => {
    const percentage = Math.round((h.value / maxNeed) * 100);
    let badge = "Low";
    let color = "green";
    if (percentage > 80) { badge = "Critical"; color = "red"; }
    else if (percentage > 60) { badge = "High"; color = "amber"; }
    else if (percentage > 30) { badge = "Medium"; color = "blue"; }
    
    return {
      label: h.location,
      badge,
      percentage,
      color
    };
  });

  // Process task trend data
  const taskTrendArray = data?.task_trend || [];
  const processedTaskTrend = taskTrendArray.map(t => ({
    month: t.name,
    completed: t.completed,
    pending: t.assigned
  }));

  return (
    <div className="mt-2 flex flex-col gap-8 pb-12">
      <Box>
        <Typography variant="h4" fontWeight="900" sx={{ color: '#0F172A', mb: 0.5 }}>Command Dashboard</Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 4 }}>Real-time strategic oversight powered by SevaSetu Intelligence</Typography>
      </Box>

      <AIBriefPanel insights={insights} loading={insightsLoading} />
      
      {/* Stat Cards */}
      <div className="w-full flex gap-4">

        <StatCard 
          head="Total Surveys" 
          icon={AssignmentIcon} 
          number={data?.stats?.total_surveys?.number?.toString() || "0"} 
          subheading={data?.stats?.total_surveys?.subheading} 
          chip={{ "label": data?.stats?.total_surveys?.trend, "type": "success" }} 
          color="blue" 
        />
        <StatCard 
          head="Active Tasks" 
          icon={ContentPasteIcon} 
          number={data?.stats?.active_tasks?.number?.toString() || "0"} 
          subheading={data?.stats?.active_tasks?.subheading} 
          chip={{ "label": data?.stats?.active_tasks?.trend, "type": "success" }} 
          color="green" 
        />
        <StatCard 
          head="Volunteers" 
          icon={GroupsIcon} 
          number={data?.stats?.volunteers?.number?.toString() || "0"} 
          subheading={data?.stats?.volunteers?.subheading} 
          chip={{ "label": data?.stats?.volunteers?.trend, "type": "success" }} 
          color="amber" 
        />
        <StatCard 
          head="Urgent Needs" 
          icon={WarningAmberIcon} 
          number={data?.stats?.urgent_needs?.number?.toString() || "0"} 
          subheading={data?.stats?.urgent_needs?.subheading} 
          chip={{ "label": data?.stats?.urgent_needs?.trend, "type": "urgent" }} 
          color="red" 
        />
      </div>

      <div className="flex ">
        <CommunityNeedsHeatmap data={processedHeatmapData} />
      </div>

      <div className="flex w-full gap-4">
        <CategoryBarChart data={data?.category_distribution || []} />
        <TaskCompletionChart data={processedTaskTrend} />
      </div>
    </div>
  )
}