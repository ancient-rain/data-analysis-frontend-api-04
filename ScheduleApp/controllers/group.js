const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const GROUP = require('../models/group');

exports.getGroupById = function (req, res, next) {
    const id = req.params.id;

    GROUP.aggregate([{
        $match: {
            $and: [{
                type: 'Group'
            }, {
                _id: ObjectId(id)
            }]
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'members',
            foreignField: 'username',
            as: 'members'
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'term',
            foreignField: 'termKey',
            as: 'termInfo'
        }
    }, {
        $lookup: {
            from: "lookup",
            localField: "members.courses",
            foreignField: "name",
            as: "courseData"
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'members.username',
            foreignField: 'instructor',
            as: 'facultyCourseData'
        }
    }, {
        $project: {
            termInfo: 1,
            type: 1,
            groupName: 1,
            for: 1,
            forClass: 1,
            courseData: 1,
            members: 1,
            facultyCourseData: 1
        }
    }], (err, group) => {
        if (err) {
            handleError('Bad request!', res, 400, next);
        } else {
            try {
                const data = group[0];
                const term = data.termInfo[0].termKey;
                const facultyCourses = getFacultyCourses(data.members, data.facultyCourseData, term);
                const members = getMembersGroupInfoTerm(data.members, facultyCourses, term);
                const courses = getCoursesGroupInfoTerm(data.courseData, members, term);
                const newGroup = createGroupInfoTerm(data, term, members, courses);

                res.status(200);
                res.json([newGroup]);
            } catch (error) {
                handleError('Could not find student information for given term', res, 404, next);
            }
        }
    });
};

exports.createGroup = function (req, res, next) {
    const members = [];

    for (let i = 0; i < req.body.members.length; i++) {
        const member = req.body.members[i];
        members.push(member.toUpperCase());
    }

    GROUP.create({
        type: 'Group',
        groupName: req.body.groupName,
        term: req.body.term,
        for: req.body.for,
        forClass: req.body.forClass,
        members: req.body.members
    }, (err, group) => {
        if (err) {
            handleError(err, 'Bad request!', 400, next);
        } else {
            res.json(group);
        }
    });
};

exports.deleteGroup = function (req, res, next) {
    const id = req.params.id;

    if (id) {
        GROUP.findByIdAndRemove(id, (err, book) => {
            if (err) {
                handleError(err, 'Server error!', 500, next);
            } else {
                res.status(204);
                res.json(null);
            }
        });
    } else {
        handleError(err, 'Could not find group with request ID!', 404, next);
    }
};

function createGroupInfoTerm(data, term, members, courses) {
    return {
        _id: data._id,
        groupName: data.groupName,
        for: data.for,
        forClass: data.forClass,
        term: term,
        members: members,
        courses: courses
    };
}

function getTermsGroupInfoTerm(terms) {
    const termsArr = [];

    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        const termName = getTermName(term.termKey);
        termsArr.push({
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

function getFacultyCourses(members, courses, term) {
    const coursesArr = [];

    for (let i = 0; i < members.length; i++) {
        const member = members[i];

        if (member.type === 'Faculty' && member.term === term) {
            const listCourses = [];

            for (let j = 0; j < courses.length; j++) {
                const course = courses[j];

                if (member.username === course.instructor && course.term === term) {
                    listCourses.push(course.name);
                }
            }

            coursesArr.push({
                username: member.username,
                courses: listCourses
            });
        }
    }

    return coursesArr;
}

function getMembersGroupInfoTerm(members, facultyCourses, term) {
    const memberArr = [];

    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        if (member.term === term) {
            if (member.type === 'Student') {
                addStudent(member, memberArr);
            } else {
                addFaculty(member, facultyCourses, memberArr);
            }
        }
    }

    return memberArr;
}

function addStudent(member, memberArr) {
    const majorStr = createMajorsString(member.majors);
    const minorStr = createMinorsString(member.minors);

    memberArr.push({
        username: member.username,
        name: member.name,
        courses: member.courses
    });
}

function addFaculty(member, facultyCourses, memberArr) {
    for (let i = 0; i < facultyCourses.length; i++) {
        const faculty = facultyCourses[i];

        if (faculty.username === member.username) {
            memberArr.push({
                username: member.username,
                name: member.name,
                courses: faculty.courses
            });
            break;
        }
    }
}

function getCoursesGroupInfoTerm(courses, students, term) {
    const coursesArr = [];
    const availableCourses = {};

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        for (let j = 0; j < student.courses.length; j++) {
            const course = student.courses[j];
            availableCourses[course] = course;
        }
    }

    for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        if (availableCourses[course.name] && course.term === term) {
            coursesArr.push({
                name: course.name,
                description: course.description,
                meetTimes: course.meetTimes,
                instructor: course.instructor,
                creditHours: course.creditHours
            });
        }
    }

    return coursesArr;
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