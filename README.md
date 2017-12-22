# Web Services Development Term Project

The goal of this project is to develop solutions to the Data Analysis problem specified in [this document](https://docs.google.com/document/d/1P3J0Xwf9KflFjOAjvjqfdWO7ZoD-Qr_P-TAfd8Sbcsc/edit#heading=h.d6upec61tp86).

A Total of 4 teams will be attempting to solve this problem.  

Project Team information is available at [this location](https://docs.google.com/spreadsheets/d/1KlALHhSs0u8uGtZSi3p62APzto7rEsPJ4RbjXQn5lRQ/edit#gid=0). 

Deadlines for various project milestones will be posted on the [course schedule page](https://www.rose-hulman.edu/class/csse/csse490WebServicesDev/201820/Schedule/Schedule.htm).

# Endpoints

1. `GET` /terms/:name:/courses/:roseId:/students  
2. `GET` /students/:name:/courses/:roseId:/students  
3. `GET` /students/:username:
4. `GET` /students/:username:/courses/:term:
5. ~~`GET` /students/:username:/courses~~
6. ~~`GET` /students/:username:/eval~~
7. `GET` /students/courses/:roseId:
8. `GET` /students/courses/:roseId:/not-taken


## Show Students in a Class for Given Term

Displays the list of students enrolled in a class for a current term     

* **URL**

    /:term/students/course/:name

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `term = String`  
    `name = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
      **Content:** `{ sucess: true }`
 
* **Error Response:**

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Term doesn't exist!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Course name doesn't exist!" }`

* **Sample Call:**

    Get the list of students currently enrolled in CSSE280 for the 201710 term

    `url: "/201710/students/course/CSSE280"`

## Show Student's for Given Term

Displays the student's course schedule for the provided term     

* **URL**

    /:term/student/:username

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `username = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
      **Content:** `{ sucess: true }`
 
* **Error Response:**

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Student doesn't exist!" }`

* **Sample Call:**

    Get bednartd's schedule for the 201710 term

    `url: "/201710/student/bednartd"`

## Show Students Who Are/Have Taken a Course

Displays the list of students who have already taken or are taking a class     

* **URL**

    /course/:name/students

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `name = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
      **Content:** `{ sucess: true }`
 
* **Error Response:**

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Course name doesn't exist!" }`

* **Sample Call:**

    Get all students who are taking/taken CSSE280
    
    `url: "/course/CSSE280/students"`

## Show Students Who Have Not Taken a Course

Displays the list of students who have not taken a course     

* **URL**

    /course/:name/students/not-taken

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `name = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
      **Content:** `{ sucess: true }`
 
* **Error Response:**

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Course name doesn't exist!" }`

* **Sample Call:**

    Get all students who have not taken CSSE280

    `url: "/course/CSSE280/students/not-taken"`
    
## Show Students by Year Who Are/Have Taken a Course

Displays the list of students with a given year or years enrolled in a class     

* **URL**

    /courses/:name/students/:year

* **Method:**

    `GET`
  
*  **URL Params**
 
    **Required:**
 
    `name = String`
    `year = String`  

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
      **Content:** `{ sucess: true }`
 
* **Error Response:**

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Year doesn't exist!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Course name doesn't exist!" }`

* **Sample Call:**

    Get all year 3 students who are taking/taken CSSE280

    `url: "/course/CSSE280/students/Y3"`

    Get all year 3 and up who are taking/taken CSSE280

    `url: "/course/CSSE280/students/Y3+"`

    Get all year 3 and lower who are taking/taken CSSE280

    `url: "/course/CSSE280/students/Y3-"`

## Show Students by Year Who Have not Taken a Course

Displays the list of students with a given year or years who have not taken a class   

* **URL**

    /courses/:name/students/not-taken/:year

* **Method:**

    `GET`
  
*  **URL Params**
 
    **Required:**
 
    `name = String`
    `year = String`  

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
      **Content:** `{ sucess: true }`
 
* **Error Response:**

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Year doesn't exist!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Course name doesn't exist!" }`

* **Sample Call:**

    Get all year 3 students who are have not taken CSSE280

    `url: "/course/CSSE280/students/not-taken/Y3"`

    Get all year 3 and up who have not taken CSSE280

    `url: "/course/CSSE280/students/not-taken/Y3+"`

    Get all year 3 and lower who have not taken CSSE280

    `url: "/course/CSSE280/students/not-taken/Y3-"`

## Show Faculty's Advisees

Displays a factulty's advisees for a given term

* **URL**

    /:term/faculty/:username/advisees

* **Method:**

    `GET`
  
*  **URL Params**
 
    **Required:**
 
    `term = String`
    `username = String`  

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
      **Content:** `{ sucess: true }`
 
* **Error Response:**

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Term doesn't exist!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Faculty doesn't exist!" }`

* **Sample Call:**

    Get all of defoe's advisees for the 201710 term

    `url: "/201710/faculty/defoe/advisee"`

## Show Individual Factuly's Advisee
Displays a single factulty's advisee for a given term

* **URL**

    /:term/faculty/:fusername/advisee/:susername

* **Method:**

    `GET`
  
*  **URL Params**
 
    **Required:**
 
    `term = String`
    `fusername = String`
    `susername = String`  

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
      **Content:** `{ sucess: true }`
 
* **Error Response:**

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Term doesn't exist!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Faculty doesn't exist!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Student doesn't exist!" }`

* **Sample Call:**

    Get bednartd's infromation as defoe for the 201710 term

    `url: "/201710/faculty/defoe/advisee/bednartd"`