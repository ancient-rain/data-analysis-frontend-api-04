# Index

Student Endpoints

* [Show Student Information Regardless of Term](#show-student-information-regardless-of-term)

* [Show Student Information by Term](#show-student-information-by-term)

Course Endpoints

* [Show a List of Courses and their Information By Term](#show-a-list-of-courses-and-their-information-by-term)

* [Show Course Information by Term](#show-course-information-by-term)

* [Show a List of Students Who Have Taken a Course](#show-a-list-of-students-who-have-not-taken-a-course)

* [Show a List of Students Who Have Not Taken a Course](#show-a-list-of-students-who-have-not-taken-a-course)

Faculty Endpoints

* [Show Faculty Information Regardless of Term](#show-faculty-information-regardless-of-term)

* [Show Faculty Information by Term](#show-faculty-information-by-term)

Term Endpoints

* [Show a List of Terms](#show-a-list-of-terms)

* [Show Term Information](#show-term-information)

# Endpoint Information

## Show Student Information Regardless of Term

* **URL**

    `/student/:username`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `username = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
 
* **Error Response:**

    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error : "Bad Request!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Could not find student information" }`

* **Sample Call:**

    `url: "/student/bednartd"`

## Show Student Information by Term

* **URL**

    `/student/:username/:term`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `username = String`
    `term = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
 
* **Error Response:**

    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error : "Bad Request!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Could not find student information with term" }`

* **Sample Call:**

    `url: "/student/bednartd/201710"`
    
## Show a List of Courses and their Information By Term

* **URL**

    `/courses/:course/:term`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `course = String`
    `term = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
 
* **Error Response:**

    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error : "Bad Request!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Could not find courses information with term" }`

* **Sample Call:**

    `url: "/courses/CSSE333/201630"` OR `url: "/courses/CSSE/201630"`
    
## Show Course Information by Term

* **URL**

    `/course/:course/:term`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `course = String`
    `term = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
 
* **Error Response:**

    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error : "Bad Request!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Could not find course information with term" }`

* **Sample Call:**

    `url: "/course/CSSE333-01/201630"`
    
## Show a List of Students Who Have Taken a Course

* **URL**

    `/courses/:name/students`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `name = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
 
* **Error Response:**

    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error : "Bad Request!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Could not find student information for course" }`

* **Sample Call:**

    `url: "/courses/CSSE330/students"`
    
## Show a List of Students Who Have Not Taken a Course

* **URL**

    `/courses/:name/students/not-taken`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `name = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
 
* **Error Response:**

    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error : "Bad Request!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Could not find student information for course" }`

* **Sample Call:**

    `url: "/courses/CSSE330/students/not-taken"`
    
## Show Faculty Information Regardless of Term

* **URL**

    `/faculty/:username`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `username = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
 
* **Error Response:**

    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error : "Bad Request!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Could not find faculty" }`

* **Sample Call:**

    `url: "/faculty/defoe"`
    
## Show Faculty Information by Term

* **URL**

    `/terms`

* **Method:**

    `GET`
  
*  **URL Params**

    None

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
      **Content:** `{ sucess: true }`
 
* **Error Response:**

    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error : "Bad Request!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Could not find information for terms" }`  
      
* **Sample Call:**


    `url: "/terms"`    
    
## Show a List of Terms

Displays the list of students enrolled in a class for a current term     

* **URL**

    `/student/:username/:term`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `username = String`
    `term = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
 
* **Error Response:**

    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error : "Bad Request!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Could not find student information with term" }`

* **Sample Call:**

    `url: "/student/bednartd/201710"`
    
## Show Term Information

* **URL**

    `/term/:term`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
    `term = String`

* **Data Params**

    None

* **Success Response:**

    * **Code:** 200 <br />
      **Content:** `{ sucess: true }`
 
* **Error Response:**

    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error : "Bad Request!" }`

    OR

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error : "Could not find information for term" }`  
      
* **Sample Call:**


    `url: "/term/201630"` 
    