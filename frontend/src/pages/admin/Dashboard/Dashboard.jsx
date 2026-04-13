import Heatmap from "./Heatmap";
import TaskGraph from "./TaskGraph";
import UnassignedTask from "./UnassignedTask";

export default function Dashboard() {
  return (
    <div className="flex gap-12 p-4">
      <Heatmap />
      <div className="flex flex-2 gap-8 flex-wrap ">
        <TaskGraph />
        <div className=" ">
          <UnassignedTask />

        </div>
      </div>
    </div>
  )
}