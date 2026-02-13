import { Assessment, Course, Semester, Degree} from "./gradetypes";

function getAssessmentScoreToGrade(scoreOutOf: number, scoreActual: number, weight: number){
    const grade = (scoreActual / scoreOutOf) * weight;
    return grade;
}

function getCourseGrade(totalGrades: number[]){
    let total = 0;
    for (let i = 0; i < totalGrades.length; i++){
        total += totalGrades[i];
    }
    return total;
}

//Calculates the completion percentage of the course
function getCoursePercentCompleted(Assessments: Assessment[]){
    let percentage: number = 0;
    for (let i = 0; i < Assessments.length; i++){
        if (Assessments[i].isCompleted === true){
            percentage += Assessments[i].weight;
        }
    }
    return percentage;
}

//Calculates the score needed for an incomplete assessment to achieve the goal grade for a course.
function getAssessmentScoreNeeded(goalGrade: number, Assessments: Assessment[]){

}

//Calculates the WAM for a semester based on the courses completed in that semester.
function getSemesterWAM(courses: Course[]){

}

//Calculates the total WAM across all semesters completed.
function getTotalWAM(semesters: Semester[]){

}

//Calcutates the Grade needed to earn in the remaining courses(6cp) to achieve the goal WAM.
function getCourseWAMNeeded(goalWAM: number, totalWAM:number, creditsLeft: number){

}

//Calculates the total credits completed across all semesters.
function getTotalCreditsCompleted(semesters: any[]){
}

//Calculates the total credits left to complete the course.
function getCreditsLeft(creditsCompleted: number, creditsRequired: number){
    return creditsRequired - creditsCompleted;
}

//Calculates the total credits completed in a semester.
function getSemesterCredits(courses: any[]){
}

function getDegreePercentCompleted(creditsCompleted: number, creditsRequired: number){
    return (creditsCompleted / creditsRequired) * 100;
}