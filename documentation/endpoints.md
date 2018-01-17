# Index
[Show Students in a Class for Given Term](#show-students-in-a-class-for-given-term)  

[Show Student's for Given Term](#show-student's-for-given-term)

[Show Students Who Are or Have Taken a Course](#show-students-who-are-or-have-taken-a-course)

[Show Students Who Have Not Taken a Course](#show-students-who-have-not-taken-a-course)

[Show Students by Year Who Are or Have Taken a Course](#show-students-by-year-who-are-or-have-taken-a-course)

[Show Students by Year Who Have not Taken a Course](#show-students-by-year-who-have-not-taken-a-course)

[Show Faculty Advisees](#show-faculty-advisees)

[Show Individual Faculty Advisee](#show-individual-factuly-advisee)

# Endpoint Information

## Show Students in a Class for Given Term

Displays the list of students enrolled in a class for a current term     

* **URL**

    `/:term/students/course/:name`

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

    `/:term/student/:username`

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

## Show Students Who Are or Have Taken a Course

Displays the list of students who have already taken or are taking a class     

* **URL**

    `/course/:name/students`

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

    `/course/:name/students/not-taken`

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
    
## Show Students by Year Who Are or Have Taken a Course

Displays the list of students with a given year or years enrolled in a class     

* **URL**

    `/courses/:name/students/:year`

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

## Show Students by Year Who Have Not Taken a Course

Displays the list of students with a given year or years who have not taken a class   

* **URL**

    `/courses/:name/students/not-taken/:year`

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

## Show Faculty Advisees

Displays a factulty's advisees for a given term

* **URL**

    `/:term/faculty/:username/advisees`

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

## Show Individual Factuly Advisee
Displays a single factulty's advisee for a given term

* **URL**

    `/:term/faculty/:fusername/advisee/:susername`

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