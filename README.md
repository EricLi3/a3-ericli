## The best todo list

Link: https://a3-ericli.onrender.com/

Include a very brief summary of your project here. Images are encouraged, along with concise, high-level text. Be sure to include:

- the goal of the application
- challenges you faced in realizing the application

- A lot of problems with connecting to Mongodb. Had to google a lot on server and best ways to seperate the logic.

- Problem with using id in MongoDb instead of idx which was a big change I had to figure out.

- I chose OAuth Authenetication via GitHub. My friend did something with this in the past and I wanted to give it a try. Had a problem with having a seperate login page, redirection didn't work upon login. I chose to resolve this by mantaining a single home page, hiding the main container div if the user isn't logged in and hiding the login button if the user is logged in.

- a list of Express middleware packages you used and a short (one sentence) summary of what each one does. If you use a custom function, please add a little more detail about what it does.

## Technical Achievements
- **Tech Achievement 1**:  Other hosting service (Failed)
I tried using vercel to host my website. This didn't work as you can see my link at the top of this README is Render. Vercel forces you to have endpoints as severless, also demanding a /api prefix before every endpoint. A good thing about vercel, much like Render, is that it deploys automatically upon commit. I am also familar with vercel, using it to host many projects in the past, but unfortuntly, it didn't work out this time.

- **Tech Achievement 2**: I used OAuth authentication via the GitHub strategy. (10 pts)
This was quite difficult in terms of debugging. One big breakthrough I had was finding this document: https://stackoverflow.com/questions/56106875/passport-req-user-is-undefined-when-using-github-strategy which led to me manually saving the session cookie, leading to successful auth. Overall, I used a lot of googling and referencing guides. The user will login via github, adding them to the usersCollection in my database, and will be presented with the tasks they already had specific to their user_id, and have the ability to add, edit, and delete tasks at will.


### Design/Evaluation Achievements
- **Design Achievement 1**: I followed the following tips from the W3C Web Accessibility Initiative...

1. Ensure that interactive elements are keyboard accessible
Made interactive elements easy to find by using standout colors also making it clear which element has focus.

2. Use clear, simple language: All instructions, labels, and buttons were reviewed and rewritten for clarity (eg: "Add Task", "Task Description", taskDueDate)

3. Use headings to convey meaning and structure: Used different headers such as h2 for login instructions and h3 for the edit popup innerHTML

4. Provide clear instructions: I have an interactive guide that shows and explains what each major user interaction on the site is and what to do. I also have placeholders in the input fields for task such as the taskTitle, taskDescription, and taskDueDate.

5. Visible focus indicators: CSS was updated to add a clear outline border: 1px solid #9eef92; for buttons, and input form fields, so keyboard users can easily see their location in the page.

6. Provide easily identifiable feedback: Added the required field for all input fields in to todo-form. In this way, if the user forgets to fill in TaskTitle for example, the application will show a popup saying that the field must be filled in to proceed.

7. Don’t use color alone to convey information: Added a css style for all reqauired inputs 

8. Ensure that form elements include clearly associated labels: Added descriptive associated labels for each form element. 