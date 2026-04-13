export default function ProfileCardHighlightBox({title, color, Icon}){
    return (
        <div className={`border  w-20  rounded-lg p-1 pl-2 pr-2 text-xs text-center flex flex-col justify-center items-center gap-1 font-medium capitalize border-${color}-400 bg-${color}-50 text-${color}-400 `}>
            <Icon fontSize='small' />
            {title} 
        </div>
    )
}