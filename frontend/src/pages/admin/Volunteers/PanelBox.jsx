import "./PanelBox.css"

export default function Panel({heading, subHeading="", Icon, additionalClass=""}){
    return(
        <div className={`PanelBox ${additionalClass}`}>
          <div>
            <h2 className="text-[#287bff] font-bold text-2xl text-center">{heading}</h2>
            <h5 className="text-gray-500 text-sm mt-1">{subHeading}</h5>
          </div>
          <Icon className='text-gray-500' sx={{fontSize: 40}} />

        </div>
    )
}