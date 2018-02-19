const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const STUDENT = mongoose.model('Student');
const FACULTY = mongoose.model('Faculty');
const TERM = mongoose.model('Term');
const COURSE = mongoose.model('Course');
const GROUP = mongoose.model('Group');
const studentController = require('../controllers/student');
const facultyController = require('../controllers/faculty');
const courseController = require('../controllers/course');
const groupController = require('../controllers/group');

router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    next();
});

/**
 * @swagger
 * "/course/{name}/{term}":
 *   get:
 *     parameters:
 *     - name: "name"
 *       in: path
 *       description: "Name of course"
 *       required: true
 *       type: "string"

 *     responses:
 *       200:
 *         description: "Course info for term found"
 *         schema:
 *           items:
 *             $ref: "#/definitions/CourseInfo"
 *       404:
 *         description: "Could not find course info for term"
 */
router.get('/course/:name/:term', courseController.getCourseInfo);

/**
 * @swagger
 * "/course/{name}/students-taken/all":
 *   get:
 *     parameters:
 *     - name: "name"
 *       in: path
 *       description: "Name of course"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: "Listing all students who have taken course"
 *         schema:
 *           items:
 *             $ref: "#/definitions/CourseInfoListStudents"
 *       404:
 *         description: "Could not find info for students who have taken course"
 */
router.get('/course/:name/students-taken/all', courseController.getAllStudentsTaken);

/**
 * @swagger
 * "/course/{name}/students-taken/{year}":
 *   get:
 *     parameters:
 *     - name: "name"
 *       in: path
 *       description: "Name of course"
 *       required: true
 *       type: "string"
 *     - name: "year"
 *       in: path
 *       description: "Year of students"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: "Listing year of students who have taken course"
 *         schema:
 *           items:
 *             $ref: "#/definitions/CourseInfoListStudents"
 *       404:
 *         description: "Could not find info for students who have taken course"
 */
router.get('/course/:name/students-taken/:year', courseController.getYearStudentsTaken);

/**
 * @swagger
 * "/course/{name}/students-not-taken/all":
 *   get:
 *     parameters:
 *     - name: "name"
 *       in: path
 *       description: "Name of course"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: "Listing all students who have not taken course"
 *         schema:
 *           items:
 *             $ref: "#/definitions/CourseInfoListStudents"
 *       404:
 *         description: "Could not find info for students who have not taken course"
 */
router.get('/course/:name/students-not-taken/all', courseController.getAllStudentsNotTaken);

/**
 * @swagger
 * "/course/{name}/students-not-taken/{year}":
 *   get:
 *     parameters:
 *     - name: "name"
 *       in: path
 *       description: "Name of course"
 *       required: true
 *       type: "string"
 *     - name: "year"
 *       in: path
 *       description: "Year of students"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: "Listing year of students who have not taken course"
 *         schema:
 *           items:
 *             $ref: "#/definitions/CourseInfoListStudents"
 *       404:
 *         description: "Could not find info for students who have not taken course"
 */
router.get('/course/:name/students-not-taken/:year', courseController.getYearStudentsNotTaken);

/**
 * @swagger
 * "/faculty/{username}":
 *   get:
 *     parameters:
 *     - name: "username"
 *       in: path
 *       description: "Username of faculty"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: "Faculty info found"
 *         schema:
 *           items:
 *             $ref: "#/definitions/FacultyInfo"
 *       404:
 *         description: "Could not find faculty info"
 */
router.get('/faculty/:username', facultyController.getFacultyInfo);

/**
 * @swagger
 * "/faculty/{username}/{term}":
 *   get:
 *     parameters:
 *     - name: "username"
 *       in: path
 *       description: "Username of faculty"
 *       required: true
 *       type: "string"
 *     - name: "term"
 *       in: path
 *       description: "Term to look for"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: "Faculty info by term found"
 *         schema:
 *           items:
 *             $ref: "#/definitions/FacultyInfoTerm"
 *       404:
 *         description: "Could not find faculty info by term"
 */
router.get('/faculty/:username/:term', facultyController.getFacultyInfoByTerm);

/**
 * @swagger
 * "/group":
 *   post:
 *     responses:
 *       200:
 *         description: "Student info by term found"
 *         schema:
 *           items:
 *             $ref: "#/definitions/Group"
 *       400:
 *         description: "Bad request! Make sure you include all parameters."
 */
router.post('/group', groupController.createGroup);

/**
 * @swagger
 * "/group/{id}":
 *   get:
 *     parameters:
 *     - name: "id"
 *       in: path
 *       description: "ID of group"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: "Group found"
 *         schema:
 *           items:
 *             $ref: "#/definitions/GroupInfo"
 *       404:
 *         description: "Could not find group by id"
 */
router.get('/group/:id', groupController.getGroupById);

/**
 * @swagger
 * "/group/{id}":
 *   delete:
 *     parameters:
 *     - name: "id"
 *       in: path
 *       description: "ID of group"
 *       required: true
 *       type: "string"
 *     responses:
 *       204:
 *         description: "Group deleted"
 *       404:
 *         description: "Could not find group by id"
 */
router.delete('/group/:id', groupController.deleteGroup);

/**
 * @swagger
 * "/student/{username}":
 *   get:
 *     parameters:
 *     - name: "username"
 *       in: path
 *       description: "Username of student"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: "Student info found"
 *         schema:
 *           items:
 *             $ref: "#/definitions/StudentInfo"
 *       404:
 *         description: "Could not find student info"
 */
router.get('/student/:username', studentController.getStudentInfo);

/**
 * @swagger
 * "/student/{username}/{term}":
 *   get:
 *     parameters:
 *     - name: "username"
 *       in: path
 *       description: "Username of student"
 *       required: true
 *       type: "string"
 *     - name: "term"
 *       in: path
 *       description: "Term to look for"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: "Student info by term found"
 *         schema:
 *           items:
 *             $ref: "#/definitions/StudentInfoTerm"
 *       404:
 *         description: "Could not find student info by term"
 */
router.get('/student/:username/:term', studentController.getStudentInfoByTerm);

/* TODO */
router.get('/students/:term/*', studentController.getStudentsBySearch);

module.exports = router;
