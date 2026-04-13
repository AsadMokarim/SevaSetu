import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ConstructionIcon from '@mui/icons-material/Construction';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Panel from './PanelBox';

import { v4 as uuidv4 } from "uuid";




import ProfileCard from './ProfileCard';
import SearchFilters from './SearchFilters';


export default function Volunteers({ volunteerData }) {
  volunteerData = [
    {
      name: "Asad Mokarim",
      skills: ["coding", "editing", "education"],
      age: 19,
      historyOfTask: ["2992", "292993"],
      languages: ["english", "hindi"],
      available: true,
      location: "Aligarh",
      category: "Technical"
    },
    {
      name: "Harsh Kumar",
      skills: ["sleep", "clean", "programming", "editing", "coding"],
      age: 19,
      historyOfTask: ["2992", "292993","828838"],
      languages: ["english", "hindi"],
      available: false,
      location: "Aligarh",
      category: "management"
    }
  ]

  function uniqueSkillCount(volunteerData) {
    const skills = volunteerData.flatMap(volunteer => volunteer.skills);
    const uniqueSkill = [...new Set(skills.map(s => s.toLowerCase()))];
    return uniqueSkill.length;
  }
  console.log()

  function availableCount(volunteerData) {
    let count = 0;
    for (const volunteer of volunteerData) {
      if (volunteer.available) {
        count++;
      }
    }
    return count;
  }



  return (
    <div>
      <div className="flex gap-8">
        <Panel heading={`${availableCount(volunteerData)}/${volunteerData.length}`} Icon={PeopleAltOutlinedIcon} subHeading='Available' />
        <Panel heading={uniqueSkillCount(volunteerData)} Icon={ConstructionIcon} subHeading='Unique Skilled' />
        <button className='ml-auto'>
          <Panel heading="Add Volunteer" Icon={PersonAddAlt1Icon} additionalClass="addBtn" />
        </button>
      </div>

      <SearchFilters />






      <ul className='mt-8 min-h-96  rounded-2xl flex flex-col gap-4'>
        {volunteerData.map((volunteer) => (
          <ProfileCard volunteer={volunteer} key={uuidv4()} />

        ))}
      </ul>
    </div>
  )
}