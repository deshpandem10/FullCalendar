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
    var initialParticipantsOfDraggedEvent;
    var initiallocationOFDraggedEvent;
    var initialStartOfDraggedEvent;
    var initialEndOfDraggedEvent;

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
            $('#createTaskModal').off('change').on('change', '#selectParticipantOptions', function() {
                participantsSelected = $('#selectParticipantOptions').select2('val');
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
            $('#selectParticipantOptions').select2({
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

                if(participantsSelected.length == 0) {
                    alert("Please select participants for task/meeting.");
                    return;
                }

                if((eventLocation == "") || (eventLocation == undefined)) {
                    alert("Please select location for task/meeting.");
                    return;
                }

                if(endTimeOfEvent < startTimeOfEvent) {
                    alert("Please enter valid start time and end time.");
                    return;
                }

                var isChecked = $('#allDayEventCheckbox').is(':checked');
                if(!isChecked) {
                    if((eventTitle == "") || (startTimeOfEvent == "") || (endTimeOfEvent == "")) {
                        alert("Please mention whether the event is All Day event or else fill in the Start Time or End Time of event!");
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
        },
    });
})