import "./Dashboard.css";
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis, Tooltip } from 'recharts';

export default function TaskGraph() {
    const taskData = [
        { month: "Oct", created: 45, closed: 38 },
        { month: "Nov", created: 52, closed: 44 },
        { month: "Dec", created: 60, closed: 50 },
        { month: "Jan", created: 70, closed: 65 },
        { month: "Feb", created: 65, closed: 60 },
        { month: "Mar", created: 80, closed: 72 },
    ];
    return (
        <div className='flex-1 h-68 p-4 dashboardBox'>
            <h3 className="font-semibold mb-4">Created Vs Closed tasks for last 6 months</h3>
            <LineChart height={220} data={taskData} style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }} responsive className="focus:outline-none -ml-4">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Legend align="right" />
                <Tooltip />

                <Line type="monotone" dataKey="created" stroke="orange" strokeWidth={2} name="Created" />

                <Line type="monotone" dataKey="closed" stroke="green" strokeWidth={2} name="Closed" />

            </LineChart>


        </div>
    )
}