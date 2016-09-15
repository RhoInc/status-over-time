# Status Over Time
The status over time chart shows the number of events that are occurring over time for a generic event status. 

**Sample image goes here**

# Input data
json array with one record per event.  That has the following columns: 
- start_date (required) - mm/dd/yyyy
- stop_date (required) - mm/dd/yyyy
- status (required) - character 
- id (optional) character or array of character

# Chart details
The resulting chart has the following parameters: 
- y variable: # of studies 
- x variable: date 
- color: status
- controls
  - 

#Metacode  to prepare the data
- (optional) check for overlapping dates based on an id
- create a data set that is one record per date per status. `getStatusByDate(settings)`
  - create an array of dates where you want to take a snapshot `makeDateArray(first, last, increment)`
  - loop through the date array - get status list for each date `getStatus(raw, date)`
  	- flag events that are active on the given date 
  	- count flagged events 
- draw the chart