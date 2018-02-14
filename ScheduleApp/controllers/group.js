const GROUP = require('../models/group');

exports.getStudentsGroupInfoByTerm = function (req, res, next) {
    const term = req.params.term;
    const username = req.params.username.toUpperCase();

    GROUP.aggregate([{
        $match: {
            $and: [{
                type: 'Group'
            }, {
                term: term
            }, {
                students: {
                    $in: [username]
                }
            }]
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'students',
            foreignField: 'username',
            as: 'members'
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'faculty',
            foreignField: 'username',
            as: 'facultyMembers'
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
        $project: {
            termInfo: 1,
            type: 1,
            groupName: 1,
            class: 1,
            courses: {
                $filter: {
                    input: '$courseData',
                    as: 'course',
                    cond: {
                        $eq: ['$$course.term', term]
                    }
                }
            },
            members: {
                $filter: {
                    input: '$members',
                    as: 'member',
                    cond: {
                        $eq: ['$$member.term', term]
                    }
                }
            },
            facultyMembers: {
                $filter: {
                    input: '$facultyMembers',
                    as: 'faculty',
                    cond: {
                        $eq: ['$$faculty.term', term]
                    }
                }
            }
        }
    }], (err, groups) => {
        if (err) {
            handleError('Bad request!', res, 400, next);
        } else {
            try {
                const newGroups = [];
                for (let i = 0; i < groups.length; i++) {
                    const data = groups[i];
                    const term = getTermsGroupInfoTerm(data.termInfo);
                    const students = getMembersGroupInfoTerm(data.members);
                    const faculty = getFacultyGroupInfoTerm(data.facultyMembers);
                    const courses = getCoursesGroupInfoTerm(data.courses);
                    const group = createGroupInfoTerm(data, term, students, faculty, courses);
                    newGroups.push(group);
                }
                res.status(200);
                res.json(newGroups);
            } catch (error) {
                handleError('Could not find student information for given term', res, 404, next);
            }
        }
    });
};

function createGroupInfoTerm(data, term, students, faculty, courses) {
    return {
        _id: data._id,
        groupName: data.groupName,
        class: data.class,
        term: term,
        students: students,
        faculty: faculty,
        courses: courses
    };
}

function getTermsGroupInfoTerm(terms) {
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

function getMembersGroupInfoTerm(members) {
    const memberArr = [];

    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const majorStr = createMajorsString(member.majors);
        const minorStr = createMinorsString(member.minors);

        memberArr.push({
            _id: member._id,
            username: member.username,
            name: member.name,
            year: member.year,
            majors: majorStr,
            minors: minorStr,
            graduationDate: member.graduationDate,
            courses: member.courses
        });
    }

    return memberArr;
}

function getFacultyGroupInfoTerm(faculty) {
    const facultyArr = [];

    for (let i = 0; i < faculty.length; i++) {
        const member = faculty[i];
        facultyArr.push({
            _id: member._id,
            username: member.username,
            name: member.name,
            year: member.year,
            dept: member.dept,
        });
    }

    return facultyArr;
}

function getCoursesGroupInfoTerm(courses) {
    const coursesArr = [];

    for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        coursesArr.push({
            name: course.name,
            description: course.description,
            meetTimes: course.meetTimes,
            instructor: course.instructor
        });
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