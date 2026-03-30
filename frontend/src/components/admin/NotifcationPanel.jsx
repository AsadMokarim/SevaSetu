import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { v4 as uuidv4 } from 'uuid';

export default function NotificationPanel({ notifications }) {
    notifications = [
        {
            title: "Warning",
            description: "this is sample desc",
            severity: "warning"
        },
        {
            title: "Warning",
            description: "this is sample desc",
            severity: "warning"
        },
        {
            title: "Error",
            description: "this is sample desc",
            severity: "error"
        }
    ];
    return (
        <div className='flex flex-col gap-2 p-4 w-72'>
            {
                notifications.map((alert) => (
                    <Alert severity={alert.severity} key={uuidv4()} style={{ borderRadius: "7px" }}>
                        <AlertTitle>{alert.title}</AlertTitle>
                        {alert.description}
                    </Alert>
                ))
            }
        </div>
    )
}