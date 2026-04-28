export function getInitials(name) {
    return name
        .trim()
        .split(" ")
        .map(word => word[0].toUpperCase())
        .join("");
}


export function uniqueSkillCount(volunteerData) {
    const skills = volunteerData.flatMap(volunteer => volunteer.skills);
    const uniqueSkill = [...new Set(skills.map(s => s.toLowerCase()))];
    return uniqueSkill.length;
}

export function availableCount(volunteerData) {
    let count = 0;
    for (const volunteer of volunteerData) {
        if (volunteer.available) {
            count++;
        }
    }
    return count;
}