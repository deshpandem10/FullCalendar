$(document).ready(function() {
    var eventArr = [];
    var startTime = [];
    var endTime = [];
    var participantsTopLevel = [];
    var taskList = [];
    var mapForParticipants = new Map();
    var myMap = new Map();
    var location = [];
    var mapForLocation = new Map();
    var description = [];
    var mapForDescription = new Map();
    var initialDateOfDraggedEvent;
    var initialEndOfDraggedEvent;

    // var date = new Date();
    // date.setMonth(date.getMonth() - 1, 1);
    // $('#datepicker').datepicker({defaultDate: date});

    var months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];

    var d = new Date();
    var newMonth = d.getMonth() - 1;
    var selectedMonthName = months[newMonth];

    if(selectedMonthName < 0){
        selectedMonthName += 12;
        d.setYear(d.getYear() - 1);
    }
    d.setMonth(selectedMonthName);

    console.log('last month: ', selectedMonthName);

    $('.prevMonthCalendar').fullCalendar({
      //  header: {
      //      left: 'title',
      //      center: '',
      //      right: 'prev,next today'
      //  },
        defaultDate: moment().add(-1, "months"),
    });

    $('.calendar').fullCalendar({
        header: {
            left: 'prev, next',
            center: 'title',
            right: 'month, agendaWeek, agendaDay'
        },
        events: [
            eventArr
        ],
        dayClick: function(date, allDay, event, view) {
            var eventTitle, startTimeOfEvent, endTimeOfEvent, eventLocation, eventDescription;
            var participantsSelected = [];
            var dateClicked = date.format();

            taskList = myMap.get(dateClicked);
            participantsTopLevel = mapForParticipants.get(dateClicked);
            location = mapForLocation.get(dateClicked);
            description = mapForDescription.get(dateClicked);

            // get the value of selected participants when any change on the dropdown from the modal is detected 
            $('#createTaskModal').off('change').on('change', '#selectParticipants', function() {
                participantsSelected = $('#selectParticipants').select2('val');
            });

            /** check date and clear scheduled tasks for new date clicked, starts */
            if(!(myMap.has(dateClicked))) {
                taskList = [];
                participantsTopLevel = [];
                location = [];
                description = [];
                $('#scheduledTasks').html('');
            }
            /** check date and clear schduled tasks for new date clicked, ends */

            var today = new Date();
            if(today.getHours() != 0 && today.getMinutes() != 0 &&  today.getSeconds() != 0 && today.getMilliseconds() != 0){
                today.setHours(0,0,0,0);
            }
            //if the date clicked from the calendar is past date, then the task creation should not be allowed;
            if(date < today) {
                Swal.fire({
                    type: 'warning',
                    title: 'Past Date!',
                    text: 'You cannot create events on Past Dates!'
                })
                return;
            }

            //if the clicked date from modal is not past date, open the modal to create task/event
            $('#createTaskModal').modal('show');

            //placeholder for select2 dropdown having participants 
            $('#selectParticipants').select2({
                placeholder: "Select Participants.."
            });

            $('#taskPriority').select2();

            jQuery('#eventStartTime').datetimepicker({
                datepicker:false,
                step: 15,
                minTime: '08:00',
                maxTime: '18:00',
                format:'H:i'
            });
            jQuery('#eventEndTime').datetimepicker({
                datepicker:false,
                step: 15,
                minTime: '08:00',
                maxTime: '18:15',
                format:'H:i'
            });

            var getTime;
            $('#createEvent').on('click', function() {
                eventTitle = document.getElementById('eventTitle').value;
                startTimeOfEvent = document.getElementById('eventStartTime').value;
                endTimeOfEvent = document.getElementById('eventEndTime').value;
                eventLocation = document.getElementById('eventLocation').value;
                eventDescription = document.getElementById('description').value;

                if (eventTitle == "") {
                    Swal.fire({
                        title: 'Oops..',
                        type: 'error',
                        text: 'Please enter the Task Title!'
                    });
                    return;
                }

                if(participantsSelected.length == 0) {
                    Swal.fire({
                        title: 'Oops..',
                        type: 'error',
                        text: 'Please select participants for the Task / Meeting!'
                    });
                    return;
                }

                if((eventLocation == "") || (eventLocation == undefined)) {
                    Swal.fire({
                        title: 'Oops..',
                        type: 'error',
                        text: 'Please select location for the Task / Meeting!'
                    });
                    return;
                }

                if(endTimeOfEvent < startTimeOfEvent) {
                    Swal.fire({
                        title: 'Oops..',
                        type: 'error',
                        text: 'Please enter valid start time and end time for the Task / Meeting!'
                    });
                    return;
                }

                var isChecked = $('#allDayEvent').is(':checked');
                if(!isChecked) {
                    if((eventTitle == "") || (startTimeOfEvent == "") || (endTimeOfEvent == "")) {
                        Swal.fire({
                            title: 'Oops..',
                            type: 'error',
                            text: 'Please mention whether the event is All Day event or else fill in the Start Time or End Time of event!'
                        });
                        return;
                    }
                }

                Swal.fire({
                    title: 'Are you sure?',
                    type: 'warning',
                    html: 'You are about to add an event to date '+ '<b style="color:red;">'+dateClicked+'</b>',
                    showCancelButton: true,
                    focusConfirm: false,
                    confirmButtonText: 'Add Event!',
                    cancelButtonText: 'Cancel',
                    allowOutsideClick: false,
                }).then((result) => {
                    if(result.value) {    
                        if((startTimeOfEvent != "") && (!isChecked)) {
                            let eventDateAndTime = function getAsDate (date, time) {
                                var hours = Number(time.match(/^(\d+)/)[1]);
                                var minutes = Number(time.match(/:(\d+)/)[1]);
                                var AMPM = String(time.match(/^(\w+)/)[1]);
                                if(AMPM == "pm" && hours<12) hours = hours+12;
                                if(AMPM == "am" && hours==12) hours = hours-12;
                                var sHours = hours.toString();
                                var sMinutes = minutes.toString();
                                if(hours<10) sHours = "0" + sHours;
                                if(minutes<10) sMinutes = "0" + sMinutes;
                                time = sHours + ":" + sMinutes + ":00";
                                var getDate = date;
                                var dateInString = getDate.toString();
                                var newDate = dateInString+"T"+time;
                                getTime = time;
                                return newDate;
                            }
                            var startDateAndTime = eventDateAndTime (dateClicked, startTimeOfEvent);

                            /** throw message if time conflicts with the participants selected, starts */
                            for (var i = 0; i < participantsTopLevel.length; i++) {
                                let members = participantsTopLevel[i];
                                let intersectionCheck = members.filter(element => participantsSelected.includes(element));
                                if(intersectionCheck.length > 0){
                                    if((getTime >= startTime[i]) && (getTime < endTime[i])) {
                                        alert("Task overlaps with either of the already scheduled tasks for the participant/s- "+intersectionCheck);
                                        return;
                                    }
                                }
                            }
                            /** throw message if time conflicts with the participants selected, ends */

                            participantsTopLevel.push(participantsSelected);
                            location.push(eventLocation);
                            description.push(eventDescription);
                            startTime.push(getTime);
                            var endDateAndTime = eventDateAndTime(dateClicked, endTimeOfEvent);
                            endTime.push(getTime);
                            mapForParticipants.set(dateClicked, participantsTopLevel);
                            mapForLocation.set(dateClicked, location);
                            mapForDescription.set(dateClicked, description);
                            
                            var eventWithTimings = {
                                id: generateUUID(),
                                title: eventTitle,
                                start: startDateAndTime,
                                end: endDateAndTime,
                                allDay: false,
                                editable: true,
                                color: selectEventColours()
                            }
                            
                            taskList.push(eventWithTimings);
                            myMap.set(dateClicked, taskList);
                            if(!(myMap.has(dateClicked))) {
                                taskList = [];
                                participantsTopLevel = [];
                                location = [];
                                description = [];
                            }
                            eventArr.push(eventWithTimings);
                            $('.calendar').fullCalendar('renderEvent', eventWithTimings, true); //the last parameter refers to 'stick' property
                            // it allows the event to stick even after switching weeks, months etc;
                        }
                        else {
                            if(isChecked) {
                                for (var i = 0; i < participantsTopLevel.length; i++) {
                                    let members = participantsTopLevel[i];
                                    let intersectionCheck = members.filter(element => participantsSelected.includes(element));
                                    if((intersectionCheck.length > 0) && ((myMap.has(dateClicked)))){
                                        alert("Task overlaps with either of the already scheduled tasks for the participant/s- "+intersectionCheck);
                                        return;
                                    }
                                }

                                participantsTopLevel.push(participantsSelected);
                                location.push(eventLocation);
                                description.push(eventDescription);
                                startTime.push("08:00");
                                endTime.push("18:00");
                                mapForParticipants.set(dateClicked, participantsTopLevel);
                                mapForLocation.set(dateClicked, location);
                                mapForDescription.set(dateClicked, description);
                            }

                            var eventFullDay = {
                                title: eventTitle,
                                start: dateClicked,
                                allDay: true,
                                editable: true,
                                color: selectEventColours()
                            }

                            taskList.push(eventFullDay);
                            myMap.set(dateClicked, taskList);
                            if(!(myMap.has(dateClicked))) {
                                taskList = [];
                                participantsTopLevel = [];
                                location = [];
                                description = [];
                            }
                            eventArr.push(eventFullDay);
                            $('.calendar').fullCalendar('renderEvent', eventFullDay, true); //the last parameter refers to 'stick' property
                            // it allows the event to stick even after switching weeks, months etc
                        }
                        $('#createTaskModal').modal('hide');
                        document.getElementById('createTaskForm').reset();
                        $('#eventStartTime').attr('disabled', false);
                        $('#eventEndTime').attr('disabled', false);
                    }
                });
            });
            // display the date clicked beside the heading of Scheduled Tasks
            document.getElementById('dateclicked').innerHTML = " " + "(" + dateClicked + ")";

            /** display the already scheduled tasks in the column-2 of modal */
            // scheduled tasks under the 'Scheduled Tasks' heading on modal
            var getDataOFMap = myMap.get(dateClicked);
            var getParticipantsFromMap = mapForParticipants.get(dateClicked);
            var getLocationFromMap = mapForLocation.get(dateClicked);
            var getDescriptionFromMap = mapForDescription.get(dateClicked);

            $('#allDayEvent').on('click', function() {
                let isCheckedAgain = $('#allDayEvent').is(':checked');
                if(isCheckedAgain == true) {
                    $('#eventStartTime').val("");
                    $('#eventEndTime').val("");
                    $('#eventStartTime').attr('disabled', 'disabled');
                    $('#eventEndTime').attr('disabled', 'disabled');
                } else if(isCheckedAgain == false) {
                    $('#eventStartTime').attr('disabled', false);
                    $('#eventEndTime').attr('disabled', false);
                }
            }); 
            
            if((myMap.size != 0) && (getDataOFMap != undefined)) {              
                $('#scheduledTasks').html('');
                for(i = 0; i < getDataOFMap.length; i++) {
                    if(getDataOFMap[i].end) {              // check if the element "end" of the object is present, if yes, then it is not All Day event
                        $('#scheduledTasks').append(
                            '<span class="scheduled_tasks_label">Title:  </span>' + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+'<span style="color:#2196f3;">'+  getDataOFMap[i].title + '</span>'+'<br/>' +
                            '<span class="scheduled_tasks_label">Start time:  </span>' + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+'<span style="color:#2196f3;">' +  getDataOFMap[i].start +'</span>'+ '<br/>' +
                            '<span class="scheduled_tasks_label">End time:  </span>' + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+'<span style="color:#2196f3;">' +  getDataOFMap[i].end  +'</span>'+ '<br/>' +
                            '<span class="scheduled_tasks_label">Participants:  </span>' + "&nbsp;&nbsp;"+'<span style="color:#2196f3;">' + getParticipantsFromMap[i]  +'</span>'+'<br/>' +
                            '<span class="scheduled_tasks_label">Location:  </span>' + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+'<span style="color:#2196f3;">' + getLocationFromMap[i]  +'</span>'+ '</br>' +
                            '<span class="scheduled_tasks_label">Description:  </span>' + "&nbsp;&nbsp;&nbsp;"+'<span style="color:#2196f3;">' + getDescriptionFromMap[i]  +'</span>'+'<br/><br/>'
                        );
                    }
                    else {
                        $('#scheduledTasks').append(
                            '<b>Title:  </b>' + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+'<span style="color:#2196f3;">'+  getDataOFMap[i].title + '</span>'+'<br/>' +
                            '<b>Full Day:  </b>' + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+'<span style="color:#2196f3;">' +" Yes " +'</span>' + '<br/>' +
                            '<b>Participants:  </b>' + "&nbsp;&nbsp;"+'<span style="color:#2196f3;">' + getParticipantsFromMap[i]  +'</span>'+ '<br/>' +
                            '<b>Location:  </b>' + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+'<span style="color:#2196f3;">' + getLocationFromMap[i]  +'</span>'+ '</br>' +
                            '<b>Description:  </b>' + "&nbsp;&nbsp;&nbsp;"+'<span style="color:#2196f3;">' + getDescriptionFromMap[i]  +'</span>'+'<br/><br/>'
                        );
                    }
                }              
            }
            /** ./..display the already sceduled tasks in the column-2 of modal */
        },

        eventClick: function(event, jsEvent, view) {
            var eventTitleOnClick = event.title;

            checkEventClick();
            function checkEventClick(renameTitle) {
                Swal.fire({
                    title: `What you want to do with event - ${eventTitleOnClick} ?`,
                    type: 'warning',
                    html: `<input type="text" id="TextBox-${renameTitle}" value="${eventTitleOnClick}">`,
                    showCancelButton: true,
                    focusConfirm: false,
                    confirmButtonText: 'Delete the Event',
                    cancelButtonText: 'Rename the Event',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: 'rgba(64, 171, 5, 1)',
                }).then((result) => {
                    if(result.value) {
                        var date = event.start.format();
                        var onlyDateFinal = date.substr(0, 10);
                        if(myMap.has(onlyDateFinal)) {
                            taskList = myMap.get(onlyDateFinal);
                        }

                        taskList.find(function(element) {
                            if(event.id === element.id) {
                                var taskIndex = taskList.indexOf(element);
                                taskList.splice(taskIndex, 1);
                            }
                            $('.calendar').fullCalendar('removeEvents', event.id);
                        });  
                    }
                    else {
                        var date = event.start.format();
                        var onlyDateFinal = date.substr(0, 10);
                        if(myMap.has(onlyDateFinal)) {
                            taskList = myMap.get(onlyDateFinal); 
                        }
                        taskList.find(function(element) {
                            if(event.id === element.id) {
                                var newTitle = document.getElementById("TextBox-"+renameTitle).value;
                                element.title = newTitle;
                            }
                            event.title = newTitle;
                            $('.calendar').fullCalendar('updateEvent', event);
                        });
                    }
                })  
            };
        },
    });
});

/** return colors randomly, starts */
function selectEventColours(){
    var colours = ['#9c27b0', '#2196f3', '#e91e63', '#f44336','#20e228', '#ffc107', 'ff9800', 'f19992', '009688',
                    '#ef8b8b', '#08de91', '#efae18', '#ad7900', '#ff15b5', '#9b22d6'
                ];
    var length = colours.length;
    var num = Math.floor(Math.random(0, length-1)*10);

    return colours[num];
}
/** return colors randomly, ends */

/** generate unique ID (UUID), starts */
function generateUUID() {
    var d = new Date().getTime();
    if(Date.now){
        d = Date.now(); //high-precision timer
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};
/** generate unique ID (UUID), ends */