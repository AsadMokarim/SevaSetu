const { db } = require('../config/firebase');

/**
 * Get high-level statistics for the admin dashboard
 */
const getStats = async () => {
    // Fetch all core collections for real-time aggregation
    const [volunteersSnap, surveysSnap, tasksSnap] = await Promise.all([
        db.collection('users').where('role', '==', 'volunteer').get(),
        db.collection('surveys').get(),
        db.collection('tasks').get()
    ]);

    const volunteers = volunteersSnap.docs.map(doc => doc.data());
    const allTasks   = tasksSnap.docs.map(doc => doc.data());
    const surveyCount = surveysSnap.size;

    const openTasks      = allTasks.filter(t => ['open', 'assigned', 'accepted'].includes((t.status || '').toLowerCase())).length;
    const completedTasks = allTasks.filter(t => (t.status || '').toLowerCase() === 'completed').length;
    const urgentTasks    = allTasks.filter(t => ['CRITICAL', 'HIGH'].includes((t.priority || '').toUpperCase())).length;

    // 1. Heatmap Data (Aggregate by Location)
    const locationMap = {};
    allTasks.forEach(t => {
        if (t.status === 'completed') return; // Only show active needs on heatmap
        const loc = t.location || 'Unknown';
        locationMap[loc] = (locationMap[loc] || 0) + (t.total_volunteers || 1);
    });
    const heatmap_data = Object.entries(locationMap)
        .map(([location, value]) => ({ location, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // 2. Category Distribution
    const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];
    const categoryMap = {};
    allTasks.forEach(t => {
        const cat = t.category || 'General';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const category_distribution = Object.entries(categoryMap)
        .map(([category, value], idx) => ({ 
            category, 
            value, 
            color: COLORS[idx % COLORS.length] 
        }))
        .sort((a, b) => b.value - a.value);

    // 3. Monthly Trend (Real aggregation by month)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    const last4Months = [];
    for (let i = 3; i >= 0; i--) {
        const idx = (currentMonthIdx - i + 12) % 12;
        last4Months.push(months[idx]);
    }

    const trendMap = {};
    last4Months.forEach(m => trendMap[m] = { completed: 0, assigned: 0 });

    allTasks.forEach(t => {
        const date = t.createdAt ? new Date(t.createdAt) : new Date();
        const month = months[date.getMonth()];
        if (trendMap[month]) {
            if ((t.status || '').toLowerCase() === 'completed') {
                trendMap[month].completed += 1;
            } else {
                trendMap[month].assigned += 1;
            }
        }
    });

    const task_trend = last4Months.map(name => ({
        name,
        completed: trendMap[name].completed,
        assigned: trendMap[name].assigned
    }));

    return {
        stats: {
            total_surveys: { 
                number: surveyCount, 
                trend: "+100%", 
                subheading: "live system surveys" 
            },
            active_tasks: { 
                number: openTasks, 
                trend: openTasks > 0 ? "+Active" : "Stable", 
                subheading: "currently ongoing" 
            },
            volunteers: { 
                number: volunteers.length, 
                trend: volunteers.filter(v => v.is_available).length + " Available", 
                subheading: "registered members" 
            },
            urgent_needs: { 
                number: urgentTasks, 
                trend: urgentTasks > 0 ? "Action Req" : "Optimal", 
                subheading: "high priority tasks" 
            }
        },
        heatmap_data,
        category_distribution,
        task_trend
    };
};

/**
 * Get actionable insights for AIBriefPanel
 */
const getInsights = async () => {
    const tasksSnap = await db.collection('tasks').get();
    const allTasks  = tasksSnap.docs.map(doc => doc.data());
    
    const urgentCount = allTasks.filter(t => ['CRITICAL', 'HIGH'].includes((t.priority || '').toUpperCase()) && t.status !== 'completed').length;
    const topCategory = allTasks.length > 0 ? 
        Object.entries(allTasks.reduce((acc, t) => ({ ...acc, [t.category]: (acc[t.category] || 0) + 1 }), {}))
        .sort((a, b) => b[1] - a[1])[0][0] : 'General';

    const healthScore = Math.max(0, 100 - (urgentCount * 10));

    return {
        global_status: urgentCount > 0 
            ? `Action required: ${urgentCount} high-priority needs detected. Resource pressure is highest in ${topCategory} operations.`
            : "Operational status is optimal. No critical bottlenecks detected across active zones.",
        health_score: healthScore,
        insights: [
            { 
                priority: urgentCount > 5 ? "CRITICAL" : "HIGH", 
                title: "Demand Surge", 
                description: `${urgentCount} urgent tasks are pending. Consider mobilizing inactive volunteers.` 
            },
            { 
                priority: "MEDIUM", 
                title: "Sector Focus", 
                description: `${topCategory} continues to be the primary demand driver for SevaSetu resources.` 
            }
        ],
        last_updated: new Date().toISOString()
    };
};

module.exports = {
    getStats,
    getInsights
};
