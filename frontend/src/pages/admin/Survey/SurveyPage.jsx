import React, { useState, useEffect } from "react";
import SurveyFilterBar from "./SurveyFilterBar";
import SurveyTable from "./SurveyTable";
import { AddSurveyDialog, ViewSurveyDialog, EditSurveyDialog, DeleteSurveyDialog } from "./SurveyDialogs";
import { getSurveys } from "../../../api/surveyApi";
import { useError } from "../../../contexts/ErrorContext";

// Removed DEFAULT_DATA to use real Firestore data exclusively.

export default function SurveyPage() {
    const { showError } = useError();
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({ category: "All Categories", urgency: "All Urgency Levels", location: "All Locations" });
    
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewData, setViewData] = useState(null);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);

    const fetchSurveysData = async () => {
        setLoading(true);
        try {
            const data = await getSurveys();
            const surveyList = Array.isArray(data) ? data : (data?.surveys || []);
            
            const mappedData = surveyList.map(s => {
                let urgency = s.urgency || 'Low';
                if (s.aiAnalysis?.urgencyScore != null) {
                    const score = s.aiAnalysis.urgencyScore;
                    urgency = score >= 8 ? 'Critical' : score >= 6 ? 'High' : score >= 4 ? 'Medium' : 'Low';
                }

                return {
                    id: s.id || s.uid,
                    title: s.title,
                    category: s.aiAnalysis?.category || s.category || 'General',
                    location: s.location || 'Unknown',
                    urgency: urgency,
                    date: s.event_date ? new Date(s.event_date).toISOString().split('T')[0] : (s.createdAt || s.created_at ? new Date(s.createdAt || s.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
                    status: s.status,
                    raw_text: s.raw_text || s.description || 'N/A',
                    confidenceScore: s.confidenceScore,
                    confirmations: s.confirmations,
                    rejections: s.rejections,
                    people_needed: s.people_needed,
                    createdBy: s.createdBy
                };
            });
            setSurveys(mappedData);
        } catch (e) {
            showError("Failed to fetch surveys: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurveysData();
    }, []);

    const filteredSurveys = surveys.filter(survey => {
        // Search
        if (searchQuery && !survey.title?.toLowerCase().includes(searchQuery.toLowerCase()) && !survey.location?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        
        // Category
        if (filters.category !== "All Categories" && survey.category?.toLowerCase() !== filters.category.toLowerCase()) return false;
        
        // Urgency
        if (filters.urgency !== "All Urgency Levels" && survey.urgency?.toLowerCase() !== filters.urgency.toLowerCase()) return false;
        
        // Location
        if (filters.location !== "All Locations" && survey.location?.toLowerCase() !== filters.location.toLowerCase()) return false;
        
        return true;
    });

    return (
        <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
            <SurveyFilterBar 
                totalCount={surveys.length}
                filteredCount={filteredSurveys.length}
                onSearch={(q) => setSearchQuery(q)}
                onFilterChange={(f) => setFilters(f)}
                onAddSurvey={() => setAddDialogOpen(true)}
            />
            
            <SurveyTable 
                data={filteredSurveys} 
                onView={(row) => { setViewData(row); setViewDialogOpen(true); }}
                onEdit={(row) => { setEditData(row); setEditDialogOpen(true); }}
                onDelete={(row) => { setDeleteData(row); setDeleteDialogOpen(true); }}
            />

            <AddSurveyDialog 
                open={addDialogOpen} 
                onClose={() => setAddDialogOpen(false)} 
                onSuccess={fetchSurveysData} 
            />

            <ViewSurveyDialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                survey={viewData}
                onVoteSuccess={fetchSurveysData}
            />

            <EditSurveyDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                initialData={editData}
                onSuccess={fetchSurveysData}
            />

            <DeleteSurveyDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                survey={deleteData}
                onSuccess={fetchSurveysData}
            />
        </div>
    );
}