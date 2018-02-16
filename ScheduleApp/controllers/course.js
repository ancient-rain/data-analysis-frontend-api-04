const mongoose = require('mongoose');
const COURSE = mongoose.model('Course');
const STUDENT = mongoose.model('Student');
const FINAL_LENGTH = 400;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = [805, 900, 955, 1050, 1145, 1240, 1335, 1430, 1525, 1620];

exports.getCourseInfo = function (req, res, next) {
    const term = req.params.term;
    const name = req.params.name.toUpperCase();
    const course = new RegExp('.*' + name + '.*');

    COURSE.aggregate([{
        $match: {
            $and: [{
                    term: term
                },
                {
                    name: {
                        $regex: course
                    }
                }
            ]
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'term',
            foreignField: 'termKey',
            as: 'term'
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'name',
            foreignField: 'name',
            as: 'terms'
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'instructor',
            foreignField: 'username',
            as: 'prof'
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'name',
            foreignField: 'courses',
            as: 'students'
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'students.username',
            foreignField: 'advisees',
            as: 'advisors'
        }
    }, {
        $project: {
            term: 1,
            name: 1,
            description: 1,
            creditHours: 1,
            meetTimes: 1,
            terms: 1,
            advisors: {
                $filter: {
                    input: '$advisors',
                    as: 'advisor',
                    cond: {
                        $eq: ['$$advisor.term', term]
                    }
                }
            },
            students: {
                $filter: {
                    input: '$students',
                    as: 'students',
                    cond: {
                        $eq: ['$$students.term', term]
                    }
                }
            },
            instructor: {
                $filter: {
                    input: '$prof',
                    as: 'instructor',
                    cond: {
                        $eq: ['$$instructor.term', term]
                    }
                }
            }
        }
    }], (err, course) => {
        if (err) {
            handleError('Bad request!', res, 400, next);
        } else {
            try {
                const newCourse = [];

                for (let i = 0; i < course.length; i++) {
                    const data = course[i];
                    const studentMap = createStudentMap(data.students);
                    const term = getCourseTerms(data.term);
                    const terms = createTermsArray(data.terms);
                    const instructor = getCourseInstructor(data.instructor[0]);
                    const filteredTime = getClassTime(data.meetTimes);

                    updateMap(studentMap, data.advisors);
                    const students = getStudentsCourseInfo(data.students, studentMap);
                    const courseInfo = createCourseInfo(data, students, term, terms, instructor, filteredTime);
                    
                    newCourse.push(courseInfo);
                }

                res.status(200);
                res.json(newCourse);
            } catch (error) {
                handleError('Could not find course information for given term', res, 404, next);
            }
        }
    });
};

exports.getAllStudentsTaken = function (req, res, next) {
    const name = req.params.name.toUpperCase();
    const regex = new RegExp('.*' + name + '.*');
    let takenStudents;

    STUDENT.db.db.command({
        distinct: 'lookup',
        key: 'username',
        query: {
            courses: regex
        }
    }, (err, usernames) => {
        if (err) {
            handleError('Bad request!', res, 400, next);
        } else {
            try {
                takenStudents = usernames.values;
                if (takenStudents == null) {
                    handleError('Bad request!', res, 400, next);
                } else {
                    STUDENT.aggregate([{
                        $match: {
                            username: {
                                $in: takenStudents
                            }
                        }
                    }, {
                        $lookup: {
                            from: "lookup",
                            localField: "username",
                            foreignField: "advisees",
                            as: "advisor"
                        }
                    }, {
                        $project: {
                            term: 1,
                            username: 1,
                            name: 1,
                            year: 1,
                            graduationDate: 1,
                            minors: 1,
                            majors: 1,
                            advisor: 1,
                        }
                    }], (err, students) => {
                        if (err) {
                            handleError('Bad request!', res, 400, next);
                        } else {
                            try {
                                const studentArray = [];
                                const studentMap = {};

                                for (let i = 0; i < students.length; i++) {
                                    const data = students[i];

                                    if (!studentMap[data.username]) {
                                        const advisor = getAdvisor(data.advisor[0]);
                                        const majorStr = createMajorsString(data.majors);
                                        const minorStr = createMinorsString(data.minors);
                                        const newStudent = createStudentsList(data, advisor, majorStr, minorStr);
                                        studentArray.push(newStudent);
                                        studentMap[data.username] = true;
                                    }
                                }

                                res.status(200);
                                res.json(studentArray);
                            } catch (error) {
                                handleError('Could find not students who have taken given course', res, 404, next);
                            }
                        }
                    });
                }
            } catch (error) {
                handleError('Could not find students who have taken given course', res, 404, next);
            }
        }
    });
};

exports.getAllStudentsNotTaken = function (req, res, next) {
    const name = req.params.name.toUpperCase();
    const regex = new RegExp('.*' + name + '.*');
    let major = name.substring(0, 2);
    if (major === 'CS') {
        major = ['CS', 'SE'];
    } else {
        major = [major];
    }

    let returnStudents = null;
    let takenStudents = null;

    STUDENT.db.db.command({
        distinct: 'lookup',
        key: 'username',
        query: {
            $and: [{
                    type: 'Student'
                },
                {
                    majors: {
                        $in: major
                    }
                }
            ]
        }
    }, (err, usernames) => {
        if (err) {
            console.log(err);
        } else {
            returnStudents = usernames.values;
        }
    });

    STUDENT.db.db.command({
        distinct: 'lookup',
        key: 'username',
        query: {
            courses: {
                $in: [regex]
            }
        }
    }, (err, usernames) => {
        if (err) {
            console.log(err);
        } else {
            try {
                takenStudents = usernames.values;
                if (returnStudents == null || takenStudents == null) {
                    console.log('Error: Unable to find list of students who haven\'t taken course');
                } else {
                    returnStudents = returnStudents.filter(function (el) {
                        return takenStudents.indexOf(el) < 0;
                    });
                    STUDENT.aggregate([{
                        $match: {
                            username: {
                                $in: returnStudents
                            }
                        }
                    }, {
                        $lookup: {
                            from: "lookup",
                            localField: "username",
                            foreignField: "advisees",
                            as: "advisor"
                        }
                    }, {
                        $project: {
                            term: 1,
                            username: 1,
                            name: 1,
                            year: 1,
                            graduationDate: 1,
                            minors: 1,
                            majors: 1,
                            advisor: 1
                        }
                    }], (err, students) => {
                        if (err) {
                            handleError('Bad request!', res, 400, next);
                        } else {
                            try {
                                const studentArray = [];
                                const studentMap = {};

                                for (let i = 0; i < students.length; i++) {
                                    const data = students[i];

                                    if (!studentMap[data.username]) {
                                        const advisor = getAdvisor(data.advisor[0]);
                                        const majorStr = createMajorsString(data.majors);
                                        const minorStr = createMinorsString(data.minors);
                                        const newStudent = createStudentsList(data, advisor, majorStr, minorStr);
                                        studentArray.push(newStudent);
                                        studentMap[data.username] = true;
                                    }
                                }

                                res.status(200);
                                res.json(studentArray);
                            } catch (error) {
                                handleError('Could not find students who have not taken given course', res, 404, next);
                            }
                        }
                    });
                }
            } catch (error) {
                handleError('Bad request!', res, 400, next);
            }
        }
    });
};

exports.getYearStudentsTaken = function (req, res, next) {
    const name = req.params.name.toUpperCase();
    const regex = new RegExp('.*' + name + '.*');
    let takenStudents;

    STUDENT.db.db.command({
        distinct: 'lookup',
        key: 'username',
        query: {
            courses: regex
        }
    }, (err, usernames) => {
        if (err) {
            handleError('Bad request!', res, 400, next);
        } else {
            try {
                takenStudents = usernames.values;
                if (takenStudents == null) {
                    handleError('Bad request!', res, 400, next);
                } else {
                    STUDENT.aggregate([{
                        $match: {
                            $and: [{
                                year: req.params.year
                            }, {
                                username: {
                                    $in: takenStudents
                                }
                            }]
                        }
                    }, {
                        $lookup: {
                            from: "lookup",
                            localField: "username",
                            foreignField: "advisees",
                            as: "advisor"
                        }
                    }, {
                        $project: {
                            term: 1,
                            username: 1,
                            name: 1,
                            year: 1,
                            graduationDate: 1,
                            minors: 1,
                            majors: 1,
                            advisor: 1,
                        }
                    }], (err, students) => {
                        if (err) {
                            handleError('Bad request!', res, 400, next);
                        } else {
                            try {
                                const studentArray = [];
                                const studentMap = {};

                                for (let i = 0; i < students.length; i++) {
                                    const data = students[i];

                                    if (!studentMap[data.username]) {
                                        const advisor = getAdvisor(data.advisor[0]);
                                        const majorStr = createMajorsString(data.majors);
                                        const minorStr = createMinorsString(data.minors);
                                        const newStudent = createStudentsList(data, advisor, majorStr, minorStr);
                                        studentArray.push(newStudent);
                                        studentMap[data.username] = true;
                                    }
                                }

                                res.status(200);
                                res.json(studentArray);
                            } catch (error) {
                                handleError('Could not students who have taken given course', res, 404, next);
                            }
                        }
                    });
                }
            } catch (error) {
                handleError('Could not students who have taken given course', res, 404, next);
            }
        }
    });
};

exports.getYearStudentsNotTaken = function (req, res, next) {
    const name = req.params.name.toUpperCase();
    const regex = new RegExp('.*' + name + '.*');
    let major = name.substring(0, 2);
    if (major === 'CS') {
        major = ['CS', 'SE'];
    } else {
        major = [major];
    }

    let returnStudents = null;
    let takenStudents = null;

    STUDENT.db.db.command({
        distinct: 'lookup',
        key: 'username',
        query: {
            $and: [{
                    year: req.params.year
                }, {
                    type: 'Student'
                },
                {
                    majors: {
                        $in: major
                    }
                }
            ]
        }
    }, (err, usernames) => {
        if (err) {
            console.log(err);
        } else {
            returnStudents = usernames.values;
        }
    });

    STUDENT.db.db.command({
        distinct: 'lookup',
        key: 'username',
        query: {
            courses: {
                $in: [regex]
            }
        }
    }, (err, usernames) => {
        if (err) {
            console.log(err);
        } else {
            try {
                takenStudents = usernames.values;
                if (returnStudents == null || takenStudents == null) {
                    console.log('Error: Unable to find list of students who haven\'t taken course');
                } else {
                    returnStudents = returnStudents.filter(function (el) {
                        return takenStudents.indexOf(el) < 0;
                    });
                    STUDENT.aggregate([{
                        $match: {
                            $and: [{
                                year: req.params.year
                            }, {
                                username: {
                                    $in: returnStudents
                                }
                            }]
                        }
                    }, {
                        $lookup: {
                            from: "lookup",
                            localField: "username",
                            foreignField: "advisees",
                            as: "advisor"
                        }
                    }, {
                        $project: {
                            term: 1,
                            username: 1,
                            name: 1,
                            year: 1,
                            graduationDate: 1,
                            minors: 1,
                            majors: 1,
                            advisor: 1
                        }
                    }], (err, students) => {
                        if (err) {
                            handleError('Bad request!', res, 400, next);
                        } else {
                            try {
                                const studentArray = [];
                                const studentMap = {};

                                for (let i = 0; i < students.length; i++) {
                                    const data = students[i];

                                    if (!studentMap[data.username]) {
                                        const advisor = getAdvisor(data.advisor[0]);
                                        const majorStr = createMajorsString(data.majors);
                                        const minorStr = createMinorsString(data.minors);
                                        const newStudent = createStudentsList(data, advisor, majorStr, minorStr);
                                        studentArray.push(newStudent);
                                        studentMap[data.username] = true;
                                    }
                                }

                                res.status(200);
                                res.json(studentArray);
                            } catch (error) {
                                handleError('Could not find students who have not taken given course', res, 404, next);
                            }
                        }
                    });
                }
            } catch (error) {
                handleError('Bad request!', res, 400, next);
            }
        }
    });
};

function createCourseInfo(data, students, term, terms, instructor, filteredTime) {
    return {
        name: data.name,
        description: data.description,
        instructor: instructor,
        creditHours: data.creditHours,
        meetTimes: data.meetTimes,
        filteredTime: filteredTime,
        term: term,
        terms: terms,
        students: students,
        numStudents: students.length
    };
}

function createCoursesInfo(data, numStudents, terms, filteredTimes) {
    return {
        _id: data._id,
        term: data.term,
        name: data.name,
        description: data.description,
        creditHours: data.creditHours,
        meetTimes: data.meetTimes,
        instructor: data.instructor,
        numStudents: numStudents,
        filteredTimes: filteredTimes.trim(),
        terms: terms
    };
}

function createStudentsList(data, advisor, majorStr, minorStr) {
    return {
        term: data.term,
        username: data.username,
        year: data.year,
        name: data.name,
        major: majorStr,
        minor: minorStr,
        advisor: advisor
    };
}

function createStudentMap(students) {
    const map = {};
    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        map[student.username] = '';
    }
    return map;
}

function updateMap(map, advisors) {
    for (let i = 0; i < advisors.length; i++) {
        const advisor = advisors[i];
        const username = advisor.username;
        for (let j = 0; j < advisor.advisees.length; j++) {
            const advisee = advisor.advisees[j];
            if (map.hasOwnProperty(advisee)) {
                map[advisee] = username;
            }
        }
    }
}

function getCourseInstructor(instructor) {
    return {
        username: instructor.username,
        dept: instructor.dept
    };
}

function getCourseTerms(terms) {
    const termsArr = [];

    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        const termName = getTermName(term.termKey);
        termsArr.push({
            _id: term._id,
            term: term.termKey,
            name: termName,
            startDate: term.startDate,
            endDate: term.endDate
        });
    }

    return termsArr;
}

function getTermName(key) {
    const year = key.substring(0, 4);
    const term = key.substring(4);
    switch (term) {
        case '10':
            return `Fall ${year}`;
        case '20':
            return `Winter ${year}`;
        case '30':
            return `Spring ${year}`;
        default:
            return `Summer ${year}`;
    }
}

function createTermsArray(terms) {
    const array = [];

    for (let i = 0; i < terms.length; i++) {
        array.push(terms[i].term);
    }

    return array;
}

function getStudentsCourseInfo(students, map) {
    const studentsArr = [];
    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const majorStr = createMajorsString(student.majors);
        const minorStr = createMinorsString(student.minors);
        studentsArr.push({
            _id: student._id,
            term: student.term,
            username: student.username,
            name: student.name,
            year: student.year,
            majors: majorStr,
            minors: minorStr,
            graduationDate: student.graduationDate,
            advisor: map[student.username]
        });
    }
    return studentsArr;
}

function getCourseData(courses) {
    const coursesArr = [];
    for (let i = 0; i < courses.length; i++) {
        const data = courses[i];
        const numStudents = data.students.length;
        const terms = getCourseTerms(data.terms);
        const filteredTimes = getClassTime(data.meetTimes);
        const course = createCoursesInfo(data, numStudents, terms, filteredTimes);
        coursesArr.push(course);
    }
    return coursesArr;
}

function getClassTime(meetTimes) {
    const courseTime = meetTimes.replace(/  /g, ' ');
    const times = courseTime.split(' ');
    return filterClass(courseTime, times);
}

function filterClass(courseTime, times) {
    let time = '';
    for (let i = 0; i < times.length; i = i + 2) {
        const days = times[i];
        const hours = times[i + 1].split('-');
        const start = parseInt(hours[0], 10);
        const end = parseInt(hours[1], 10);

        if (days.length <= 1) {
            const isFinal = end - start >= FINAL_LENGTH;
            if (!isFinal) {
                time += getFilteredClass(days, start, end);
            }
        } else {
            time += getFilteredClass(days, start, end);
        }
    }
    return time;
}

function getFilteredClass(days, start, end) {
    let isStarted = false;
    let hoursStr = '';

    for (let i = 0; i < HOURS.length; i++) {
        const curHour = HOURS[i];
        if (start <= curHour && !isStarted) {
            isStarted = true;
            hoursStr += i + 1;
        } else if (end <= curHour && isStarted) {
            if (hoursStr !== `${i}`) {
                hoursStr += `-${i}`;
            }
            hoursStr += ' ';
            break;
        } else if (isStarted && i + 1 >= HOURS.length) {
            hoursStr += `-${i + 1}`;
            hoursStr += ' ';
            break;
        }
    }

    const classStr = `${days}/${hoursStr}`;

    return classStr === '/' ? 'TBA' : classStr;
}

function getAdvisor(advisor) {
    return advisor ? advisor.username : '';
}

function createMajorsString(majors) {
    let majorStr = '';

    majors.pop();

    for (let i = 0; i < majors.length; i++) {
        majorStr += `${majors[i]}`;
        if (i + 1 < majors.length) {
            majorStr += '/';
        }
    }

    return majorStr;
}

function createMinorsString(minors) {
    let minorStr = '';

    minors.pop();

    for (let i = 0; i < minors.length; i++) {
        minorStr += `${minors[i]}`;
        if (i + 1 < minors.length) {
            minorStr += '/';
        }
    }

    return minorStr;
}

function handleError(err, res, statusCode, next) {
    res.status(statusCode);
    err.status = statusCode;
    console.log(err);
    next(err);
}