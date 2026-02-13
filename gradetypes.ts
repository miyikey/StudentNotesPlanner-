export type Assessment = {
    name: string;
    weight: number;
    isCompleted: boolean;
    scoreOutOf: number;
    scoreActual: number;
    dueDate: Date;
}

export type Course = {
    name: string;
    credits: number;
    goalGrade: number;
    assessments: Assessment[];
}

export type Semester = {
    year: number;
    oneOrTwo: number;
    courses: Course[];
    totalSemesterCredits: number;
    WAM: number;
}

export type Degree = {
    name: string;
    totalCreditsRequired: number;
    semesters: Semester[];
    percentCompleted: number;
    currentWAM: number;
    goalWAM: number;
}