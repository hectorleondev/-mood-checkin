# Working with AI

##  Prompt 1
```
pleasse create model with follwing schema in /backend

MoodCheckIn

User (who logged it) Model
score (1 to 10) number
note string
created_at: Datetime
timezone: String
Users
id: number, pk
firstname: String
lastname: String
```

## Prompt 2
```
pleasse create model with follwing schema in /backend with follwing details

MoodCheckIn

id: autoincrement, pk
User: Users # Using Django User model, required field
score: Number # please range (1-10) in model and required field
note string # is optional
created_at: Datetime # by default set today.now(), optional
timezone: String # set timezone of server by default

Criterias
* User register one checkin per day
```

## Prompt 3
```
Apply follwing change in MoodCheckIn model
Remove timezone field and clean()
Add uniquecontraint(user, created_at)
```

## Prompt 4
```
Remove created_at due business rule is one record per day and creat_at is datetime check sedons and minutes 
Create date: Date(dd-mm-yyy)
Chanque uniquecontraint (user, date)
add Check constraint so score range 1 to 10
finally generate migrarion
```

## Prompt 5
```
keep created_at for audit auto_now_add=True
update Add date: DateField and remove default required field
```

## Prompt 6
```
Apply follwing changes in Dkango project

Install DRF
Install DRF-simple jwt
include BOTH defintions in settingd.py INSTALLED_APPS and REST_FREMWROK
set simple-jwt with lifetime 5 minutes and refreh token with 1 day and active rorate token
Set rule CORS for localhost:5173
Changes related eith MoodCheckIn model

Include MoodCheckIn in admin.py
show all columns in the table
Include Edit, Created and delete actions
Create MoodCheckInSerializer and use all fields and include UserSerializaer many=true and use first_name, lastname and id
Create ViewSet and use use prefetch_related with user to fill list intead of .all()
Follwing endpoints
Get /api/mood-checkins #all (IsAuthenticated)
Get /api/mood-checkins/id
Get /api/mood-checkins/user/<userid>
Post /api/mood-checkin (IsAuthenticated)
Patch /api/mood-checkin (IsAuthenticated)
Delete /api/mood-checkin (IsAuthenticated)
Changes related eith User model
include Users in admn.py

show follwing columns in the table (id, username, firstname and lastname)
action create, update not delete
Create UserSeralixer show id, username, fistname and lastname
Create viewSet
Set follwing endpoint
POST /api/users
GET /api/user
POST login username, passowrd gent token
POST register
```

## Prompt 7

```
so should apply folowing change

User should have role field with two value admin, user
Admin role can see mood-checkins for all users
User role only see mood-checkins berlong to user
/api/auth/register/ create user with user role
should include /api/users/me/ for see User record of logged user (IsAuthenticated)
remove endpoint GET /api/users it no unnecesary
GET /api/mood-checkins/ depding kind of token if role show all record insted of only assign to user
/api/mood-checkins/
use Select_releted because is relation one to one
```

## Prompt 8

```
apply change for MoodCheckIn

created_at and user must be read_only_fields
UniqueConstraint should return 400 bad reurst insted of 500
```
