# FullCalendar Scheduler 

This repo gives overview on FullCalendar API implementation and an extention to it to schedule a task or event on any particular date.

The project allows user to create tasks on a date clicked on calendar, have list of all tasks for that particular date and move the 
scheduled tasks from one date to another date by dragging and dropping.

The task/event creation on past dates is not allowed, alert is thrown in that case. Overlapping in time of tasks having same participant 
is not permitted, alert is thrown.


## How to use -

FullCalender Scheduler application can be used to schedule meetings.

- Click on the date you desire to create a task or meeting on that date

- Once clicked on the date, a Bootstrap modal opens which contains form and fields where the details of the task/event/schedule needs to be entered

- The fields marked with red astrek on them are mandatory fields to create a task/schedule

- Once all the details are entered and submitted on click of 'Create an Event' button, the alert will popup to confirm, and once confirmed, the even or schedule is created which will be displayed on calendar as a colored strip

- When the same date is again clicked, the second column on the Bootstrap modal shall display the already scheduled event along with it's necessary details

- This event or scheduled meeting/task can be dragged and dropped on the other dates in order to postpone and prepone the already scheduled events/meetings

- Creating events or scheduling meetings/tasks on past dates is not allowed. Weekend Friday dates are displayed in red color font, however user can still create events or schedule meeting on Friday
