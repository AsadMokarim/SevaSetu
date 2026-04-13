
import heatmap from '../../../assets/images/heatmap.png';

import "./Dashboard.css";

export default function Heatmap() {
    return (
        <div className=''>
            <div className='dashboardBox p-4 w-166  max-h-228 flex justify-center flex-col text-center'>
                <h2 className='font-semibold mb-2'>Dynamic Need Heatmap</h2>
                <i>sample image</i>
                {/* <img src={heatmap} alt="" className='rounded-2xl w-s ' /> */}
                <div
                    style={{ backgroundImage: `url(${heatmap})` }}
                    className="bg-no-repeat bg-contain h-100 rounded-2xl"
                ></div>

            </div>
        </div>
    )
}